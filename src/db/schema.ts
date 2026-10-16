/**
 * Versioned local schema. Each migration moves the database forward by one
 * version and must preserve user-created rows. Never edit a shipped migration;
 * append a new one instead.
 */
export interface Migration {
  version: number;
  description: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Initial schema: settings, buttons, boards, board items, routines, routine steps',
    sql: `
CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS buttons (
  id TEXT PRIMARY KEY NOT NULL,
  std_key TEXT,
  label TEXT,
  spoken TEXT,
  lang TEXT,
  symbol TEXT,
  photo TEXT,
  audio TEXT,
  type TEXT NOT NULL DEFAULT 'misc',
  is_standard INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY NOT NULL,
  std_key TEXT,
  name TEXT,
  description TEXT,
  section TEXT NOT NULL,
  symbol TEXT,
  photo TEXT,
  color TEXT NOT NULL DEFAULT 'purple',
  is_standard INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  tap_action TEXT,
  tone TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS board_items (
  id TEXT PRIMARY KEY NOT NULL,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  button_id TEXT NOT NULL REFERENCES buttons(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_board_items_board ON board_items(board_id, position);
CREATE INDEX IF NOT EXISTS idx_board_items_button ON board_items(button_id);

CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY NOT NULL,
  std_key TEXT,
  name TEXT,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'routine',
  symbol TEXT,
  photo TEXT,
  color TEXT NOT NULL DEFAULT 'green',
  is_standard INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS routine_steps (
  id TEXT PRIMARY KEY NOT NULL,
  routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  button_id TEXT REFERENCES buttons(id) ON DELETE SET NULL,
  std_key TEXT,
  label TEXT,
  spoken TEXT,
  symbol TEXT,
  photo TEXT,
  audio TEXT,
  done INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_steps_routine ON routine_steps(routine_id, position);
`,
  },
  {
    version: 2,
    description:
      'Align standard word types with the Modified Fitzgerald Key. Only rows still holding their original type are changed, so user choices are kept.',
    sql: [
      ['it', 'thing', 'people'],
      ['that', 'thing', 'people'],
      ['this_one', 'thing', 'people'],
      ['that_one', 'thing', 'people'],
      ['here', 'place', 'time'],
      ['there', 'place', 'time'],
      ['again', 'describe', 'time'],
      ['finished', 'time', 'social'],
      ['wait', 'time', 'action'],
      ['more_time', 'time', 'action'],
      ['wake_up', 'time', 'action'],
      ['different_plan', 'time', 'thing'],
      ['change', 'time', 'thing'],
      ['change_of_plan', 'time', 'thing'],
      ['bedtime', 'time', 'thing'],
      ['unexpected', 'time', 'describe'],
    ]
      .map(([key, from, to]) => `UPDATE buttons SET type = '${to}' WHERE is_standard = 1 AND std_key = '${key}' AND type = '${from}';`)
      .join('\n'),
  },
  {
    version: 3,
    description: 'Word forms on buttons; times and reminders on schedule steps.',
    sql: `
ALTER TABLE buttons ADD COLUMN forms TEXT;
ALTER TABLE routine_steps ADD COLUMN time TEXT;
ALTER TABLE routine_steps ADD COLUMN remind_before INTEGER;
`,
  },
];

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;
