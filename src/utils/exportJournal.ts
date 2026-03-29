import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { utils as XLSXUtils, write as XLSXWrite } from 'xlsx';
import { Session } from '@/db/sessions';
import { formatDuration } from './formatters';

function sessionToRow(s: Session) {
  return {
    Date: s.date,
    'Start Time': s.start_time,
    'Duration': formatDuration(s.duration_seconds),
    'Duration (sec)': s.duration_seconds,
    'Preset': s.preset_name ?? '',
    'Intention': s.intention ?? '',
    'Journal': s.journal_entry ?? '',
  };
}

export async function exportAsTxt(sessions: Session[]): Promise<void> {
  const lines: string[] = [];
  for (const s of sessions) {
    lines.push(`--- Session: ${s.date} ---`);
    lines.push(`Start: ${s.start_time}`);
    lines.push(`Duration: ${formatDuration(s.duration_seconds)}`);
    if (s.preset_name) lines.push(`Preset: ${s.preset_name}`);
    if (s.intention) lines.push(`Intention: ${s.intention}`);
    if (s.journal_entry) lines.push(`Notes: ${s.journal_entry}`);
    lines.push('');
  }
  const content = lines.join('\n');
  const path = `${FileSystem.cacheDirectory}smt_journal_${Date.now()}.txt`;
  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path, { mimeType: 'text/plain' });
}

export async function exportAsJson(sessions: Session[]): Promise<void> {
  const content = JSON.stringify(sessions, null, 2);
  const path = `${FileSystem.cacheDirectory}smt_journal_${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path, { mimeType: 'application/json' });
}

export async function exportAsXlsx(sessions: Session[]): Promise<void> {
  const rows = sessions.map(sessionToRow);
  const worksheet = XLSXUtils.json_to_sheet(rows);
  const workbook = XLSXUtils.book_new();
  XLSXUtils.book_append_sheet(workbook, worksheet, 'Journal');
  const base64 = XLSXWrite(workbook, { type: 'base64', bookType: 'xlsx' });
  const path = `${FileSystem.cacheDirectory}smt_journal_${Date.now()}.xlsx`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  await Sharing.shareAsync(path, {
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
