/**
 * Friendly accent names for system voices, written in the voice's own
 * language (the voice list only shows voices for the current language).
 * Unknown regions fall back to "<language> (<REGION>)".
 */
import { languageInfo } from './languages';

const ACCENTS: Record<string, Record<string, string>> = {
  en: {
    US: 'American English',
    GB: 'British English',
    AU: 'Australian English',
    IE: 'Irish English',
    IN: 'Indian English',
    CA: 'Canadian English',
    NZ: 'New Zealand English',
    ZA: 'South African English',
    NG: 'Nigerian English',
    SG: 'Singaporean English',
    PH: 'Philippine English',
    KE: 'Kenyan English',
    GH: 'Ghanaian English',
    HK: 'Hong Kong English',
    PK: 'Pakistani English',
    TZ: 'Tanzanian English',
    SCOTLAND: 'Scottish English',
  },
  es: {
    ES: 'Español de España',
    MX: 'Español de México',
    US: 'Español de Estados Unidos',
    AR: 'Español de Argentina',
    CO: 'Español de Colombia',
    CL: 'Español de Chile',
    PE: 'Español de Perú',
    VE: 'Español de Venezuela',
    '419': 'Español latinoamericano',
  },
  fr: {
    FR: 'Français de France',
    CA: 'Français canadien',
    BE: 'Français de Belgique',
    CH: 'Français de Suisse',
  },
  de: {
    DE: 'Deutsch (Deutschland)',
    AT: 'Deutsch (Österreich)',
    CH: 'Deutsch (Schweiz)',
  },
  it: {
    IT: 'Italiano (Italia)',
    CH: 'Italiano (Svizzera)',
  },
  pt: {
    BR: 'Português do Brasil',
    PT: 'Português europeu',
  },
  nl: {
    NL: 'Nederlands (Nederland)',
    BE: 'Vlaams (België)',
  },
  pl: {
    PL: 'Polski',
  },
  zh: {
    CN: '普通话（中国大陆）',
    TW: '國語（台灣）',
    HK: '粤语（香港）',
    SG: '华语（新加坡）',
  },
  ja: {
    JP: '日本語',
  },
};

/** Splits "en_US", "en-us", "zh-Hans-CN" or "yue-HK" into language + region. */
export function splitTag(tag: string): { lang: string; region: string } {
  const parts = tag.replace(/_/g, '-').split('-');
  const lang = parts[0].toLowerCase();
  const region = (parts.slice(1).find((p) => /^[A-Za-z]{2}$|^\d{3}$/.test(p)) ?? '').toUpperCase();
  return { lang: lang === 'yue' || lang === 'cmn' ? 'zh' : lang, region: lang === 'yue' && !region ? 'HK' : region };
}

export function accentKey(tag: string) {
  const { lang, region } = splitTag(tag);
  return region ? `${lang}-${region}` : lang;
}

export function accentName(tag: string): string {
  const { lang, region } = splitTag(tag);
  const named = ACCENTS[lang]?.[region];
  if (named) return named;
  const native = languageInfo(lang).code === lang ? languageInfo(lang).native : lang;
  return region ? `${native} (${region})` : native;
}
