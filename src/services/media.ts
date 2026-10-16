/**
 * Local media storage for personal photos and recorded audio.
 *
 * Files live in <documents>/media/ and the database stores only the filename,
 * because absolute container paths change between app updates on iOS.
 * Deletion is reference-checked (see collectGarbage) so removing one board
 * never deletes a photo another board still uses.
 */
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { newId } from './ids';

const isWeb = Platform.OS === 'web';

function mediaDir(): Directory {
  const dir = new Directory(Paths.document, 'media');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/** On web (development only) media is kept inline as data URIs. */
const isInline = (name: string) => /^(data:|blob:|https?:|file:)/.test(name);

export function mediaUri(name: string | null | undefined): string | null {
  if (!name) return null;
  if (isInline(name)) return name;
  if (isWeb) return null;
  return new File(mediaDir(), name).uri;
}

function extFrom(uri: string, fallback: string) {
  const m = /\.([a-z0-9]{2,5})(?:\?|$)/i.exec(uri);
  return (m ? m[1] : fallback).toLowerCase();
}

/** Copies a picked/captured photo into app storage and returns its stored name. */
export async function importPhoto(sourceUri: string, base64?: string | null): Promise<string> {
  if (isWeb) return base64 ? `data:image/jpeg;base64,${base64}` : sourceUri;
  const name = `${newId('btn').replace('btn_', 'img_')}.${extFrom(sourceUri, 'jpg')}`;
  const src = new File(sourceUri);
  src.copy(new File(mediaDir(), name));
  return name;
}

/** Moves a finished recording into app storage and returns its stored name. */
export async function importAudio(sourceUri: string): Promise<string> {
  if (isWeb) return sourceUri;
  const name = `${newId('btn').replace('btn_', 'aud_')}.${extFrom(sourceUri, 'm4a')}`;
  const src = new File(sourceUri);
  src.copy(new File(mediaDir(), name));
  try {
    src.delete();
  } catch {
    // cache cleanup is best-effort
  }
  return name;
}

export async function readMediaBase64(name: string): Promise<string | null> {
  if (isInline(name)) {
    const m = /^data:[^;]+;base64,(.*)$/.exec(name);
    return m ? m[1] : null;
  }
  if (isWeb) return null;
  const f = new File(mediaDir(), name);
  if (!f.exists) return null;
  return f.base64();
}

export function writeMediaBase64(name: string, base64: string) {
  if (isWeb) return;
  const f = new File(mediaDir(), name);
  if (f.exists) f.delete();
  f.create();
  f.write(base64, { encoding: 'base64' });
}

export function mediaExists(name: string): boolean {
  if (isInline(name)) return true;
  if (isWeb) return false;
  return new File(mediaDir(), name).exists;
}

export function listMedia(): string[] {
  if (isWeb) return [];
  return mediaDir()
    .list()
    .filter((e): e is File => e instanceof File)
    .map((f) => f.name);
}

/** Deletes media files that no button, board or routine step references any more. */
export function collectGarbage(referenced: Set<string>): number {
  if (isWeb) return 0;
  let removed = 0;
  for (const name of listMedia()) {
    if (referenced.has(name)) continue;
    try {
      new File(mediaDir(), name).delete();
      removed++;
    } catch {
      // ignore; will retry next time
    }
  }
  return removed;
}

export function eraseAllMedia() {
  if (isWeb) return;
  const dir = new Directory(Paths.document, 'media');
  if (dir.exists) dir.delete();
}
