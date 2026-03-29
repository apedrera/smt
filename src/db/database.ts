import * as SQLite from 'expo-sqlite';
import { generateUUID } from '@/utils/uuid';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('smt.db');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      preset_id TEXT,
      preset_name TEXT,
      intention TEXT,
      journal_entry TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      warmup_minutes INTEGER NOT NULL DEFAULT 0,
      interval_minutes INTEGER NOT NULL DEFAULT 0,
      starting_bell_id TEXT,
      interval_bell_id TEXT,
      ending_bell_id TEXT,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Seed default presets if empty
  const existing = await database.getAllAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM presets'
  );
  const count = existing[0]?.count ?? 0;

  if (count === 0) {
    const now = new Date().toISOString();
    await database.runAsync(
      `INSERT INTO presets (id, name, duration_minutes, warmup_minutes, interval_minutes, starting_bell_id, interval_bell_id, ending_bell_id, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generateUUID(), '30 min · No intervals', 30, 0, 0, 'bell_1', null, 'bell_1', 1, now]
    );
    await database.runAsync(
      `INSERT INTO presets (id, name, duration_minutes, warmup_minutes, interval_minutes, starting_bell_id, interval_bell_id, ending_bell_id, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generateUUID(), '20 min · 5 min intervals', 20, 2, 5, 'bell_2', 'bell_2', 'bell_2', 1, now]
    );
    await database.runAsync(
      `INSERT INTO presets (id, name, duration_minutes, warmup_minutes, interval_minutes, starting_bell_id, interval_bell_id, ending_bell_id, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generateUUID(), 'Free session', 0, 0, 0, 'bell_1', null, null, 1, now]
    );
  }
}
