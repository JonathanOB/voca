import type { SQLiteDatabase } from 'expo-sqlite';

import {
  STD_BOARDS,
  STD_BUTTONS,
  STD_ROUTINES,
  STD_STEPS,
  stdBoardId,
  stdButtonId,
  stdItemId,
  stdRoutineId,
  stdStepId,
} from '@/data/standard-content';
import { symbolId } from '@/data/symbols';
import {
  BOARD_COLS,
  BUTTON_COLS,
  ITEM_COLS,
  ROUTINE_COLS,
  STEP_COLS,
  boardParams,
  buttonParams,
  itemParams,
  placeholders,
  routineParams,
  stepParams,
} from './rows';
import type { LibraryData } from './types';

/** Builds the full standard library as rows (pure, so it can be unit tested). */
export function buildStandardContent(now: number): LibraryData {
  const buttons = Object.entries(STD_BUTTONS).map(([key, def]) => ({
    id: stdButtonId(key),
    stdKey: key,
    label: null,
    spoken: null,
    lang: null,
    symbol: symbolId(def.sym),
    photo: null,
    audio: null,
    type: def.type,
    isStandard: true,
    createdAt: now,
    updatedAt: now,
  }));

  const boards = STD_BOARDS.map((def, i) => ({
    id: stdBoardId(def.key),
    stdKey: def.key,
    name: null,
    description: null,
    section: def.section,
    symbol: symbolId(def.sym),
    photo: null,
    color: def.color,
    isStandard: true,
    hidden: false,
    sort: i,
    tapAction: def.tapAction ?? null,
    tone: def.tone ?? null,
    createdAt: now,
    updatedAt: now,
  }));

  const items = STD_BOARDS.flatMap((def) =>
    def.buttons.map((key, position) => {
      if (!STD_BUTTONS[key]) throw new Error(`Board ${def.key} references unknown button ${key}`);
      return {
        id: stdItemId(def.key, key),
        boardId: stdBoardId(def.key),
        buttonId: stdButtonId(key),
        position,
        hidden: false,
      };
    }),
  );

  const routines = STD_ROUTINES.map((def, i) => ({
    id: stdRoutineId(def.key),
    stdKey: def.key,
    name: null,
    description: null,
    kind: def.kind,
    symbol: symbolId(def.sym),
    photo: null,
    color: def.color,
    isStandard: true,
    hidden: false,
    sort: i,
    createdAt: now,
    updatedAt: now,
  }));

  const steps = STD_ROUTINES.flatMap((def) =>
    def.steps.map((key, position) => {
      const isButton = def.kind === 'schedule';
      if (isButton && !STD_BUTTONS[key]) throw new Error(`Schedule ${def.key} references unknown button ${key}`);
      if (!isButton && !STD_STEPS[key]) throw new Error(`Routine ${def.key} references unknown step ${key}`);
      return {
        id: stdStepId(def.key, position),
        routineId: stdRoutineId(def.key),
        position,
        buttonId: isButton ? stdButtonId(key) : null,
        stdKey: isButton ? null : key,
        label: null,
        spoken: null,
        symbol: isButton ? null : symbolId(STD_STEPS[key]),
        photo: null,
        audio: null,
        done: false,
      };
    }),
  );

  return { buttons, boards, items, routines, steps };
}

export type SeedMode = 'install' | 'upgrade' | 'restoreMissing' | 'resetOriginal';

/**
 * install         first launch: insert everything.
 * upgrade         app update: add standard boards/routines that did not exist before
 *                 (with their items/steps) and any new buttons. Nothing existing changes,
 *                 and items the user removed from existing boards stay removed.
 * restoreMissing  re-add deleted or hidden standard boards, buttons, routines. Edits are kept.
 * resetOriginal   restoreMissing + undo edits to standard wording, images, order and routine steps.
 *
 * Custom buttons, custom boards and custom routines are never touched.
 */
