import { getDatabase } from './database';
import { generateUUID } from '@/utils/uuid';

export interface Session {
  id: string;
  date: string;
  start_time: string;
  duration_seconds: number;
  preset_id: string | null;
  preset_name: string | null;
  intention: string | null;
  journal_entry: string | null;
  created_at: string;
  updated_at: string;
}

export async function insertSession(
  data: Omit<Session, 'id' | 'created_at' | 'updated_at'>
): Promise<Session> {
  const db = await getDatabase();
  const id = generateUUID();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO sessions (id, date, start_time, duration_seconds, preset_id, preset_name, intention, journal_entry, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.date,
      data.start_time,
      data.duration_seconds,
      data.preset_id ?? null,
      data.preset_name ?? null,
      data.intention ?? null,
      data.journal_entry ?? null,
      now,
      now,
    ]
  );
  return { ...data, id, created_at: now, updated_at: now };
}

export async function getAllSessions(): Promise<Session[]> {
  const db = await getDatabase();
  return db.getAllAsync<Session>(
    'SELECT * FROM sessions ORDER BY start_time DESC'
  );
}

export async function getSessionById(id: string): Promise<Session | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Session>(
    'SELECT * FROM sessions WHERE id = ?',
    [id]
  );
  return result ?? null;
}

export async function updateSession(
  id: string,
  data: Partial<Omit<Session, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const fields = Object.keys(data)
    .map(k => `${k} = ?`)
    .join(', ');
  const values = [...Object.values(data), now, id];
  await db.runAsync(
    `UPDATE sessions SET ${fields}, updated_at = ? WHERE id = ?`,
    values
  );
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sessions WHERE id = ?', [id]);
}

export async function insertSessionWithId(session: Session): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sessions (id, date, start_time, duration_seconds, preset_id, preset_name, intention, journal_entry, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.date,
      session.start_time,
      session.duration_seconds,
      session.preset_id ?? null,
      session.preset_name ?? null,
      session.intention ?? null,
      session.journal_entry ?? null,
      session.created_at,
      session.updated_at,
    ]
  );
}
