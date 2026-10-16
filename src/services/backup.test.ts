import { buildStandardContent } from '@/db/seed';
import { SCHEMA_VERSION } from '@/db/schema';
import { DEFAULT_SETTINGS } from '@/store/settings';
import { BACKUP_FORMAT, BACKUP_FORMAT_VERSION, referencedMedia, restoredSettings, validateShape, type BackupFile } from './backup';

function sample(): BackupFile {
  const library = buildStandardContent(1);
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: SCHEMA_VERSION,
    appVersion: '1.0.0',
    createdAt: '2026-10-15T10:00:00.000Z',
    data: { settings: DEFAULT_SETTINGS, library },
    media: [],
    checksum: 'x',
  };
}

describe('backup validation', () => {
  it('accepts a well-formed backup', () => {
    expect(validateShape(sample()).ok).toBe(true);
  });

  it('rejects files that are not Voca backups', () => {
    expect(validateShape(null)).toEqual({ ok: false, error: 'invalid' });
    expect(validateShape({ hello: 'world' })).toEqual({ ok: false, error: 'invalid' });
    expect(validateShape({ ...sample(), format: 'other' })).toEqual({ ok: false, error: 'invalid' });
  });

  it('refuses backups from a newer version instead of guessing', () => {
    expect(validateShape({ ...sample(), schemaVersion: SCHEMA_VERSION + 1 })).toEqual({ ok: false, error: 'newer' });
  });

  it('fails safely when a referenced photo is missing', () => {
    const b = sample();
    b.data.library.buttons[0] = { ...b.data.library.buttons[0], photo: 'img_1.jpg' };
    expect(referencedMedia(b.data.library).has('img_1.jpg')).toBe(true);
    expect(validateShape(b)).toEqual({ ok: false, error: 'missingMedia' });
    b.media.push({ name: 'img_1.jpg', bytes: 3, sha256: 'abc', base64: 'AAAA' });
    expect(validateShape(b).ok).toBe(true);
  });

  it('rejects media names that try to escape the media folder', () => {
    const b = sample();
    b.media.push({ name: '../evil.jpg', bytes: 3, sha256: 'abc', base64: 'AAAA' });
    expect(validateShape(b)).toEqual({ ok: false, error: 'missingMedia' });
  });

  it('rejects dangling references between boards and buttons', () => {
    const b = sample();
    b.data.library.items.push({ id: 'x', boardId: 'std:board:core', buttonId: 'does-not-exist', position: 99, hidden: false });
    expect(validateShape(b)).toEqual({ ok: false, error: 'invalid' });
  });
});

describe('restoring settings', () => {
  it('keeps this device’s voice and carer PIN, not the backup’s', () => {
    const b = sample();
    b.data.settings = { ...DEFAULT_SETTINGS, voiceId: 'their-voice', pinHash: 'their-pin', language: 'es' };
    const current = { ...DEFAULT_SETTINGS, voiceId: 'my-voice', pinHash: 'my-pin' };
    const s = restoredSettings(b, current);
    expect(s.language).toBe('es');
    expect(s.voiceId).toBe('my-voice');
    expect(s.pinHash).toBe('my-pin');
  });
});
