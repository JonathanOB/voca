import { DEFAULT_QUICK_WORDS, STD_BOARDS, STD_BUTTONS, STD_ROUTINES, STD_STEPS, allStandardSymbols } from '@/data/standard-content';
import { symbolId, symbolSource } from '@/data/symbols';
import en from '@/i18n/locales/en';
import { buildStandardContent } from './seed';

describe('standard content', () => {
  const lib = buildStandardContent(1);

  it('includes all 12 specification boards', () => {
    const core12 = STD_BOARDS.filter((b) => b.core12).map((b) => b.key);
    expect(core12.sort()).toEqual(
      ['body', 'choices', 'core', 'feelings', 'firstthen', 'requests', 'routines', 'safety', 'schedule', 'sensory', 'social', 'waiting'].sort(),
    );
  });

  it('has the exact button sets from the brief for key boards', () => {
    const keys = (k: string) => STD_BOARDS.find((b) => b.key === k)!.buttons.map((b) => en.vocab[b as keyof typeof en.vocab]);
    expect(keys('core')).toEqual([
      'I', 'want', 'need', 'like', 'don’t like', 'more', 'not', 'no', 'yes', 'stop', 'go', 'help', 'different', 'finished', 'again',
      'it', 'that', 'here', 'there', 'what', 'where', 'who', 'my', 'your', 'and', 'please',
    ]);
    expect(keys('safety')).toEqual([
      'help me', 'stop', 'no', 'danger', 'I am lost', 'I need my parent', 'I am hurt', 'I feel unsafe', 'call for help', 'I need to leave',
    ]);
    expect(keys('feelings')).toHaveLength(14);
    expect(keys('sensory')).toHaveLength(14);
    expect(keys('body')).toHaveLength(17);
    expect(keys('choices')).toHaveLength(18);
  });

  it('uses unique stable IDs', () => {
    for (const list of [lib.buttons, lib.boards, lib.items, lib.routines, lib.steps]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
    expect(lib.buttons.every((b) => b.id.startsWith('std:button:'))).toBe(true);
  });

  it('reuses one button across boards instead of duplicating it', () => {
    const stopItems = lib.items.filter((i) => i.buttonId === 'std:button:stop');
    expect(stopItems.length).toBeGreaterThan(1);
    expect(lib.buttons.filter((b) => b.stdKey === 'stop')).toHaveLength(1);
  });

  it('has English wording for every button and routine step', () => {
    for (const key of [...Object.keys(STD_BUTTONS), ...Object.keys(STD_STEPS)]) {
      expect(en.vocab[key as keyof typeof en.vocab]).toBeTruthy();
    }
    for (const b of STD_BOARDS) expect(en.boards[b.key as keyof typeof en.boards]?.name).toBeTruthy();
    for (const r of STD_ROUTINES) expect(en.routines[r.key as keyof typeof en.routines]).toBeTruthy();
  });

  it('has bundled artwork for every standard symbol', () => {
    for (const sym of allStandardSymbols()) {
      expect([sym, symbolSource(symbolId(sym))]).not.toContain(null);
    }
  });

  it('covers all 36 Universal Core words across Core and More core', () => {
    const universalCore = [
      'all', 'can', 'different', 'do', 'finished', 'get', 'go', 'good', 'he', 'help', 'here', 'I', 'in', 'it', 'like', 'look',
      'make', 'more', 'not', 'on', 'open', 'put', 'same', 'she', 'some', 'stop', 'that', 'turn', 'up', 'want', 'what', 'when',
      'where', 'who', 'why', 'you',
    ];
    const words = new Set(
      ['core', 'core2'].flatMap((k) => STD_BOARDS.find((b) => b.key === k)!.buttons.map((b) => en.vocab[b as keyof typeof en.vocab])),
    );
    expect(universalCore.filter((w) => !words.has(w))).toEqual([]);
  });

  it('has always-there words that exist as standard buttons', () => {
    for (const k of DEFAULT_QUICK_WORDS) expect(STD_BUTTONS[k]).toBeDefined();
  });

  it('marks the safety board as speak-immediately with an urgent tone', () => {
    const safety = lib.boards.find((b) => b.stdKey === 'safety')!;
    expect(safety.tapAction).toBe('speak');
    expect(safety.tone).toBe('urgent');
  });
});
