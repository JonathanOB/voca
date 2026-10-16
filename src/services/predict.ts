/**
 * Typing suggestions. The device keyboard already predicts words in the user's
 * language; Voca adds suggestions from its own vocabulary, the person's saved
 * phrases and recent messages, and words learned from what they type and say.
 * Everything is stored and computed on the device.
 *
 * Evidence on word prediction is mixed: it saves keystrokes, but scanning a
 * list costs time and attention (Koester & Levine, 1996). So suggestions are
 * few (three words, two phrases), optional, and only on the typing screen;
 * symbol boards keep fixed positions instead (motor planning).
 */
import * as repo from '@/db/repo';
import { i18n } from '@/i18n';
import { LANGUAGES } from '@/i18n/languages';

export interface WordModel {
  /** How often each word was used. */
  words: Record<string, number>;
  /** How often a word followed another. */
  pairs: Record<string, Record<string, number>>;
}

const MAX_WORDS = 3000;
const MAX_NEXT = 12;
const PUNCT = /^[.,!?;:"“”‘’'()[\]{}…¡¿«»—-]+|[.,!?;:"“”‘’'()[\]{}…¡¿«»—-]+$/g;
const CJK = /[぀-ヿ㐀-䶿一-鿿]/;

export const emptyModel = (): WordModel => ({ words: {}, pairs: {} });

export function tokenize(text: string): string[] {
  return text
    .normalize('NFC')
    .split(/\s+/)
    .map((w) => w.replace(PUNCT, ''))
    .filter(Boolean);
}

export function learn(model: WordModel, text: string) {
  if (CJK.test(text)) return model; // no spaces between words; the device keyboard handles these
  const tokens = tokenize(text).map((w) => w.toLowerCase());
  tokens.forEach((w, i) => {
    model.words[w] = (model.words[w] ?? 0) + 1;
    if (i > 0) {
      const prev = tokens[i - 1];
      const next = (model.pairs[prev] ??= {});
      next[w] = (next[w] ?? 0) + 1;
      const keys = Object.keys(next);
      if (keys.length > MAX_NEXT) delete next[keys.sort((a, b) => next[a] - next[b])[0]];
    }
  });
  const all = Object.keys(model.words);
  if (all.length > MAX_WORDS) {
    all
      .sort((a, b) => model.words[a] - model.words[b])
      .slice(0, all.length - MAX_WORDS)
      .forEach((w) => {
        delete model.words[w];
        delete model.pairs[w];
      });
  }
  return model;
}

/** Up to three words for the current text: completions of a partial word, or next words. */
export function suggestWords(text: string, model: WordModel, lexicon: string[], max = 3): string[] {
  if (!text || CJK.test(text)) return [];
  const endsWithSpace = /\s$/.test(text);
  const tokens = tokenize(text);
  if (endsWithSpace) {
    const prev = tokens[tokens.length - 1]?.toLowerCase();
    const next = prev ? model.pairs[prev] : undefined;
    return next ? Object.keys(next).sort((a, b) => next[b] - next[a]).slice(0, max) : [];
  }
  const partial = (tokens[tokens.length - 1] ?? '').toLowerCase();
  if (!partial) return [];
  const scores = new Map<string, { word: string; score: number }>();
  for (const [w, n] of Object.entries(model.words)) {
    if (w.startsWith(partial) && w !== partial) scores.set(w, { word: w, score: 10 + n * 10 });
  }
  lexicon.forEach((w, i) => {
    const lower = w.toLowerCase();
    if (lower.startsWith(partial) && lower !== partial && !scores.has(lower)) scores.set(lower, { word: w, score: 1 - i / (lexicon.length + 1) });
  });
  return [...scores.values()]
    .sort((a, b) => b.score - a.score || a.word.length - b.word.length)
    .slice(0, max)
    .map((x) => x.word);
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Saved phrases or recent messages that start with (or contain) what has been typed. */
export function suggestPhrases(text: string, phrases: string[], max = 2): string[] {
  const q = fold(text);
  if (q.length < 2) return [];
  const seen = new Set<string>();
  const starts: string[] = [];
  const contains: string[] = [];
  for (const p of phrases) {
    const f = fold(p);
    if (!f || f === q || seen.has(f)) continue;
    seen.add(f);
    if (f.startsWith(q)) starts.push(p);
    else if (f.includes(` ${q}`)) contains.push(p);
  }
  return [...starts, ...contains].slice(0, max);
}

/** Replaces the partial word being typed (or appends after a space) with a suggestion. */
export function applyWord(text: string, word: string) {
  if (!text || /\s$/.test(text)) return `${text}${word} `;
  return text.replace(/\S+$/, word) + ' ';
}

// --- device storage -------------------------------------------------------------

const models = new Map<string, WordModel>();
const lexicons = new Map<string, string[]>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const key = (lang: string) => `lm:${lang}`;

export async function loadModel(lang: string) {
  if (models.has(lang)) return models.get(lang)!;
  const stored = await repo.getKV<WordModel>(key(lang)).catch(() => null);
  const model = stored && typeof stored === 'object' && stored.words ? stored : emptyModel();
  models.set(lang, model);
  return model;
}

export function getModel(lang: string) {
  return models.get(lang) ?? emptyModel();
}

/** Words Voca already knows in this language (its standard vocabulary). */
export function vocabularyLexicon(lang: string): string[] {
  const cached = lexicons.get(lang);
  if (cached) return cached;
  const bundle = (i18n.getResourceBundle(lang, 'vocab') ?? {}) as Record<string, string>;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const text of Object.values(bundle)) {
    for (const w of tokenize(text)) {
      const lower = w.toLowerCase();
      if (w.length < 2 || seen.has(lower)) continue;
      seen.add(lower);
      out.push(w);
    }
  }
  lexicons.set(lang, out);
  return out;
}

/** Learns from a message the person typed or said (when "Learn from what I type" is on). */
export function learnFromText(text: string, settings: { language: string; learnWords: boolean }) {
  if (!settings.learnWords || !text.trim()) return;
  const lang = settings.language;
  loadModel(lang).then((model) => {
    learn(model, text);
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => repo.setKV(key(lang), model).catch(() => {}), 800);
  });
}

export async function forgetLearned() {
  models.clear();
  for (const l of LANGUAGES) await repo.setKV(key(l.code), emptyModel()).catch(() => {});
}
