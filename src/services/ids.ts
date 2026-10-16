import * as Crypto from 'expo-crypto';

/** Stable unique ID for user-created content, e.g. `btn_4f1c...`. */
export function newId(prefix: 'btn' | 'board' | 'item' | 'routine' | 'step' | 'sent' | 'chip'): string {
  return `${prefix}_${Crypto.randomUUID().replace(/-/g, '')}`;
}
