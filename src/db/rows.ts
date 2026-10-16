/** Mapping between SQLite rows (snake_case) and app models (camelCase). */
import type { CardColor, WordType } from '@/theme/colors';
import type { TapAction } from '@/store/settings';
import type { Board, BoardItem, BoardSection, Button, Routine, RoutineKind, RoutineStep } from './types';

type Row = Record<string, any>;

const b = (v: unknown) => v === 1 || v === true;
const n = (v: boolean) => (v ? 1 : 0);

function parseForms(v: unknown): string[] | null {
  if (typeof v !== 'string' || !v) return null;
  try {
    const arr = JSON.parse(v);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string' && !!x.trim()) : null;
  } catch {
    return null;
  }
}

const formsParam = (forms: string[] | null | undefined) => (forms && forms.length ? JSON.stringify(forms) : null);

export const buttonFromRow = (r: Row): Button => ({
  id: r.id,
  stdKey: r.std_key ?? null,
  label: r.label ?? null,
  spoken: r.spoken ?? null,
  lang: r.lang ?? null,
  symbol: r.symbol ?? null,
  photo: r.photo ?? null,
  audio: r.audio ?? null,
  type: (r.type ?? 'misc') as WordType,
  forms: parseForms(r.forms),
  isStandard: b(r.is_standard),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const buttonParams = (x: Button) => [
  x.id,
  x.stdKey,
  x.label,
  x.spoken,
  x.lang,
  x.symbol,
  x.photo,
  x.audio,
  x.type,
  formsParam(x.forms),
  n(x.isStandard),
  x.createdAt,
  x.updatedAt,
];
export const BUTTON_COLS =
  'id, std_key, label, spoken, lang, symbol, photo, audio, type, forms, is_standard, created_at, updated_at';

export const boardFromRow = (r: Row): Board => ({
  id: r.id,
  stdKey: r.std_key ?? null,
  name: r.name ?? null,
  description: r.description ?? null,
  section: r.section as BoardSection,
  symbol: r.symbol ?? null,
  photo: r.photo ?? null,
  color: (r.color ?? 'purple') as CardColor,
  isStandard: b(r.is_standard),
  hidden: b(r.hidden),
  sort: r.sort ?? 0,
  tapAction: (r.tap_action ?? null) as TapAction | null,
  tone: r.tone === 'urgent' ? 'urgent' : null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const boardParams = (x: Board) => [
  x.id,
  x.stdKey,
  x.name,
  x.description,
  x.section,
  x.symbol,
  x.photo,
  x.color,
  n(x.isStandard),
  n(x.hidden),
  x.sort,
  x.tapAction,
  x.tone,
  x.createdAt,
  x.updatedAt,
];
export const BOARD_COLS =
  'id, std_key, name, description, section, symbol, photo, color, is_standard, hidden, sort, tap_action, tone, created_at, updated_at';

export const itemFromRow = (r: Row): BoardItem => ({
  id: r.id,
  boardId: r.board_id,
  buttonId: r.button_id,
  position: r.position,
  hidden: b(r.hidden),
});
export const itemParams = (x: BoardItem) => [x.id, x.boardId, x.buttonId, x.position, n(x.hidden)];
export const ITEM_COLS = 'id, board_id, button_id, position, hidden';

export const routineFromRow = (r: Row): Routine => ({
  id: r.id,
  stdKey: r.std_key ?? null,
  name: r.name ?? null,
  description: r.description ?? null,
  kind: (r.kind ?? 'routine') as RoutineKind,
  symbol: r.symbol ?? null,
  photo: r.photo ?? null,
  color: (r.color ?? 'green') as CardColor,
  isStandard: b(r.is_standard),
  hidden: b(r.hidden),
  sort: r.sort ?? 0,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});
export const routineParams = (x: Routine) => [
  x.id,
  x.stdKey,
  x.name,
  x.description,
  x.kind,
  x.symbol,
  x.photo,
  x.color,
  n(x.isStandard),
  n(x.hidden),
  x.sort,
  x.createdAt,
  x.updatedAt,
];
export const ROUTINE_COLS =
  'id, std_key, name, description, kind, symbol, photo, color, is_standard, hidden, sort, created_at, updated_at';

export const stepFromRow = (r: Row): RoutineStep => ({
  id: r.id,
  routineId: r.routine_id,
  position: r.position,
  buttonId: r.button_id ?? null,
  stdKey: r.std_key ?? null,
  label: r.label ?? null,
  spoken: r.spoken ?? null,
  symbol: r.symbol ?? null,
  photo: r.photo ?? null,
  audio: r.audio ?? null,
  done: b(r.done),
  time: typeof r.time === 'string' && /^\d{2}:\d{2}$/.test(r.time) ? r.time : null,
  remindBefore: typeof r.remind_before === 'number' ? r.remind_before : null,
});
export const stepParams = (x: RoutineStep) => [
  x.id,
  x.routineId,
  x.position,
  x.buttonId,
  x.stdKey,
  x.label,
  x.spoken,
  x.symbol,
  x.photo,
  x.audio,
  n(x.done),
  x.time ?? null,
  x.remindBefore ?? null,
];
export const STEP_COLS = 'id, routine_id, position, button_id, std_key, label, spoken, symbol, photo, audio, done, time, remind_before';

export const placeholders = (cols: string) =>
  cols
    .split(',')
    .map(() => '?')
    .join(', ');
