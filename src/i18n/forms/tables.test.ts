import { STD_BUTTONS } from '@/data/standard-content';
import { parseFormsInput } from './index';
import { FORM_TABLES } from './tables';

describe('curated word forms', () => {
  it('only list standard words, with non-empty, unique forms', () => {
    for (const [lang, table] of Object.entries(FORM_TABLES)) {
      for (const [key, forms] of Object.entries(table)) {
        expect([lang, key, key in STD_BUTTONS]).toEqual([lang, key, true]);
        expect(forms.length).toBeGreaterThan(0);
        expect(forms.every((f) => f.trim().length > 0)).toBe(true);
        expect(new Set(forms).size).toBe(forms.length);
      }
    }
  });

  it('offer feminine forms for feelings in languages that default to the masculine', () => {
    for (const lang of ['es', 'it', 'pt', 'pl']) expect(FORM_TABLES[lang].tired).toBeDefined();
    expect(FORM_TABLES.fr.tired).toEqual(['fatiguée']);
  });
});

describe('parseFormsInput', () => {
  it('splits on Latin and CJK commas and drops blanks and repeats', () => {
    expect(parseFormsInput('wants, wanted , ,wants')).toEqual(['wants', 'wanted']);
    expect(parseFormsInput('たべた、たべない')).toEqual(['たべた', 'たべない']);
  });
});
