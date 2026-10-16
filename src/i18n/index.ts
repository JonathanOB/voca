import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { LOCALES } from './locales';

let initialised = false;

export function initI18n(language: string) {
  if (initialised) {
    if (i18n.language !== language) i18n.changeLanguage(language);
    return i18n;
  }
  const resources: Record<string, Record<string, object>> = {};
  for (const [code, loc] of Object.entries(LOCALES)) {
    resources[code] = { ui: loc.ui, boards: loc.boards, routines: loc.routines, vocab: loc.vocab };
  }
  i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    ns: ['ui', 'boards', 'routines', 'vocab'],
    defaultNS: 'ui',
    interpolation: { escapeValue: false },
    returnNull: false,
    initAsync: false,
    react: { useSuspense: false },
  });
  initialised = true;
  return i18n;
}

export function setLanguage(language: string) {
  if (i18n.language !== language) i18n.changeLanguage(language);
}

export { i18n };
