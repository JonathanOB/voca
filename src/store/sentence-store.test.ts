import { sentenceText, useSentence } from './sentence-store';

jest.mock('@/db/repo', () => ({ getKV: jest.fn(async () => null), setKV: jest.fn(async () => {}) }));
jest.mock('@/services/ids', () => {
  let n = 0;
  return { newId: () => `sent_${++n}` };
});

const word = (label: string) => ({ buttonId: null, label, spoken: label, lang: null, symbol: null, photo: null, audio: null });

describe('sentence store', () => {
  beforeEach(() => useSentence.getState().clear());

  it('builds, reorders and edits a sentence without rewriting words', () => {
    const s = useSentence.getState();
    s.add(word('want'));
    const i = s.add(word('I'));
    s.add(word('juice'));
    useSentence.getState().move(i.key, -1);
    expect(sentenceText(useSentence.getState().items)).toBe('I want juice');
    useSentence.getState().removeLast();
    expect(sentenceText(useSentence.getState().items)).toBe('I want');
    useSentence.getState().remove(i.key);
    expect(sentenceText(useSentence.getState().items)).toBe('want');
  });

  it('allows repeated and phrase items', () => {
    const s = useSentence.getState();
    s.add(word('I need a break'));
    s.add(word('no'));
    s.add(word('no'));
    expect(useSentence.getState().items).toHaveLength(3);
    expect(sentenceText(useSentence.getState().items, true)).toBe('I need a break no no?');
  });

  it('ignores moves past either end', () => {
    const a = useSentence.getState().add(word('a'));
    useSentence.getState().move(a.key, -1);
    useSentence.getState().move(a.key, 5);
    expect(useSentence.getState().items.map((x) => x.label)).toEqual(['a']);
  });
});
