/**
 * Local backup, export and restore (brief §13).
 *
 * Format: a single JSON file ("voca-backup") containing
 *   - formatVersion / schemaVersion / appVersion / createdAt
 *   - data: settings + the full library (buttons, boards, items, routines, steps)
 *   - media: every referenced photo/recording as base64 with size and SHA-256
 *   - checksum: SHA-256 of the serialised data block
 *
 * Restore REPLACES the current library and settings (it does not merge).
 * The file is fully validated before anything is changed, and a safety copy of
 * the current library is written inside the app first.
 */
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { getDb } from '@/db/database';
import { SCHEMA_VERSION } from '@/db/schema';
import type { LibraryData } from '@/db/types';
import { readMediaBase64, writeMediaBase64 } from './media';
import { normalizeSettings, type Settings } from '@/store/settings';

export const BACKUP_FORMAT = 'voca-backup';
export const BACKUP_FORMAT_VERSION = 1;

export interface BackupMedia {
  name: string;
  bytes: number;
  sha256: string;
  base64: string;
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  formatVersion: number;
  schemaVersion: number;
  appVersion: string;
  createdAt: string;
  data: { settings: Settings; library: LibraryData };
  media: BackupMedia[];
  checksum: string;
}

export type BackupError = 'invalid' | 'newer' | 'missingMedia';
export type ValidationResult = { ok: true; backup: BackupFile } | { ok: false; error: BackupError };

const sha256 = (s: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, s);

export function referencedMedia(lib: LibraryData): Set<string> {
  const refs = new Set<string>();
  const add = (v: string | null | undefined) => {
    if (v && !/^(data:|blob:|https?:)/.test(v)) refs.add(v);
  };
  lib.buttons.forEach((b) => {
    add(b.photo);
    add(b.audio);
  });
  lib.boards.forEach((b) => add(b.photo));
  lib.routines.forEach((r) => add(r.photo));
  lib.steps.forEach((s) => {
    add(s.photo);
    add(s.audio);
  });
  return refs;
}

export async function buildBackup(settings: Settings, library: LibraryData): Promise<BackupFile> {
  const media: BackupMedia[] = [];
  for (const name of referencedMedia(library)) {
    const base64 = await readMediaBase64(name);
    if (!base64) continue; // a missing file is skipped rather than failing the whole export
    media.push({ name, bytes: Math.floor((base64.length * 3) / 4), sha256: await sha256(base64), base64 });
  }
  const data = { settings, library };
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: SCHEMA_VERSION,
    appVersion: Constants.expoConfig?.version ?? '1.0.0',
    createdAt: new Date().toISOString(),
    data,
    media,
    checksum: await sha256(JSON.stringify(data)),
  };
}

// --- validation (pure apart from hashing) ------------------------------------

const isStr = (v: unknown) => typeof v === 'string';
const isOptStr = (v: unknown) => v === null || v === undefined || typeof v === 'string';
const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
const isBool = (v: unknown) => typeof v === 'boolean';

export function validateShape(raw: unknown): { ok: true; backup: BackupFile } | { ok: false; error: BackupError } {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'invalid' };
  const b = raw as Partial<BackupFile>;
  if (b.format !== BACKUP_FORMAT || !isNum(b.formatVersion) || !isNum(b.schemaVersion)) return { ok: false, error: 'invalid' };
  if (b.formatVersion! > BACKUP_FORMAT_VERSION || b.schemaVersion! > SCHEMA_VERSION) return { ok: false, error: 'newer' };
  const lib = b.data?.library;
  if (!b.data || typeof b.data.settings !== 'object' || !lib) return { ok: false, error: 'invalid' };
  const arrays = [lib.buttons, lib.boards, lib.items, lib.routines, lib.steps];
  if (!arrays.every(Array.isArray) || !Array.isArray(b.media) || !isStr(b.checksum)) return { ok: false, error: 'invalid' };

  const okButtons = lib.buttons.every((x) => isStr(x.id) && isOptStr(x.label) && isOptStr(x.spoken) && isOptStr(x.symbol) && isStr(x.type) && isBool(x.isStandard));
  const okBoards = lib.boards.every((x) => isStr(x.id) && isStr(x.section) && isOptStr(x.name) && isNum(x.sort) && isBool(x.hidden));
  const okItems = lib.items.every((x) => isStr(x.id) && isStr(x.boardId) && isStr(x.buttonId) && isNum(x.position));
  const okRoutines = lib.routines.every((x) => isStr(x.id) && isStr(x.kind) && isOptStr(x.name));
  const okSteps = lib.steps.every((x) => isStr(x.id) && isStr(x.routineId) && isNum(x.position) && isBool(x.done));
  if (!okButtons || !okBoards || !okItems || !okRoutines || !okSteps) return { ok: false, error: 'invalid' };

  // Referential integrity: every item and step must point at something that exists.
  const buttonIds = new Set(lib.buttons.map((x) => x.id));
  const boardIds = new Set(lib.boards.map((x) => x.id));
  const routineIds = new Set(lib.routines.map((x) => x.id));
  if (!lib.items.every((i) => boardIds.has(i.boardId) && buttonIds.has(i.buttonId))) return { ok: false, error: 'invalid' };
  if (!lib.steps.every((s) => routineIds.has(s.routineId) && (!s.buttonId || buttonIds.has(s.buttonId)))) return { ok: false, error: 'invalid' };

  const mediaNames = new Set(b.media.map((m) => m?.name));
  for (const name of referencedMedia(lib)) if (!mediaNames.has(name)) return { ok: false, error: 'missingMedia' };
  if (!b.media.every((m) => isStr(m.name) && isStr(m.base64) && isStr(m.sha256) && !m.name.includes('/') && !m.name.includes('\\')))
    return { ok: false, error: 'missingMedia' };
  return { ok: true, backup: b as BackupFile };
}

