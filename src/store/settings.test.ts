import { DEFAULT_SETTINGS, normalizeSettings } from './settings';

describe('normalizeSettings', () => {
  it('fills new fields with defaults (forward-compatible with older stored settings)', () => {
    const s = normalizeSettings({ language: 'fr' } as never);
    expect(s.language).toBe('fr');
    expect(s.tapAction).toBe(DEFAULT_SETTINGS.tapAction);
    expect(s.firstThen).toEqual(DEFAULT_SETTINGS.firstThen);
  });

  it('clamps speech and display values to safe ranges', () => {
    const s = normalizeSettings({ rate: 9, pitch: -1, textScale: 5, timerMinutes: -3 });
    expect(s.rate).toBe(1.6);
    expect(s.pitch).toBe(0.5);
    expect(s.textScale).toBe(1.6);
    expect(s.timerMinutes).toBe(1);
    expect(normalizeSettings({ timerMinutes: 0 }).timerMinutes).toBe(5);
  });

  it('drops unknown quick actions', () => {
    const s = normalizeSettings({ quickActions: ['talk', 'nope' as never, 'safety'] });
    expect(s.quickActions).toEqual(['talk', 'safety']);
  });

  it('starts with telemetry off', () => {
    expect(DEFAULT_SETTINGS.telemetryConsent).toBe(false);
  });
});
