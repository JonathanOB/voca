import { getLocales } from 'expo-localization';

export interface LanguageInfo {
  code: string;
  /** Name in the language itself. */
  native: string;
  /** English name, for support/debugging. */
  english: string;
  /** A friendly greeting shown on the language picker. */
  hello: string;
  /** Fallback BCP-47 tag for speech when the device has no matching locale. */
  speechTag: string;
  /** Symbol shown on the picker (no national flags: languages are not countries). */
  sym: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', native: 'English', english: 'English', hello: 'Hello', speechTag: 'en-GB', sym: '👋' },
  { code: 'es', native: 'Español', english: 'Spanish', hello: 'Hola', speechTag: 'es-ES', sym: '🌞' },
  { code: 'fr', native: 'Français', english: 'French', hello: 'Bonjour', speechTag: 'fr-FR', sym: '🥐' },
  { code: 'de', native: 'Deutsch', english: 'German', hello: 'Hallo', speechTag: 'de-DE', sym: '🥨' },
  { code: 'it', native: 'Italiano', english: 'Italian', hello: 'Ciao', speechTag: 'it-IT', sym: '🍕' },
  { code: 'pt', native: 'Português', english: 'Portuguese', hello: 'Olá', speechTag: 'pt-PT', sym: '🌊' },
  { code: 'nl', native: 'Nederlands', english: 'Dutch', hello: 'Hallo', speechTag: 'nl-NL', sym: '🌷' },
  { code: 'pl', native: 'Polski', english: 'Polish', hello: 'Cześć', speechTag: 'pl-PL', sym: '🥟' },
  { code: 'zh', native: '中文', english: 'Chinese (Simplified)', hello: '你好', speechTag: 'zh-CN', sym: '🐼' },
  { code: 'ja', native: '日本語', english: 'Japanese', hello: 'こんにちは', speechTag: 'ja-JP', sym: '🌸' },
];

export const SUPPORTED_CODES = LANGUAGES.map((l) => l.code);

export function languageInfo(code: string): LanguageInfo {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

/** Best interface language for this device on first launch. */
export function detectDeviceLanguage(): string {
  try {
    for (const loc of getLocales()) {
      const code = (loc.languageCode ?? '').toLowerCase();
      if (SUPPORTED_CODES.includes(code)) return code;
    }
  } catch {
    // fall through
  }
  return 'en';
}

/**
 * Speech tag for a language code. Prefers the device's own regional variant
 * (e.g. en-IE on an Irish phone) so the default voice sounds local.
 */
export function speechTagFor(code: string): string {
  try {
    for (const loc of getLocales()) {
      if ((loc.languageCode ?? '').toLowerCase() === code && loc.languageTag) return loc.languageTag;
    }
  } catch {
    // fall through
  }
  return languageInfo(code).speechTag;
}

/** Normalises 'en_US' / 'en-us' style tags for comparison. */
export function baseLanguage(tag: string | null | undefined): string {
  return (tag ?? '').replace('_', '-').split('-')[0].toLowerCase();
}
