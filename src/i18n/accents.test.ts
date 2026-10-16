import { accentKey, accentName, splitTag } from './accents';

describe('accent names for the voice library', () => {
  it('names common English accents', () => {
    expect(accentName('en-US')).toBe('American English');
    expect(accentName('en_GB')).toBe('British English');
    expect(accentName('en-ie')).toBe('Irish English');
    expect(accentName('en-AU')).toBe('Australian English');
  });

  it('names accents in other languages in that language', () => {
    expect(accentName('es-MX')).toBe('Español de México');
    expect(accentName('pt-BR')).toBe('Português do Brasil');
    expect(accentName('fr-CA')).toBe('Français canadien');
  });

  it('handles script subtags and Cantonese tags', () => {
    expect(splitTag('zh-Hans-CN')).toEqual({ lang: 'zh', region: 'CN' });
    expect(accentKey('yue-HK')).toBe('zh-HK');
  });

  it('falls back to the native language name and region', () => {
    expect(accentName('en-XX')).toBe('English (XX)');
    expect(accentName('de')).toBe('Deutsch');
  });
});
