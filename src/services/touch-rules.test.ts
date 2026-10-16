
import { isRepeatTap, longPressDelay, moveItem, nearestIndex } from './touch-rules';

describe('reordering word chips', () => {
  it('moves an item and ignores out-of-range moves', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
    expect(moveItem(['a', 'b'], 1, 5)).toEqual(['a', 'b']);
  });

  it('finds the chip nearest a drop point', () => {
    const layouts = [
      { x: 0, y: 0, width: 80, height: 40 },
      { x: 90, y: 0, width: 80, height: 40 },
      undefined,
      { x: 0, y: 50, width: 80, height: 40 },
    ];
    expect(nearestIndex(layouts, 130, 20)).toBe(1);
    expect(nearestIndex(layouts, 10, 80)).toBe(3);
  });
});

describe('touch help', () => {
  it('ignores repeat taps only inside the window', () => {
    expect(isRepeatTap(1000, 600, 500)).toBe(true);
    expect(isRepeatTap(1200, 600, 500)).toBe(false);
    expect(isRepeatTap(1000, 999, 0)).toBe(false);
  });

  it('keeps the menu long press well after hold-to-select', () => {
    expect(longPressDelay(0)).toBe(450);
    expect(longPressDelay(800)).toBe(2000);
  });
});
