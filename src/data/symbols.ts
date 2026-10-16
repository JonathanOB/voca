import { SKIN_TONE_SOURCES, SYMBOL_LIBRARY, SYMBOL_SOURCES, type SkinToneId } from './symbols.generated';

export type SkinTone = 'default' | SkinToneId;

export const SKIN_TONES: { id: SkinTone; swatch: string }[] = [
  { id: 'default', swatch: '#FFC83D' },
  { id: '1f3fb', swatch: '#F7DECE' },
  { id: '1f3fc', swatch: '#F3D2A2' },
  { id: '1f3fd', swatch: '#D5AB88' },
  { id: '1f3fe', swatch: '#AF7E57' },
  { id: '1f3ff', swatch: '#7C533E' },
];

/** Canonical symbol ID for an emoji: hex code points without FE0F. */
export function symbolId(emoji: string): string {
  const out: string[] = [];
  for (const ch of emoji) {
    const hex = (ch.codePointAt(0) ?? 0).toString(16);
    if (hex !== 'fe0f') out.push(hex);
  }
  return out.join('-');
}

export function hasSymbol(id: string | null | undefined): boolean {
  return !!id && id in SYMBOL_SOURCES;
}

export function symbolSource(id: string | null | undefined, tone: SkinTone = 'default'): number | null {
  if (!id) return null;
  if (tone !== 'default') {
    const variant = SKIN_TONE_SOURCES[id]?.[tone];
    if (variant) return variant;
  }
  return SYMBOL_SOURCES[id] ?? null;
}

export function symbolChar(id: string): string {
  return id
    .split('-')
    .map((h) => String.fromCodePoint(parseInt(h, 16)))
    .join('');
}

export interface LibrarySymbol {
  id: string;
  char: string;
  name: string;
  group: string;
}

let cachedLibrary: LibrarySymbol[] | null = null;
export function symbolLibrary(): LibrarySymbol[] {
  if (!cachedLibrary) {
    cachedLibrary = SYMBOL_LIBRARY.map(([id, char, name, group]) => ({ id, char, name, group }));
  }
  return cachedLibrary;
}

export const SYMBOL_GROUPS = [
  'smileys_emotion',
  'people_body',
  'animals_nature',
  'food_drink',
  'activities',
  'travel_places',
  'objects',
  'symbols',
] as const;
export type SymbolGroup = (typeof SYMBOL_GROUPS)[number];

/** Very small search: matches English symbol names plus any extra words (e.g. translated labels). */
export function searchSymbols(query: string, group?: SymbolGroup | null, extra?: Map<string, string>): LibrarySymbol[] {
  const q = query.trim().toLowerCase();
  const lib = symbolLibrary();
  return lib.filter((s) => {
    if (group && s.group !== group) return false;
    if (!q) return true;
    if (s.name.includes(q)) return true;
    const more = extra?.get(s.id);
    return !!more && more.includes(q);
  });
}
