import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { read as XLSXRead, utils as XLSXUtils } from 'xlsx';
import { Session, getAllSessions, insertSessionWithId, updateSession } from '@/db/sessions';
import { generateUUID } from '@/utils/uuid';
import { ConflictItem, ImportData, ImportStats } from './importState';

export type ImportFormat = 'json' | 'xlsx' | 'txt';

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseDuration(str: string): number {
  let seconds = 0;
  const h = str.match(/(\d+)\s*h/);
  const m = str.match(/(\d+)\s*min/);
  const s = str.match(/(\d+)\s*sec/);
  if (h) seconds += parseInt(h[1], 10) * 3600;
  if (m) seconds += parseInt(m[1], 10) * 60;
  if (s) seconds += parseInt(s[1], 10);
  return seconds;
}

// Excel serial date → "YYYY-MM-DD"
function excelSerialToDate(serial: number): string {
  const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
  return d.toISOString().split('T')[0];
}

// Excel serial date → full ISO string
function excelSerialToISO(serial: number): string {
  return new Date(Math.round((serial - 25569) * 86400 * 1000)).toISOString();
}

function cellStr(val: unknown): string {
  if (val == null) return '';
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

function cellDate(val: unknown): string {
  if (typeof val === 'number') return excelSerialToDate(val);
  if (val instanceof Date) return val.toISOString().split('T')[0];
  return cellStr(val);
}

function cellDateTime(val: unknown): string {
  if (typeof val === 'number') return excelSerialToISO(val);
  if (val instanceof Date) return val.toISOString();
  return cellStr(val);
}

function sessionsHaveDiff(a: Session, b: Session): boolean {
  return (
    a.duration_seconds !== b.duration_seconds ||
    (a.preset_name ?? null) !== (b.preset_name ?? null) ||
    (a.intention ?? null) !== (b.intention ?? null) ||
    (a.journal_entry ?? null) !== (b.journal_entry ?? null)
  );
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseJson(content: string): Session[] {
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new Error('Invalid JSON file');
  }
  if (!Array.isArray(raw)) throw new Error('JSON must be an array of sessions');

  const now = new Date().toISOString();
  return raw.map((item: unknown, i: number) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Entry ${i + 1} is not a valid object`);
    }
    const obj = item as Record<string, unknown>;
    if (!obj.date || !obj.start_time || obj.duration_seconds == null) {
      throw new Error(`Entry ${i + 1} is missing required fields (date, start_time, duration_seconds)`);
    }
    return {
      id: typeof obj.id === 'string' ? obj.id : generateUUID(),
      date: String(obj.date),
      start_time: String(obj.start_time),
      duration_seconds: Number(obj.duration_seconds),
      preset_id: obj.preset_id != null ? String(obj.preset_id) : null,
      preset_name: obj.preset_name != null ? String(obj.preset_name) : null,
      intention: obj.intention != null ? String(obj.intention) : null,
      journal_entry: obj.journal_entry != null ? String(obj.journal_entry) : null,
      created_at: typeof obj.created_at === 'string' ? obj.created_at : now,
      updated_at: typeof obj.updated_at === 'string' ? obj.updated_at : now,
    } satisfies Session;
  });
}

function parseXlsx(base64: string): Session[] {
  const workbook = XLSXRead(base64, { type: 'base64' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('XLSX file contains no sheets');
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSXUtils.sheet_to_json<Record<string, unknown>>(sheet, { raw: true, defval: '' });

  if (rows.length === 0) throw new Error('XLSX file contains no rows');

  const now = new Date().toISOString();
  return rows.map((row, i) => {
    const date = cellDate(row['Date']);
    const startTime = cellDateTime(row['Start Time']);
    const durationSec = row['Duration (sec)'];
    if (!date || !startTime) {
      throw new Error(`Row ${i + 2} is missing required fields (Date, Start Time)`);
    }
    return {
      id: generateUUID(),
      date,
      start_time: startTime,
      duration_seconds: typeof durationSec === 'number' ? durationSec : parseDuration(cellStr(row['Duration'])),
      preset_id: null,
      preset_name: cellStr(row['Preset']) || null,
      intention: cellStr(row['Intention']) || null,
      journal_entry: cellStr(row['Journal']) || null,
      created_at: now,
      updated_at: now,
    } satisfies Session;
  });
}

function parseTxt(content: string): Session[] {
  // Split on session headers, keeping the header on each block
  const blocks = content.split(/(?=^--- Session:)/m).filter(b => b.trim());
  if (blocks.length === 0) throw new Error('No sessions found in TXT file');

  const now = new Date().toISOString();
  const sessions: Session[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const headerMatch = lines[0]?.match(/^--- Session: (.+?) ---/);
    if (!headerMatch) continue;

    const date = headerMatch[1].trim();
    const fieldValues: Record<string, string[]> = {};
    let currentKey: string | null = null;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const keyMatch = line.match(/^(Start|Duration|Preset|Intention|Notes): (.*)/);
      if (keyMatch) {
        currentKey = keyMatch[1];
        fieldValues[currentKey] = [keyMatch[2]];
      } else if (currentKey && line !== '') {
        // continuation of a multi-line field
        fieldValues[currentKey].push(line);
      }
    }

    const startTime = fieldValues['Start']?.[0]?.trim() ?? '';
    const durationStr = fieldValues['Duration']?.[0]?.trim() ?? '0 sec';
    if (!date || !startTime) continue;

    sessions.push({
      id: generateUUID(),
      date,
      start_time: startTime,
      duration_seconds: parseDuration(durationStr),
      preset_id: null,
      preset_name: fieldValues['Preset'] ? fieldValues['Preset'].join('\n') || null : null,
      intention: fieldValues['Intention'] ? fieldValues['Intention'].join('\n') || null : null,
      journal_entry: fieldValues['Notes'] ? fieldValues['Notes'].join('\n') || null : null,
      created_at: now,
      updated_at: now,
    });
  }

  if (sessions.length === 0) throw new Error('No valid sessions found in TXT file');
  return sessions;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function pickAndParse(): Promise<{ sessions: Session[]; format: ImportFormat } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  const name = asset.name.toLowerCase();
  let format: ImportFormat;
  if (name.endsWith('.json')) {
    format = 'json';
  } else if (name.endsWith('.xlsx')) {
    format = 'xlsx';
  } else if (name.endsWith('.txt')) {
    format = 'txt';
  } else {
    throw new Error(`Unsupported file type: ${asset.name}`);
  }

  let sessions: Session[];
  if (format === 'xlsx') {
    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    sessions = parseXlsx(base64);
  } else {
    const content = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    sessions = format === 'json' ? parseJson(content) : parseTxt(content);
  }

  return { sessions, format };
}

export async function analyzeImport(incoming: Session[]): Promise<ImportData> {
  const existing = await getAllSessions();
  const byId = new Map(existing.map(s => [s.id, s]));
  const byKey = new Map(existing.map(s => [`${s.date}|${s.start_time}`, s]));

  const toAdd: Session[] = [];
  const identical: Session[] = [];
  const conflicts: ConflictItem[] = [];

  for (const session of incoming) {
    const match = byId.get(session.id) ?? byKey.get(`${session.date}|${session.start_time}`);
    if (!match) {
      toAdd.push(session);
    } else if (sessionsHaveDiff(session, match)) {
      conflicts.push({ incoming: session, existing: match, resolution: 'skip' });
    } else {
      identical.push(session);
    }
  }

  return { toAdd, identical, conflicts };
}

export async function executeImport(data: ImportData): Promise<ImportStats> {
  let added = 0;
  let replaced = 0;
  let skipped = data.identical.length;

  for (const session of data.toAdd) {
    await insertSessionWithId(session);
    added++;
  }

  for (const conflict of data.conflicts) {
    if (conflict.resolution === 'replace') {
      await updateSession(conflict.existing.id, {
        duration_seconds: conflict.incoming.duration_seconds,
        preset_name: conflict.incoming.preset_name,
        intention: conflict.incoming.intention,
        journal_entry: conflict.incoming.journal_entry,
      });
      replaced++;
    } else {
      skipped++;
    }
  }

  return { added, replaced, skipped };
}