export async function seedStandardContent(db: SQLiteDatabase, mode: SeedMode, now = Date.now()) {
  const std = buildStandardContent(now);
  const existingBoards = new Set((await db.getAllAsync<{ id: string }>('SELECT id FROM boards')).map((r) => r.id));
  const existingRoutines = new Set((await db.getAllAsync<{ id: string }>('SELECT id FROM routines')).map((r) => r.id));

  await db.withTransactionAsync(async () => {
    for (const x of std.buttons) {
      await db.runAsync(
        `INSERT OR IGNORE INTO buttons (${BUTTON_COLS}) VALUES (${placeholders(BUTTON_COLS)})`,
        buttonParams(x),
      );
    }
    for (const x of std.boards) {
      await db.runAsync(
        `INSERT OR IGNORE INTO boards (${BOARD_COLS}) VALUES (${placeholders(BOARD_COLS)})`,
        boardParams(x),
      );
    }
    for (const x of std.routines) {
      await db.runAsync(
        `INSERT OR IGNORE INTO routines (${ROUTINE_COLS}) VALUES (${placeholders(ROUTINE_COLS)})`,
        routineParams(x),
      );
    }

    if (mode === 'upgrade') {
      // Only boards and routines that are new in this version get their standard items and steps.
      for (const x of std.items.filter((i) => !existingBoards.has(i.boardId))) {
        await db.runAsync(`INSERT OR IGNORE INTO board_items (${ITEM_COLS}) VALUES (${placeholders(ITEM_COLS)})`, itemParams(x));
      }
      for (const x of std.steps.filter((s) => !existingRoutines.has(s.routineId))) {
        await db.runAsync(`INSERT OR IGNORE INTO routine_steps (${STEP_COLS}) VALUES (${placeholders(STEP_COLS)})`, stepParams(x));
      }
      return;
    }

    if (mode === 'install') {
      for (const x of std.items) {
        await db.runAsync(`INSERT OR IGNORE INTO board_items (${ITEM_COLS}) VALUES (${placeholders(ITEM_COLS)})`, itemParams(x));
      }
      for (const x of std.steps) {
        await db.runAsync(`INSERT OR IGNORE INTO routine_steps (${STEP_COLS}) VALUES (${placeholders(STEP_COLS)})`, stepParams(x));
      }
      return;
    }

    // Un-hide standard boards and routines.
    await db.runAsync('UPDATE boards SET hidden = 0 WHERE is_standard = 1');
    await db.runAsync('UPDATE routines SET hidden = 0 WHERE is_standard = 1');

    if (mode === 'restoreMissing') {
      // Append any deleted standard items to the end of their board; un-hide hidden ones.
      for (const x of std.items) {
        const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM board_items WHERE id = ?', x.id);
        if (existing) {
          await db.runAsync('UPDATE board_items SET hidden = 0 WHERE id = ?', x.id);
          continue;
        }
        const max = await db.getFirstAsync<{ m: number | null }>(
          'SELECT MAX(position) AS m FROM board_items WHERE board_id = ?',
          x.boardId,
        );
        await db.runAsync(`INSERT INTO board_items (${ITEM_COLS}) VALUES (${placeholders(ITEM_COLS)})`, itemParams({
          ...x,
          position: (max?.m ?? -1) + 1,
        }));
      }
      // Restore standard routines that lost all their steps.
      for (const r of std.routines) {
        const count = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM routine_steps WHERE routine_id = ?', r.id);
        if ((count?.c ?? 0) > 0) continue;
        for (const s of std.steps.filter((s) => s.routineId === r.id)) {
          await db.runAsync(`INSERT OR REPLACE INTO routine_steps (${STEP_COLS}) VALUES (${placeholders(STEP_COLS)})`, stepParams(s));
        }
      }
      return;
    }

    // resetOriginal: undo edits to standard content.
    for (const x of std.buttons) {
      await db.runAsync(
        'UPDATE buttons SET label = NULL, spoken = NULL, lang = NULL, symbol = ?, photo = NULL, audio = NULL, type = ?, forms = NULL, updated_at = ? WHERE id = ?',
        x.symbol,
        x.type,
        now,
        x.id,
      );
    }
    for (const x of std.boards) {
      await db.runAsync(
        'UPDATE boards SET name = NULL, description = NULL, section = ?, symbol = ?, photo = NULL, color = ?, hidden = 0, sort = ?, tap_action = ?, tone = ?, updated_at = ? WHERE id = ?',
        x.section,
        x.symbol,
        x.color,
        x.sort,
        x.tapAction,
        x.tone,
        now,
        x.id,
      );
      // Standard items back in original order; custom items keep their order after them.
      const stdItems = std.items.filter((i) => i.boardId === x.id);
      await db.runAsync(`DELETE FROM board_items WHERE board_id = ? AND id LIKE 'std:item:%'`, x.id);
      for (const it of stdItems) {
        await db.runAsync(`INSERT INTO board_items (${ITEM_COLS}) VALUES (${placeholders(ITEM_COLS)})`, itemParams(it));
      }
      const custom = await db.getAllAsync<{ id: string }>(
        `SELECT id FROM board_items WHERE board_id = ? AND id NOT LIKE 'std:item:%' ORDER BY position`,
        x.id,
      );
      for (let i = 0; i < custom.length; i++) {
        await db.runAsync('UPDATE board_items SET position = ? WHERE id = ?', stdItems.length + i, custom[i].id);
      }
    }
    for (const r of std.routines) {
      await db.runAsync(
        'UPDATE routines SET name = NULL, description = NULL, kind = ?, symbol = ?, photo = NULL, color = ?, hidden = 0, sort = ?, updated_at = ? WHERE id = ?',
        r.kind,
        r.symbol,
        r.color,
        r.sort,
        now,
        r.id,
      );
      await db.runAsync('DELETE FROM routine_steps WHERE routine_id = ?', r.id);
      for (const s of std.steps.filter((s) => s.routineId === r.id)) {
        await db.runAsync(`INSERT INTO routine_steps (${STEP_COLS}) VALUES (${placeholders(STEP_COLS)})`, stepParams(s));
      }
    }
  });
}
