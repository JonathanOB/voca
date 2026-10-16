import { applyWord, emptyModel, learn, suggestPhrases, suggestWords, tokenize } from './predict';

jest.mock('@/db/repo', () => ({ getKV: jest.fn(async () => null), setKV: jest.fn(async () => {}) }));

describe('tokenize', () => {
  it('splits words and trims punctuation but keeps apostrophes inside words', () => {
    expect(tokenize('I don’t want it, thanks!')).toEqual(['I', 'don’t', 'want', 'it', 'thanks']);
  });
});

describe('suggestWords', () => {
  const lexicon = ['want', 'water', 'wait', 'walk', 'Wasser'];

  it('completes a partial word from learned words first, then vocabulary', () => {
    const model = learn(emptyModel(), 'I want my waffles. waffles please');
    expect(suggestWords('wa', model, lexicon)[0]).toBe('waffles');
    expect(suggestWords('wa', model, lexicon)).toHaveLength(3);
  });

  it('suggests the next word after a space from what usually follows', () => {
    const model = learn(learn(emptyModel(), 'I want juice'), 'I want juice and I want toast');
    expect(suggestWords('I want ', model, lexicon)).toEqual(['juice', 'toast']);
  });

  it('leaves Chinese and Japanese to the device keyboard', () => {
    expect(suggestWords('我要', emptyModel(), lexicon)).toEqual([]);
  });
});

describe('suggestPhrases', () => {
  it('matches the start of saved phrases, ignoring case and accents', () => {
    const phrases = ['Please wait for me', 'Thanks for waiting', 'Café please'];
    // Phrases that start with the text come before ones that only contain it.
    expect(suggestPhrases('please', phrases)).toEqual(['Please wait for me', 'Café please']);
    expect(suggestPhrases('cafe', phrases)).toEqual(['Café please']);
    expect(suggestPhrases('waiting', phrases)).toEqual(['Thanks for waiting']);
  });
});

describe('applyWord', () => {
  it('replaces the partial word or appends after a space', () => {
    expect(applyWord('I wa', 'want')).toBe('I want ');
    expect(applyWord('I want ', 'juice')).toBe('I want juice ');
    expect(applyWord('', 'hello')).toBe('hello ');
  });
});
