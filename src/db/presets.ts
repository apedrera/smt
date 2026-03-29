import { getDatabase } from './database';
import { generateUUID } from '@/utils/uuid';

export interface Preset {
  id: string;
  name: string;
  duration_minutes: number;
  warmup_minutes: number;
  interval_minutes: number;
  starting_bell_id: string | null;
  interval_bell_id: string | null;
  ending_bell_id: string | null;
  is_default: boolean;
  created_at: string;
}

interface RawPreset extends Omit<Preset, 'is_default'> {
  is_default: number;
}

function mapPreset(raw: RawPreset): Preset {
  return { ...raw, is_default: raw.is_default === 1 };
}

export async function getAllPresets(): Promise<Preset[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawPreset>(
    'SELECT * FROM presets ORDER BY created_at ASC'
  );
  return rows.map(mapPreset);
}

export async function getPresetById(id: string): Promise<Preset | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RawPreset>(
    'SELECT * FROM presets WHERE id = ?',
    [id]
  );
  return row ? mapPreset(row) : null;
}

export async function insertPreset(
  data: Omit<Preset, 'id' | 'created_at'>
): Promise<Preset> {
  const db = await getDatabase();
  const id = generateUUID();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO presets (id, name, duration_minutes, warmup_minutes, interval_minutes, starting_bell_id, interval_bell_id, ending_bell_id, is_default, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name,
      data.duration_minutes,
      data.warmup_minutes,
      data.interval_minutes,
      data.starting_bell_id ?? null,
      data.interval_bell_id ?? null,
      data.ending_bell_id ?? null,
      data.is_default ? 1 : 0,
      now,
    ]
  );
  return { ...data, id, created_at: now };
}

export async function updatePreset(
  id: string,
  data: Partial<Omit<Preset, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDatabase();
  const mapped: Record<string, unknown> = { ...data };
  if (typeof data.is_default !== 'undefined') {
    mapped.is_default = data.is_default ? 1 : 0;
  }
  const fields = Object.keys(mapped)
    .map(k => `${k} = ?`)
    .join(', ');
  const values = [...Object.values(mapped), id] as import('expo-sqlite').SQLiteBindValue[];
  await db.runAsync(`UPDATE presets SET ${fields} WHERE id = ?`, values);
}

export async function deletePreset(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM presets WHERE id = ?', [id]);
}
