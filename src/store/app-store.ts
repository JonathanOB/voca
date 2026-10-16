/**
 * In-memory copy of the local library plus settings.
 *
 * The data set is small (hundreds of rows), so the UI reads from memory for
 * instant rendering and every change is written through to SQLite.
 */
import { create } from 'zustand';

import { FAVOURITES_BOARD_ID, STD_BUTTONS, STD_CONTENT_VERSION, stdBoardId } from '@/data/standard-content';
import { getDb } from '@/db/database';
import * as repo from '@/db/repo';
import { seedStandardContent, type SeedMode } from '@/db/seed';
import type { Board, BoardItem, Button, LibraryData, Routine, RoutineStep } from '@/db/types';
import { detectDeviceLanguage } from '@/i18n/languages';
import { newId } from '@/services/ids';
import { collectGarbage, eraseAllMedia } from '@/services/media';
import { setHapticsEnabled } from '@/services/haptics';
import { listVoices, type DeviceVoice } from '@/services/speech';
import { DEFAULT_SETTINGS, normalizeSettings, type Settings } from './settings';

const SETTINGS_KEY = 'settings';
const CONTENT_VERSION_KEY = 'stdContentVersion';

export interface AppState {
  ready: boolean;
  bootError: string | null;
  settings: Settings;
  buttons: Record<string, Button>;
  boards: Board[];
  items: Record<string, BoardItem[]>;
  routines: Routine[];
  steps: Record<string, RoutineStep[]>;
  voices: DeviceVoice[];
  voicesLoaded: boolean;

  bootstrap: () => Promise<void>;
  reload: () => Promise<void>;
  refreshVoices: () => Promise<void>;

  updateSettings: (patch: Partial<Settings>) => void;

  saveButton: (btn: Button, opts?: { addToBoard?: string; favourite?: boolean }) => Promise<void>;
  removeItem: (boardId: string, itemId: string) => Promise<void>;
  setItemHidden: (boardId: string, itemId: string, hidden: boolean) => Promise<void>;
  moveItem: (boardId: string, itemId: string, delta: number) => Promise<void>;
  addExistingButton: (boardId: string, buttonId: string) => Promise<void>;
  toggleFavourite: (buttonId: string) => Promise<boolean>;
  forkButtonForBoard: (boardId: string, itemId: string) => Promise<string | null>;

  saveBoard: (board: Board) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  duplicateBoard: (boardId: string, name: string) => Promise<string | null>;
  moveBoard: (boardId: string, delta: number) => Promise<void>;

  saveRoutine: (routine: Routine, steps: RoutineStep[]) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
  duplicateRoutine: (routineId: string, name: string) => Promise<string | null>;
  setStepDone: (routineId: string, stepId: string, done: boolean) => Promise<void>;
  resetRoutine: (routineId: string) => Promise<void>;

  restoreStandard: (mode: Exclude<SeedMode, 'install'>) => Promise<void>;
  replaceEverything: (data: LibraryData, settings: Settings) => Promise<void>;
  eraseEverything: () => Promise<void>;
}

function groupItems(items: BoardItem[]) {
  const out: Record<string, BoardItem[]> = {};
  for (const it of items) (out[it.boardId] ??= []).push(it);
  for (const k of Object.keys(out)) out[k].sort((a, b) => a.position - b.position);
  return out;
}

function groupSteps(steps: RoutineStep[]) {
  const out: Record<string, RoutineStep[]> = {};
  for (const s of steps) (out[s.routineId] ??= []).push(s);
  for (const k of Object.keys(out)) out[k].sort((a, b) => a.position - b.position);
  return out;
}

function sortBoards(boards: Board[]) {
  return [...boards].sort((a, b) => a.sort - b.sort || a.createdAt - b.createdAt);
}

function sortRoutines(r: Routine[]) {
  return [...r].sort((a, b) => a.sort - b.sort || a.createdAt - b.createdAt);
}

let settingsTimer: ReturnType<typeof setTimeout> | null = null;

