import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

import { MIGRATIONS, SCHEMA_VERSION } from './schema';

export const DB_NAME = 'voca.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate().catch((e) => {
      dbPromise = null;
      throw e;
    });
  }
  return dbPromise;
}

async function openAndMigrate() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  if (Platform.OS !== 'web') {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  }
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await migrate(db);
  return db;
}

/** Applies pending migrations inside a transaction each; returns the version before migrating. */
export async function migrate(db: SQLite.SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const from = row?.user_version ?? 0;
  if (from > SCHEMA_VERSION) {
    throw new Error(
      `This database was created by a newer version of Voca (schema ${from}). Please update the app.`,
    );
  }
  for (const m of MIGRATIONS) {
    if (m.version <= from) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(m.sql);
      await db.execAsync(`PRAGMA user_version = ${m.version}`);
    });
  }
  return from;
}

/** Closes the connection (used before replacing the whole database during restore/reset). */
export async function closeDb() {
  if (!dbPromise) return;
  try {
    const db = await dbPromise;
    await db.closeAsync();
  } catch {
    // already closed
  }
  dbPromise = null;
}
