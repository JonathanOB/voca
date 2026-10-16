import en from './locales/en';
import { LOCALES } from './locales';
import { LANGUAGES } from './languages';

type Tree = { [k: string]: string | Tree };

function flatten(obj: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else Object.assign(out, flatten(v, key));
  }
  return out;
}

const placeholders = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).map((p) => p.replace(/\s/g, '')).sort();

describe('translations', () => {
  const base = flatten(en as unknown as Tree);

  it('bundles a locale for every language offered', () => {
    for (const l of LANGUAGES) expect(LOCALES[l.code]).toBeDefined();
  });

  for (const [code, loc] of Object.entries(LOCALES)) {
    describe(code, () => {
      const flat = flatten(loc as unknown as Tree);
      it('has every key and no empty strings', () => {
        expect(Object.keys(flat).sort()).toEqual(Object.keys(base).sort());
        for (const [k, v] of Object.entries(flat)) expect([k, v.trim().length > 0]).toEqual([k, true]);
      });
      it('keeps interpolation placeholders', () => {
        for (const [k, v] of Object.entries(base)) expect([k, placeholders(flat[k] ?? '')]).toEqual([k, placeholders(v)]);
      });
    });
  }
});