export const useApp = create<AppState>((set, get) => {
  const applyLibrary = (lib: LibraryData) => {
    set({
      buttons: Object.fromEntries(lib.buttons.map((b) => [b.id, b])),
      boards: sortBoards(lib.boards),
      items: groupItems(lib.items),
      routines: sortRoutines(lib.routines),
      steps: groupSteps(lib.steps),
    });
  };

  const persistSettings = () => {
    if (settingsTimer) clearTimeout(settingsTimer);
    settingsTimer = setTimeout(() => {
      repo.setKV(SETTINGS_KEY, get().settings).catch(() => {});
    }, 250);
  };

  /** Removes media files nothing references any more. */
  const gc = () => {
    const s = get();
    const refs = new Set<string>();
    Object.values(s.buttons).forEach((b) => {
      if (b.photo) refs.add(b.photo);
      if (b.audio) refs.add(b.audio);
    });
    s.boards.forEach((b) => b.photo && refs.add(b.photo));
    s.routines.forEach((r) => r.photo && refs.add(r.photo));
    Object.values(s.steps)
      .flat()
      .forEach((st) => {
        if (st.photo) refs.add(st.photo);
        if (st.audio) refs.add(st.audio);
      });
    try {
      collectGarbage(refs);
    } catch {
      // best effort
    }
  };

  /** Deletes a custom button once nothing (board or step) references it. */
  const deleteIfOrphan = async (buttonId: string) => {
    const s = get();
    const btn = s.buttons[buttonId];
    if (!btn || btn.isStandard) return;
    const usedOnBoard = Object.values(s.items).some((list) => list.some((i) => i.buttonId === buttonId));
    const usedInSteps = Object.values(s.steps).some((list) => list.some((st) => st.buttonId === buttonId));
    const usedInFirstThen = s.settings.firstThen.first === buttonId || s.settings.firstThen.then === buttonId;
    if (usedOnBoard || usedInSteps || usedInFirstThen || s.settings.choiceSet.includes(buttonId) || s.settings.quickWords.includes(buttonId)) return;
    await repo.deleteButtonRow(buttonId);
    const buttons = { ...get().buttons };
    delete buttons[buttonId];
    set({ buttons });
  };

  const writeItems = async (boardId: string, list: BoardItem[]) => {
    const normalized = list.map((it, i) => ({ ...it, position: i }));
    set({ items: { ...get().items, [boardId]: normalized } });
    await repo.replaceBoardItems(boardId, normalized);
  };

  return {
    ready: false,
    bootError: null,
    settings: DEFAULT_SETTINGS,
    buttons: {},
    boards: [],
    items: {},
    routines: [],
    steps: {},
    voices: [],
    voicesLoaded: false,

    bootstrap: async () => {
      try {
        const db = await getDb();
        const stored = await repo.getKV<Partial<Settings>>(SETTINGS_KEY);
        const count = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM boards');
        const contentVersion = (await repo.getKV<number>(CONTENT_VERSION_KEY)) ?? 1;
        if (!count || count.c === 0) {
          await seedStandardContent(db, 'install');
          await repo.setKV(CONTENT_VERSION_KEY, STD_CONTENT_VERSION);
        } else if (contentVersion < STD_CONTENT_VERSION) {
          // An app update brought new standard boards: add them without touching anything existing.
          await seedStandardContent(db, 'upgrade');
          await repo.setKV(CONTENT_VERSION_KEY, STD_CONTENT_VERSION);
        }
        const settings = normalizeSettings(stored ?? { language: detectDeviceLanguage() });
        if (!stored) await repo.setKV(SETTINGS_KEY, settings);
        const lib = await repo.loadLibrary();
        applyLibrary(lib);
        setHapticsEnabled(settings.haptics);
        set({ settings, ready: true, bootError: null });
        gc();
        get().refreshVoices();
      } catch (e) {
        set({ bootError: e instanceof Error ? e.message : String(e), ready: false });
      }
    },

    reload: async () => {
      const lib = await repo.loadLibrary();
      applyLibrary(lib);
    },

    refreshVoices: async () => {
      const voices = await listVoices();
      set({ voices, voicesLoaded: true });
      // Android loads its TTS engine lazily; try again shortly if the list came back empty.
      if (!voices.length) {
        setTimeout(async () => {
          const again = await listVoices();
          if (again.length) set({ voices: again });
        }, 2500);
      }
    },

    updateSettings: (patch) => {
      const settings = normalizeSettings({ ...get().settings, ...patch });
      if (patch.haptics !== undefined) setHapticsEnabled(settings.haptics);
      set({ settings });
      persistSettings();
    },

    saveButton: async (btn, opts = {}) => {
      const now = Date.now();
      const isNew = !get().buttons[btn.id];
      const next: Button = { ...btn, updatedAt: now, createdAt: isNew ? now : btn.createdAt };
      set({ buttons: { ...get().buttons, [next.id]: next } });
      await repo.upsertButton(next);
      if (opts.addToBoard) await get().addExistingButton(opts.addToBoard, next.id);
      const favs = get().items[FAVOURITES_BOARD_ID] ?? [];
      const isFav = favs.some((i) => i.buttonId === next.id);
      if (opts.favourite !== undefined && opts.favourite !== isFav && opts.addToBoard !== FAVOURITES_BOARD_ID) {
        await get().toggleFavourite(next.id);
      }
      gc();
    },

    addExistingButton: async (boardId, buttonId) => {
      const list = get().items[boardId] ?? [];
      const item: BoardItem = { id: newId('item'), boardId, buttonId, position: list.length, hidden: false };
      set({ items: { ...get().items, [boardId]: [...list, item] } });
      await repo.insertBoardItem(item);
    },

    removeItem: async (boardId, itemId) => {
      const list = get().items[boardId] ?? [];
      const item = list.find((i) => i.id === itemId);
      if (!item) return;
      await writeItems(
        boardId,
        list.filter((i) => i.id !== itemId),
      );
      await deleteIfOrphan(item.buttonId);
      gc();
    },

    setItemHidden: async (boardId, itemId, hidden) => {
      const list = (get().items[boardId] ?? []).map((i) => (i.id === itemId ? { ...i, hidden } : i));
      await writeItems(boardId, list);
    },

    moveItem: async (boardId, itemId, delta) => {
      const list = [...(get().items[boardId] ?? [])];
      const from = list.findIndex((i) => i.id === itemId);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= list.length) return;
      const [it] = list.splice(from, 1);
      list.splice(to, 0, it);
      await writeItems(boardId, list);
    },

    toggleFavourite: async (buttonId) => {
      const favs = get().items[FAVOURITES_BOARD_ID] ?? [];
      const existing = favs.find((i) => i.buttonId === buttonId);
      if (existing) {
        await writeItems(
          FAVOURITES_BOARD_ID,
          favs.filter((i) => i.id !== existing.id),
        );
        await deleteIfOrphan(buttonId);
        return false;
      }
      await get().addExistingButton(FAVOURITES_BOARD_ID, buttonId);
      return true;
    },

    forkButtonForBoard: async (boardId, itemId) => {
      const s = get();
      const list = s.items[boardId] ?? [];
      const item = list.find((i) => i.id === itemId);
      const btn = item && s.buttons[item.buttonId];
      if (!item || !btn) return null;
      const copy: Button = {
        ...btn,
        id: newId('btn'),
        isStandard: false,
        // Keep the visible wording when forking a standard button.
        label: btn.label,
        stdKey: btn.stdKey,
      };
      await repo.upsertButton(copy);
      set({ buttons: { ...get().buttons, [copy.id]: copy } });
      await writeItems(
        boardId,
        list.map((i) => (i.id === itemId ? { ...i, buttonId: copy.id } : i)),
      );
      return copy.id;
    },

    saveBoard: async (board) => {
      const now = Date.now();
      const exists = get().boards.some((b) => b.id === board.id);
      const next = { ...board, updatedAt: now, createdAt: exists ? board.createdAt : now };
      const boards = sortBoards(exists ? get().boards.map((b) => (b.id === next.id ? next : b)) : [...get().boards, next]);
      set({ boards });
      await repo.upsertBoard(next);
      gc();
    },

    deleteBoard: async (boardId) => {
      const s = get();
      const board = s.boards.find((b) => b.id === boardId);
      if (!board) return;
      const buttonIds = (s.items[boardId] ?? []).map((i) => i.buttonId);
      if (board.isStandard) {
        // Standard boards are hidden rather than deleted so they can be restored.
        await get().saveBoard({ ...board, hidden: true });
        return;
      }
      const items = { ...s.items };
      delete items[boardId];
      set({ boards: s.boards.filter((b) => b.id !== boardId), items });
      await repo.deleteBoardRow(boardId);
      for (const id of new Set(buttonIds)) await deleteIfOrphan(id);
      gc();
    },

    duplicateBoard: async (boardId, name) => {
      const s = get();
      const board = s.boards.find((b) => b.id === boardId);
      if (!board) return null;
      const id = newId('board');
      const maxSort = Math.max(0, ...s.boards.map((b) => b.sort));
      const copy: Board = {
        ...board,
        id,
        stdKey: null,
        name,
        section: 'custom',
        isStandard: false,
        hidden: false,
        sort: maxSort + 1,
        tone: board.tone,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await get().saveBoard(copy);
      // Items reuse the same buttons (stable IDs) so content is not duplicated.
      const items = (s.items[boardId] ?? []).map((it, i) => ({ ...it, id: newId('item'), boardId: id, position: i }));
      await writeItems(id, items);
      return id;
    },

    moveBoard: async (boardId, delta) => {
      const s = get();
      const board = s.boards.find((b) => b.id === boardId);
      if (!board) return;
      const peers = s.boards.filter((b) => b.section === board.section);
      const from = peers.findIndex((b) => b.id === boardId);
      const to = from + delta;
      if (to < 0 || to >= peers.length) return;
      const reordered = [...peers];
      const [x] = reordered.splice(from, 1);
      reordered.splice(to, 0, x);
      const baseSort = Math.min(...peers.map((p) => p.sort));
      const updates = reordered.map((b, i) => ({ ...b, sort: baseSort + i }));
      const map = new Map(updates.map((u) => [u.id, u]));
      set({ boards: sortBoards(s.boards.map((b) => map.get(b.id) ?? b)) });
      await repo.updateBoardSorts(updates);
    },

    saveRoutine: async (routine, steps) => {
      const now = Date.now();
      const exists = get().routines.some((r) => r.id === routine.id);
      const next = { ...routine, updatedAt: now, createdAt: exists ? routine.createdAt : now };
      const normalized = steps.map((st, i) => ({ ...st, routineId: next.id, position: i }));
      set({
        routines: sortRoutines(exists ? get().routines.map((r) => (r.id === next.id ? next : r)) : [...get().routines, next]),
        steps: { ...get().steps, [next.id]: normalized },
      });
      await repo.upsertRoutine(next);
      await repo.replaceRoutineSteps(next.id, normalized);
      gc();
    },

    deleteRoutine: async (routineId) => {
      const s = get();
      const r = s.routines.find((x) => x.id === routineId);
      if (!r) return;
      if (r.isStandard) {
        await get().saveRoutine({ ...r, hidden: true }, s.steps[routineId] ?? []);
        return;
      }
      const steps = { ...s.steps };
      const buttonIds = (steps[routineId] ?? []).map((st) => st.buttonId).filter(Boolean) as string[];
      delete steps[routineId];
      set({ routines: s.routines.filter((x) => x.id !== routineId), steps });
      await repo.deleteRoutineRow(routineId);
      for (const id of new Set(buttonIds)) await deleteIfOrphan(id);
      gc();
    },

    duplicateRoutine: async (routineId, name) => {
      const s = get();
      const r = s.routines.find((x) => x.id === routineId);
      if (!r) return null;
      const id = newId('routine');
      const copy: Routine = {
        ...r,
        id,
        stdKey: null,
        name,
        isStandard: false,
        hidden: false,
        sort: Math.max(0, ...s.routines.map((x) => x.sort)) + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      // Standard step wording is kept as a reference to the translated label.
      const steps = (s.steps[routineId] ?? []).map((st) => ({ ...st, id: newId('step'), routineId: id, done: false }));
      await get().saveRoutine(copy, steps);
      return id;
    },

    setStepDone: async (routineId, stepId, done) => {
      const list = (get().steps[routineId] ?? []).map((st) => (st.id === stepId ? { ...st, done } : st));
      set({ steps: { ...get().steps, [routineId]: list } });
      await repo.setStepsDone([stepId], done);
    },

    resetRoutine: async (routineId) => {
      const list = (get().steps[routineId] ?? []).map((st) => ({ ...st, done: false }));
      set({ steps: { ...get().steps, [routineId]: list } });
      await repo.setStepsDone(
        list.map((s) => s.id),
        false,
      );
    },

    restoreStandard: async (mode) => {
      const db = await getDb();
      await seedStandardContent(db, mode);
      await get().reload();
      gc();
    },

    replaceEverything: async (data, settings) => {
      await repo.replaceLibrary(data);
      // A backup from an older version may predate some standard boards; add those back.
      await seedStandardContent(await getDb(), 'upgrade');
      await repo.setKV(CONTENT_VERSION_KEY, STD_CONTENT_VERSION);
      const next = normalizeSettings({ ...settings, onboardingDone: true });
      await repo.setKV(SETTINGS_KEY, next);
      setHapticsEnabled(next.haptics);
      set({ settings: next });
      await get().reload();
      gc();
    },

    eraseEverything: async () => {
      await repo.eraseAll();
      eraseAllMedia();
      const db = await getDb();
      await seedStandardContent(db, 'install');
      await repo.setKV(CONTENT_VERSION_KEY, STD_CONTENT_VERSION);
      const settings = normalizeSettings({ language: get().settings.language });
      await repo.setKV(SETTINGS_KEY, settings);
      set({ settings });
      await get().reload();
    },
  };
});

/** Ordered, visible items for a board. */
export function selectBoardItems(state: AppState, boardId: string, includeHidden = false) {
  const list = state.items[boardId] ?? [];
  return includeHidden ? list : list.filter((i) => !i.hidden);
}

export function isFavourite(state: AppState, buttonId: string) {
  return (state.items[FAVOURITES_BOARD_ID] ?? []).some((i) => i.buttonId === buttonId);
}

/** Boards that use a given button (for "this change affects N boards"). */
export function boardsUsingButton(state: AppState, buttonId: string) {
  return state.boards.filter((b) => (state.items[b.id] ?? []).some((i) => i.buttonId === buttonId));
}

export function isStdButtonKey(key: string) {
  return key in STD_BUTTONS;
}

export { FAVOURITES_BOARD_ID, stdBoardId };
