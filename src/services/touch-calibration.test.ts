import { analyseCalibration, roundUpTo, type CalRound, type CalTouch } from './touch-calibration';

const target = { x: 200, y: 300, r: 44 };
const tap = (t0: number, x = 200, y = 300, dur = 120, move = 0): CalTouch => ({ t0, t1: t0 + dur, x0: x, y0: y, x1: x + move, y1: y });

describe('analyseCalibration', () => {
  it('suggests nothing for steady, accurate taps', () => {
    const rounds: CalRound[] = Array.from({ length: 8 }, (_, i) => ({ target, touches: [tap(i * 3000)] }));
    expect(analyseCalibration(rounds)).toEqual({ ignoreRepeatMs: 0, holdMs: 0, allowSlips: false, largeButtons: false, notes: [] });
  });

  it('suggests ignoring repeats when taps bounce', () => {
    const rounds: CalRound[] = Array.from({ length: 8 }, (_, i) => ({
      target,
      touches: i < 3 ? [tap(0), tap(400), tap(700)] : [tap(0)],
    }));
    const s = analyseCalibration(rounds);
    expect(s.notes).toContain('repeat');
    expect(s.ignoreRepeatMs).toBe(1000); // 700 ms gap + margin, rounded up
  });

  it('suggests hold-to-select after several quick brushes away from the target', () => {
    const rounds: CalRound[] = Array.from({ length: 8 }, (_, i) => ({
      target,
      touches: i < 4 ? [tap(0, 40, 40, 60), tap(500, 200, 300, 600)] : [tap(0, 200, 300, 600)],
    }));
    const s = analyseCalibration(rounds);
    expect(s.notes).toContain('hold');
    expect(s.holdMs).toBe(300); // 60% of a 600 ms press
  });

  it('suggests larger buttons when first taps miss, and slips when fingers drift', () => {
    const rounds: CalRound[] = Array.from({ length: 8 }, (_, i) => ({
      target,
      touches: i < 3 ? [tap(0, 300, 300, 200), tap(800, 200, 300, 200, 20)] : [tap(0, 200, 300, 200, 20)],
    }));
    const s = analyseCalibration(rounds);
    expect(s.largeButtons).toBe(true);
    expect(s.allowSlips).toBe(true);
  });
});

describe('roundUpTo', () => {
  it('picks the next choice up, or the largest', () => {
    expect(roundUpTo([500, 1000], 200)).toBe(500);
    expect(roundUpTo([500, 1000], 600)).toBe(1000);
    expect(roundUpTo([500, 1000], 5000)).toBe(1000);
  });
});
