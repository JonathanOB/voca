/**
 * All reads and writes to the local database go through here.
 * The UI keeps an in-memory copy (see store/app-store.ts) and calls these to persist.
 */
import { getDb } from './database';
import {
  BOARD_COLS,
  BUTTON_COLS,
  ITEM_COLS,
  ROUTINE_COLS,
  STEP_COLS,
  boardFromRow,
  boardParams,
  buttonFromRow,
  buttonParams,
  itemFromRow,
  itemParams,
  placeholders,
  routineFromRow,
  routineParams,
  stepFromRow,
  stepParams,
} from './rows';
import type { Board, BoardItem, Button, LibraryData, Routine, RoutineStep } from './types';

export async function loadLibrary(): Promise<LibraryData> {
  const db = await getDb();
  const [buttons, boards, items, routines, steps] = await Promise.all([
    db.getAllAsync<Record<string, any>>('SELECT * FROM buttons'),
    db.getAllAsync<Record<string, any>>('SELECT * FROM boards ORDER BY sort, created_at'),
    db.getAllAsync<Record<string, any>>('SELECT * FROM board_items ORDER BY board_id, position'),
    db.getAllAsync<Record<string, any>>('SELECT * FROM routines ORDER BY sort, created_at'),
    db.getAllAsync<Record<string, any>>('SELECT * FROM routine_steps ORDER BY routine_id, position'),
  ]);
  return {
    buttons: buttons.map(buttonFromRow),
    boards: boards.map(boardFromRow),
    items: items.map(itemFromRow),
    routines: routines.map(routineFromRow),
    steps: steps.map(stepFromRow),
  };
}

// --- key/value -------------------------------------------------------------

export async function getKV<T>(key: string): Promise<T | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', key);
  if (!row) return null;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export async function setKV(key: string, value: unknown) {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', key, JSON.stringify(value));
}

// --- buttons ---------------------------------------------------------------

export async function upsertButton(x: Button) {
  const db = await getDb();
  await db.runAsync(`INSERT OR REPLACE INTO buttons (${BUTTON_COLS}) VALUES (${placeholders(BUTTON_COLS)})`, buttonParams(x));
}

export async function deleteButtonRow(id: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM buttons WHERE id = ?', id);
}

// --- boards ----------------------------------------------------------------

export async function upsertBoard(x: Board) {
  const db = await getDb();
  await db.runAsync(`INSERT OR REPLACE INTO boards (${BOARD_COLS}) VALUES (${placeholders(BOARD_COLS)})`, boardParams(x));
}

export async function deleteBoardRow(id: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM boards WHERE id = ?', id);
}

export async function updateBoardSorts(boards: Pick<Board, 'id' | 'sort'>[]) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const b of boards) await db.runAsync('UPDATE boards SET sort = ? WHERE id = ?', b.sort, b.id);
  });
}

// --- board items -----------------------------------------------------------

/** Replaces the full ordered item list for a board. */
export async function replaceBoardItems(boardId: string, items: BoardItem[]) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM board_items WHERE board_id = ?', boardId);
    for (const it of items) {
      await db.runAsync(`INSERT INTO board_items (${ITEM_COLS}) VALUES (${placeholders(ITEM_COLS)})`, itemParams(it));
    }
  });
}

export async function insertBoardItem(it: BoardItem) {
  const db = await getDb();
  await db.runAsync(`INSERT OR REPLACE INTO board_items (${ITEM_COLS}) VALUES (${placeholders(ITEM_COLS)})`, itemParams(it));
}

export async function deleteBoardItemRow(id: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM board_items WHERE id = ?', id);
}

// --- routines --------------------------------------------------------------

export async function upsertRoutine(x: Routine) {
  const db = await getDb();
  await db.runAsync(`INSERT OR REPLACE INTO routines (${ROUTINE_COLS}) VALUES (${placeholders(ROUTINE_COLS)})`, routineParams(x));
}

export async function deleteRoutineRow(id: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM routines WHERE id = ?', id);
}

export async function replaceRoutineSteps(routineId: string, steps: RoutineStep[]) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM routine_steps WHERE routine_id = ?', routineId);
    for (const s of steps) {
      await db.runAsync(`INSERT INTO routine_steps (${STEP_COLS}) VALUES (${placeholders(STEP_COLS)})`, stepParams(s));
    }
  });
}

export async function setStepsDone(ids: string[], done: boolean) {
  if (!ids.length) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const id of ids) await db.runAsync('UPDATE routine_steps SET done = ? WHERE id = ?', done ? 1 : 0, id);
  });
}

// --- whole library (restore) -------------------------------------------------

export async function replaceLibrary(data: LibraryData) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM routine_steps; DELETE FROM routines; DELETE FROM board_items; DELETE FROM boards; DELETE FROM buttons;');
    for (const x of data.buttons)
      await db.runAsync(`INSERT INTO buttons (${BUTTON_COLS}) VALUES (${placeholders(BUTTON_COLS)})`, buttonParams(x));
    for (const x of data.boards)
      await db.runAsync(`INSERT INTO boards (${BOARD_COLS}) VALUES (${placeholders(BOARD_COLS)})`, boardParams(x));
    for (const x of data.items)
      await db.runAsync(`INSERT INTO board_items (${ITEM_COLS}) VALUES (${placeholders(ITEM_COLS)})`, itemParams(x));
    for (const x of data.routines)
      await db.runAsync(`INSERT INTO routines (${ROUTINE_COLS}) VALUES (${placeholders(ROUTINE_COLS)})`, routineParams(x));
    for (const x of data.steps)
      await db.runAsync(`INSERT INTO routine_steps (${STEP_COLS}) VALUES (${placeholders(STEP_COLS)})`, stepParams(x));
  });
}

/** Erases every table (full local reset). */
export async function eraseAll() {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.execAsync(
      'DELETE FROM routine_steps; DELETE FROM routines; DELETE FROM board_items; DELETE FROM boards; DELETE FROM buttons; DELETE FROM kv;',
    );
  });
}
