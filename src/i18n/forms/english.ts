/**
 * English word forms for the long-press bubble: verb tenses, plurals,
 * comparatives and pronoun cases. Rule-based with irregular tables, so it also
 * works for buttons people add themselves. Only single words (or a verb plus a
 * particle, like "wake up") get forms; longer phrases do not.
 */
import type { WordType } from '@/theme/colors';

const VOWELS = 'aeiou';
const isVowel = (c: string | undefined) => !!c && VOWELS.includes(c);

/** base: [3rd person, past, past participle (when different), -ing (when irregular)] */
const IRREGULAR_VERBS: Record<string, [string, string, string?]> = {
  be: ['is', 'was', 'been'],
  bite: ['bites', 'bit', 'bitten'],
  blow: ['blows', 'blew', 'blown'],
  break: ['breaks', 'broke', 'broken'],
  bring: ['brings', 'brought'],
  build: ['builds', 'built'],
  buy: ['buys', 'bought'],
  catch: ['catches', 'caught'],
  choose: ['chooses', 'chose', 'chosen'],
  come: ['comes', 'came'],
  cut: ['cuts', 'cut'],
  dig: ['digs', 'dug'],
  do: ['does', 'did', 'done'],
  draw: ['draws', 'drew', 'drawn'],
  drink: ['drinks', 'drank', 'drunk'],
  eat: ['eats', 'ate', 'eaten'],
  fall: ['falls', 'fell', 'fallen'],
  feed: ['feeds', 'fed'],
  feel: ['feels', 'felt'],
  find: ['finds', 'found'],
  fly: ['flies', 'flew', 'flown'],
  forget: ['forgets', 'forgot', 'forgotten'],
  get: ['gets', 'got'],
  give: ['gives', 'gave', 'given'],
  go: ['goes', 'went', 'gone'],
  grow: ['grows', 'grew', 'grown'],
  have: ['has', 'had'],
  hide: ['hides', 'hid', 'hidden'],
  hit: ['hits', 'hit'],
  hold: ['holds', 'held'],
  hurt: ['hurts', 'hurt'],
  keep: ['keeps', 'kept'],
  know: ['knows', 'knew', 'known'],
  leave: ['leaves', 'left'],
  let: ['lets', 'let'],
  lose: ['loses', 'lost'],
  make: ['makes', 'made'],
  meet: ['meets', 'met'],
  pay: ['pays', 'paid'],
  put: ['puts', 'put'],
  read: ['reads', 'read'],
  ride: ['rides', 'rode', 'ridden'],
  run: ['runs', 'ran', 'run'],
  say: ['says', 'said'],
  see: ['sees', 'saw', 'seen'],
  sell: ['sells', 'sold'],
  send: ['sends', 'sent'],
  shake: ['shakes', 'shook', 'shaken'],
  shut: ['shuts', 'shut'],
  sing: ['sings', 'sang', 'sung'],
  sit: ['sits', 'sat'],
  sleep: ['sleeps', 'slept'],
  speak: ['speaks', 'spoke', 'spoken'],
  stand: ['stands', 'stood'],
  swim: ['swims', 'swam', 'swum'],
  take: ['takes', 'took', 'taken'],
  teach: ['teaches', 'taught'],
  tell: ['tells', 'told'],
  think: ['thinks', 'thought'],
  throw: ['throws', 'threw', 'thrown'],
  understand: ['understands', 'understood'],
  wake: ['wakes', 'woke', 'woken'],
  wear: ['wears', 'wore', 'worn'],
  win: ['wins', 'won'],
  write: ['writes', 'wrote', 'written'],
};

/** Words that already are inflected or have special form sets. */
const SPECIAL: Record<string, string[]> = {
  is: ['am', 'are', 'was', 'were', 'be', 'being'],
  am: ['is', 'are', 'was'],
  are: ['is', 'am', 'were'],
  can: ['can’t', 'could', 'couldn’t'],
  will: ['won’t', 'would'],
  // Pronouns: case and possessive forms (as in grammar pop-ups in other AAC apps).
  i: ['me', 'my', 'mine', 'myself'],
  me: ['I', 'my', 'mine', 'myself'],
  you: ['your', 'yours', 'yourself'],
  he: ['him', 'his', 'himself'],
  she: ['her', 'hers', 'herself'],
  it: ['its', 'itself'],
  we: ['us', 'our', 'ours', 'ourselves'],
  they: ['them', 'their', 'theirs', 'themselves'],
  my: ['mine', 'I', 'me'],
  your: ['yours', 'you'],
  this: ['these'],
  that: ['those'],
  good: ['better', 'best', 'well'],
  bad: ['worse', 'worst', 'badly'],
  far: ['further', 'furthest'],
  many: ['more', 'most'],
};

const IRREGULAR_PLURALS: Record<string, string> = {
  child: 'children',
  person: 'people',
  man: 'men',
  woman: 'women',
  foot: 'feet',
  tooth: 'teeth',
  mouse: 'mice',
  goose: 'geese',
  knife: 'knives',
  leaf: 'leaves',
  wolf: 'wolves',
  half: 'halves',
  life: 'lives',
  loaf: 'loaves',
  scarf: 'scarves',
  potato: 'potatoes',
  tomato: 'tomatoes',
  hero: 'heroes',
};

/** Same in the plural, or not usually counted. */
const NO_PLURAL = new Set([
  'sheep', 'fish', 'deer', 'water', 'milk', 'juice', 'tea', 'rice', 'bread', 'cheese', 'pasta', 'food', 'music', 'homework',
  'money', 'ice', 'cereal', 'lemonade', 'hot chocolate', 'medicine', 'help', 'free time', 'information', 'furniture', 'news',
  'home', 'school', 'breakfast', 'lunch', 'dinner', 'bath', 'bedtime',
]);

