import { Session } from '@/db/sessions';

export type ConflictResolution = 'skip' | 'replace';

export interface ConflictItem {
  incoming: Session;
  existing: Session;
  resolution: ConflictResolution;
}

export interface ImportData {
  toAdd: Session[];
  identical: Session[];
  conflicts: ConflictItem[];
}

export interface ImportStats {
  added: number;
  replaced: number;
  skipped: number;
}

let _data: ImportData | null = null;

export function setImportData(data: ImportData): void {
  _data = data;
}

export function getImportData(): ImportData | null {
  return _data;
}

export function clearImportData(): void {
  _data = null;
}
