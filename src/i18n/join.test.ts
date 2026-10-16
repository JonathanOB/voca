import { asQuestion, joinWords, separatorBetween } from './join';

describe('joinWords', () => {
  it('spaces words in alphabetic scripts', () => {
    expect(joinWords(['I', 'want', ' juice '])).toBe('I want juice');
  });

  it('runs Chinese and Japanese words together', () => {
    expect(joinWords(['我', '要', '苹果'])).toBe('我要苹果');
    expect(joinWords(['わたし', 'ほしい', 'ジュース'])).toBe('わたしほしいジュース');
  });

  it('keeps a space where scripts meet', () => {
    expect(joinWords(['我', 'iPad'])).toBe('我 iPad');
    expect(separatorBetween('T恤', '红色')).toBe('');
  });

  it('skips empty words', () => {
    expect(joinWords(['', 'more', '  '])).toBe('more');
  });
});

describe('asQuestion', () => {
  it('uses the script’s own question mark', () => {
    expect(asQuestion('more juice')).toBe('more juice?');
    expect(asQuestion('还要果汁')).toBe('还要果汁？');
    expect(asQuestion('もっと。')).toBe('もっと？');
  });

  it('does not double up', () => {
    expect(asQuestion('can I?')).toBe('can I?');
    expect(asQuestion('我可以吗？')).toBe('我可以吗？');
    expect(asQuestion('')).toBe('');
  });
});
