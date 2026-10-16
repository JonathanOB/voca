/**
 * Other forms of a word for the long-press bubble (plural, past, feminine…).
 * Order of preference: forms typed by the carer on the button; the curated
 * table for standard words in the current language; English rules.
 */
import type { Button } from '@/db/types';
import { buttonLabel } from '@/i18n/labels';
import { baseLanguage } from '@/i18n/languages';
import { englishForms } from './english';
import { FORM_TABLES } from './tables';

const MAX_FORMS = 6;

export function wordForms(btn: Button, language: string): string[] {
  const label = buttonLabel(btn);
  const clean = (list: string[]) => [...new Set(list.map((f) => f.trim()).filter((f) => f && f !== label))].slice(0, MAX_FORMS);

  if (btn.forms?.length) return clean(btn.forms);

  const lang = baseLanguage(btn.lang ?? language);
  // Curated forms only fit the standard wording, not a label the user changed.
  if (btn.stdKey && !btn.label && lang === baseLanguage(language)) {
    const table = FORM_TABLES[lang]?.[btn.stdKey];
    if (table) return clean(table);
  }
  if (lang === 'en') return clean(englishForms(label, btn.type));
  return [];
}

/** Turns "wants, wanted , wanting" into a clean list (button editor). */
export function parseFormsInput(text: string): string[] {
  return [...new Set(text.split(/[,،、，]/).map((f) => f.trim()).filter(Boolean))].slice(0, 10);
}
