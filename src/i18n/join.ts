/**
 * Joins words into a sentence the way each script expects. Chinese and Japanese
 * are written without spaces, so a space between two CJK words would show as a
 * gap and be read by speech engines as a pause.
 */
const CJK = /[　-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/;

function isCjk(ch: string | undefined) {
  return !!ch && CJK.test(ch);
}

/** The separator to put between two words: '' between CJK words, otherwise a space. */
export function separatorBetween(left: string, right: string) {
  return isCjk(left.slice(-1)) && isCjk(right[0]) ? '' : ' ';
}

export function joinWords(words: string[]) {
  let out = '';
  for (const raw of words) {
    const w = raw.trim();
    if (!w) continue;
    out = out ? out + separatorBetween(out, w) + w : w;
  }
  return out;
}

/** Adds a question mark in the script's own style, unless one is already there. */
export function asQuestion(text: string) {
  if (!text || /[?？]$/.test(text)) return text;
  const base = text.replace(/[.!。！]$/, '');
  return isCjk(base.slice(-1)) ? `${base}？` : `${base}?`;
}