/** Second words that keep a two-word label a verb phrase. */
const PARTICLES = new Set(['up', 'down', 'out', 'in', 'on', 'off', 'away', 'back', 'over', 'it', 'me', 'us', 'them', 'dressed', 'ready', 'teeth', 'hands']);

const COLOURS = new Set(['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'brown', 'black', 'white', 'grey', 'gray']);
const NO_COMPARE = new Set(['same', 'different', 'more', 'all', 'some', 'little', 'other', 'next', 'last', 'first', 'yucky', 'finished', 'wrong', 'right', 'dead', 'empty', 'full']);

function syllables(word: string) {
  const groups = word.toLowerCase().replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, groups?.length ?? 1);
}

/** One syllable ending consonant-vowel-consonant (not w, x or y): double the last letter. */
function doublesFinal(word: string) {
  const n = word.length;
  if (n < 3 || syllables(word) !== 1) return false;
  const [a, b, c] = [word[n - 3], word[n - 2], word[n - 1]];
  return !isVowel(a) && isVowel(b) && !isVowel(c) && !'wxy'.includes(c);
}

export function thirdPerson(v: string) {
  if (IRREGULAR_VERBS[v]) return IRREGULAR_VERBS[v][0];
  if (/(s|x|z|ch|sh|o)$/.test(v)) return `${v}es`;
  if (/[^aeiou]y$/.test(v)) return `${v.slice(0, -1)}ies`;
  return `${v}s`;
}

export function pastTense(v: string) {
  if (IRREGULAR_VERBS[v]) return IRREGULAR_VERBS[v][1];
  if (v.endsWith('e')) return `${v}d`;
  if (/[^aeiou]y$/.test(v)) return `${v.slice(0, -1)}ied`;
  if (doublesFinal(v)) return `${v}${v[v.length - 1]}ed`;
  return `${v}ed`;
}

export function presentParticiple(v: string) {
  if (v === 'be') return 'being';
  if (v.endsWith('ie')) return `${v.slice(0, -2)}ying`;
  if (v.endsWith('e') && !/(ee|ye|oe)$/.test(v)) return `${v.slice(0, -1)}ing`;
  if (doublesFinal(v)) return `${v}${v[v.length - 1]}ing`;
  return `${v}ing`;
}

export function plural(noun: string): string | null {
  const lower = noun.toLowerCase();
  if (NO_PLURAL.has(lower)) return null;
  const words = noun.split(' ');
  const last = words[words.length - 1];
  const l = last.toLowerCase();
  let p: string | null;
  if (IRREGULAR_PLURALS[l]) p = IRREGULAR_PLURALS[l];
  else if (NO_PLURAL.has(l)) p = null;
  else if (/(ss|us|x|z|ch|sh)$/.test(l)) p = `${last}es`;
  else if (l.endsWith('s')) p = null; // already plural (trousers, socks, glasses…)
  else if (/[^aeiou]y$/.test(l)) p = `${last.slice(0, -1)}ies`;
  else p = `${last}s`;
  return p ? [...words.slice(0, -1), p].join(' ') : null;
}

export function comparatives(adj: string): string[] {
  const a = adj.toLowerCase();
  if (SPECIAL[a]) return SPECIAL[a];
  if (COLOURS.has(a) || NO_COMPARE.has(a) || /(ed|ing|ful)$/.test(a)) return [];
  if (syllables(a) >= 3) return [`more ${a}`, `most ${a}`];
  if (a.endsWith('e')) return [`${a}r`, `${a}st`];
  if (/[^aeiou]y$/.test(a)) return [`${a.slice(0, -1)}ier`, `${a.slice(0, -1)}iest`];
  if (doublesFinal(a)) return [`${a}${a[a.length - 1]}er`, `${a}${a[a.length - 1]}est`];
  return [`${a}er`, `${a}est`];
}

export function verbForms(v: string): string[] {
  const irr = IRREGULAR_VERBS[v];
  const out = [thirdPerson(v), pastTense(v), presentParticiple(v)];
  if (irr?.[2] && irr[2] !== irr[1]) out.push(irr[2]);
  return out;
}

/**
 * Forms for an English label, by word type. Returns [] when the label is a
 * phrase or the word has no useful forms.
 */
export function englishForms(label: string, type: WordType): string[] {
  const text = label.trim();
  if (!text || /[.!?,]/.test(text)) return [];
  const words = text.split(/\s+/);
  const lower = text.toLowerCase();

  if (SPECIAL[lower]) return SPECIAL[lower];

  if (type === 'action') {
    // A verb, or a verb with a particle or object ("wake up", "get dressed", "help me").
    if (words.length > 2) return [];
    if (words.length === 2 && !PARTICLES.has(words[1].toLowerCase())) return [];
    const head = words[0].toLowerCase();
    if (!/^[a-z]+$/.test(head)) return [];
    const rest = words.slice(1).join(' ');
    return verbForms(head).map((f) => (rest ? `${f} ${rest}` : f));
  }
  if (type === 'thing' || type === 'place' || type === 'body') {
    if (words.length > 2) return [];
    const p = plural(text);
    return p ? [p] : [];
  }
  if (type === 'people') {
    if (words.length > 1) return [];
    const p = plural(text);
    return p ? [p] : [];
  }
  if (type === 'describe') {
    if (words.length > 1) return [];
    return comparatives(text);
  }
  return [];
}