export async function validateBackup(text: string): Promise<ValidationResult> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'invalid' };
  }
  const shape = validateShape(raw);
  if (!shape.ok) return shape;
  const backup = shape.backup;
  if ((await sha256(JSON.stringify(backup.data))) !== backup.checksum) return { ok: false, error: 'invalid' };
  for (const m of backup.media) {
    if ((await sha256(m.base64)) !== m.sha256) return { ok: false, error: 'missingMedia' };
  }
  return { ok: true, backup };
}

// --- file plumbing -------------------------------------------------------------

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

async function shareFile(name: string, contents: string | null, mimeType: string, sourceUri?: string) {
  if (Platform.OS === 'web') {
    const blob = new Blob([contents ?? ''], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return;
  }
  let uri = sourceUri;
  if (!uri) {
    const f = new File(Paths.cache, name);
    if (f.exists) f.delete();
    f.create();
    f.write(contents ?? '');
    uri = f.uri;
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: name, UTI: mimeType === 'application/json' ? 'public.json' : undefined });
  }
}

export async function exportBackup(settings: Settings, library: LibraryData) {
  const backup = await buildBackup(settings, library);
  await shareFile(`voca-backup-${stamp()}.json`, JSON.stringify(backup), 'application/json');
  return backup;
}

/** Shares a copy of the raw SQLite database (structured export for advanced users). */
export async function exportDatabaseFile() {
  if (Platform.OS === 'web') return;
  const db = await getDb();
  await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');
  const path = db.databasePath.startsWith('file://') ? db.databasePath : `file://${db.databasePath}`;
  const copy = new File(Paths.cache, `voca-${stamp()}.db`);
  if (copy.exists) copy.delete();
  new File(path).copy(copy);
  await shareFile(copy.name, null, 'application/x-sqlite3', copy.uri);
}

export async function pickBackupText(): Promise<string | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets?.[0]) return null;
  const asset = res.assets[0];
  if (Platform.OS === 'web') {
    const file = (asset as unknown as { file?: Blob }).file;
    if (file) return await file.text();
    return await (await fetch(asset.uri)).text();
  }
  return await new File(asset.uri).text();
}

/** Writes a safety copy of the current library before a restore (keeps the last 3). */
export async function writeSafetyCopy(settings: Settings, library: LibraryData) {
  if (Platform.OS === 'web') return;
  const dir = new Directory(Paths.document, 'safety-backups');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const backup = await buildBackup(settings, library);
  const f = new File(dir, `voca-safety-${stamp()}.json`);
  if (f.exists) f.delete();
  f.create();
  f.write(JSON.stringify(backup));
  const files = dir
    .list()
    .filter((e): e is File => e instanceof File)
    .sort((a, b) => a.name.localeCompare(b.name));
  while (files.length > 3) files.shift()?.delete();
}

/** Writes media from a validated backup. Call before replacing the library. */
export function restoreMedia(backup: BackupFile) {
  for (const m of backup.media) writeMediaBase64(m.name, m.base64);
}

export function restoredSettings(backup: BackupFile, current: Settings): Settings {
  // Keep device-specific choices (voice IDs differ between devices), the carer PIN on this
  // device, and telemetry consent.
  return normalizeSettings({
    ...backup.data.settings,
    voiceId: current.voiceId,
    pinHash: current.pinHash,
    telemetryConsent: current.telemetryConsent,
    telemetryLastSent: current.telemetryLastSent,
    onboardingDone: true,
    onboardingStep: 0,
  });
}
