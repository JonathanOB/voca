/**
 * "Find my touch settings": analyses a short tap-the-bubble game and suggests
 * touch settings. Pure functions, so they can be tested.
 */

export interface CalTouch {
  /** Start and end times (ms) and positions (window coordinates). */
  t0: number;
  t1: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface CalRound {
  target: { x: number; y: number; r: number };
  touches: CalTouch[];
}

export type CalNote = 'repeat' | 'hold' | 'size' | 'slips';

export interface CalSuggestion {
  ignoreRepeatMs: number;
  holdMs: number;
  allowSlips: boolean;
  largeButtons: boolean;
  notes: CalNote[];
}

export const REPEAT_CHOICES = [500, 1000, 1500, 2000];
export const HOLD_CHOICES = [300, 500, 800, 1000, 1500];

/** Extra taps within this long after the first hit count as repeats. */
const REPEAT_WINDOW = 1500;
/** Touches shorter than this, away from the target, look accidental. */
const BRUSH_MS = 150;
/** Movement (px) during a press that suggests tremor or drift. */
const SLIP_PX = 12;

const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);

function median(v: number[]) {
  if (!v.length) return 0;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Smallest choice at or above `v` (or the largest choice). */
export function roundUpTo(choices: number[], v: number) {
  return choices.find((c) => c >= v) ?? choices[choices.length - 1];
}

export function analyseCalibration(rounds: CalRound[]): CalSuggestion {
  const notes: CalNote[] = [];
  let roundsWithRepeats = 0;
  let longestRepeatGap = 0;
  let brushes = 0;
  let misses = 0;
  const hitDurations: number[] = [];
  const hitMoves: number[] = [];

  for (const round of rounds) {
    const { x, y, r } = round.target;
    const touches = [...round.touches].sort((a, b) => a.t0 - b.t0);
    const isHit = (tc: CalTouch) => dist(tc.x0, tc.y0, x, y) <= r * 1.15;
    const firstHitIndex = touches.findIndex(isHit);
    if (touches.length && !isHit(touches[0])) misses++;
    if (firstHitIndex < 0) continue;
    const hit = touches[firstHitIndex];
    hitDurations.push(hit.t1 - hit.t0);
    hitMoves.push(dist(hit.x0, hit.y0, hit.x1, hit.y1));

    // Quick touches away from the target before the real tap look like accidental brushes.
    brushes += touches.slice(0, firstHitIndex).filter((tc) => !isHit(tc) && tc.t1 - tc.t0 < BRUSH_MS).length;

    const repeats = touches.slice(firstHitIndex + 1).filter((tc) => tc.t0 - hit.t0 <= REPEAT_WINDOW);
    if (repeats.length) {
      roundsWithRepeats++;
      longestRepeatGap = Math.max(longestRepeatGap, ...repeats.map((tc) => tc.t0 - hit.t0));
    }
  }

  let ignoreRepeatMs = 0;
  if (roundsWithRepeats >= 2) {
    ignoreRepeatMs = roundUpTo(REPEAT_CHOICES, longestRepeatGap + 150);
    notes.push('repeat');
  }

  let holdMs = 0;
  if (brushes >= 3) {
    const target = Math.max(300, Math.min(1000, median(hitDurations) * 0.6));
    holdMs = HOLD_CHOICES.reduce((best, c) => (Math.abs(c - target) < Math.abs(best - target) ? c : best), HOLD_CHOICES[0]);
    notes.push('hold');
  }

  const largeButtons = misses >= 2;
  if (largeButtons) notes.push('size');

  const allowSlips = median(hitMoves) > SLIP_PX;
  if (allowSlips) notes.push('slips');

  return { ignoreRepeatMs, holdMs, allowSlips, largeButtons, notes };
}
