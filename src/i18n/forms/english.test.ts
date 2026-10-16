import { comparatives, englishForms, pastTense, plural, presentParticiple, thirdPerson } from './english';

describe('English verb forms', () => {
  it('handles regular verbs', () => {
    expect(englishForms('want', 'action')).toEqual(['wants', 'wanted', 'wanting']);
    expect(englishForms('like', 'action')).toEqual(['likes', 'liked', 'liking']);
    expect(englishForms('stop', 'action')).toEqual(['stops', 'stopped', 'stopping']);
    expect(englishForms('tidy', 'action')).toEqual(['tidies', 'tidied', 'tidying']);
    expect(englishForms('play', 'action')).toEqual(['plays', 'played', 'playing']);
  });

  it('handles irregular verbs and participles', () => {
    expect(englishForms('go', 'action')).toEqual(['goes', 'went', 'going', 'gone']);
    expect(englishForms('eat', 'action')).toEqual(['eats', 'ate', 'eating', 'eaten']);
    expect(englishForms('swim', 'action')).toEqual(['swims', 'swam', 'swimming', 'swum']);
    expect(englishForms('put', 'action')).toEqual(['puts', 'put', 'putting']);
  });

  it('keeps particles and skips longer phrases', () => {
    expect(englishForms('wake up', 'action')).toEqual(['wakes up', 'woke up', 'waking up', 'woken up']);
    expect(englishForms('I want', 'action')).toEqual([]);
    expect(englishForms('give me a hug', 'action')).toEqual([]);
  });

  it('spells -ing and -ed carefully', () => {
    expect(presentParticiple('dance')).toBe('dancing');
    expect(presentParticiple('see')).toBe('seeing');
    expect(presentParticiple('lie')).toBe('lying');
    expect(presentParticiple('jump')).toBe('jumping');
    expect(pastTense('hug')).toBe('hugged');
    expect(pastTense('open')).toBe('opened');
    expect(thirdPerson('wash')).toBe('washes');
  });
});

describe('English nouns, adjectives and pronouns', () => {
  it('makes plurals and leaves uncountables alone', () => {
    expect(plural('apple')).toBe('apples');
    expect(plural('bus')).toBe('buses');
    expect(plural('baby')).toBe('babies');
    expect(plural('toy car')).toBe('toy cars');
    expect(plural('child')).toBe('children');
    expect(plural('water')).toBeNull();
    expect(plural('socks')).toBeNull();
  });

  it('compares adjectives', () => {
    expect(comparatives('big')).toEqual(['bigger', 'biggest']);
    expect(comparatives('happy')).toEqual(['happier', 'happiest']);
    expect(comparatives('good')).toEqual(['better', 'best', 'well']);
    expect(comparatives('red')).toEqual([]);
    expect(comparatives('tired')).toEqual([]);
  });

  it('offers pronoun forms', () => {
    expect(englishForms('I', 'people')).toEqual(['me', 'my', 'mine', 'myself']);
    expect(englishForms('they', 'people')).toEqual(['them', 'their', 'theirs', 'themselves']);
  });

  it('gives nothing for other word types', () => {
    expect(englishForms('hello', 'social')).toEqual([]);
    expect(englishForms('what', 'question')).toEqual([]);
  });
});
