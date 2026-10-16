import { buildPayload, dayKey, maybeSendDaily, shouldSend, telemetryEndpoint } from './telemetry';

describe('telemetry', () => {
  it('only allows approved events and platforms', () => {
    expect(buildPayload('daily_active', 'ios')).toEqual({ platform: 'ios', event: 'daily_active' });
    expect(buildPayload('daily_active', 'android')).toEqual({ platform: 'android', event: 'daily_active' });
    expect(buildPayload('opened_board', 'ios')).toBeNull();
    expect(buildPayload('daily_active', 'web')).toBeNull();
  });

  it('payload contains nothing but platform and event', () => {
    expect(Object.keys(buildPayload('daily_active', 'ios')!).sort()).toEqual(['event', 'platform']);
  });

  it('sends at most once per calendar day and never without consent', () => {
    const today = dayKey(new Date(2026, 9, 15, 23, 59));
    expect(today).toBe('2026-10-15');
    expect(shouldSend(false, null, today)).toBe(false);
    expect(shouldSend(true, today, today)).toBe(false);
    expect(shouldSend(true, '2026-10-14', today)).toBe(true);
  });

  it('is disabled when no endpoint is configured (this build)', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch' as never);
    expect(telemetryEndpoint()).toBeNull();
    await expect(maybeSendDaily(true, null)).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
