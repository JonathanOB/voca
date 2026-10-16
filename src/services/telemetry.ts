/**
 * Optional, consent-based usage telemetry (brief §14).
 *
 * - Disabled entirely unless an endpoint is configured in app.json
 *   (expo.extra.telemetryEndpoint) AND the user has opted in.
 * - At most one request per installation per calendar day.
 * - Payload is limited to { platform, event } from an allowlist.
 *   No communication content, IDs, names or device identifiers.
 * - Never queued: if offline or the request fails, it is discarded.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const ALLOWED_EVENTS = ['daily_active'] as const;
export type TelemetryEvent = (typeof ALLOWED_EVENTS)[number];

export interface TelemetryPayload {
  platform: 'ios' | 'android';
  event: TelemetryEvent;
}

export function telemetryEndpoint(): string | null {
  const url = (Constants.expoConfig?.extra as { telemetryEndpoint?: string } | undefined)?.telemetryEndpoint;
  return typeof url === 'string' && /^https:\/\//.test(url) ? url : null;
}

export function telemetryAvailable() {
  return telemetryEndpoint() !== null && (Platform.OS === 'ios' || Platform.OS === 'android');
}

/** Local calendar day, e.g. 2026-10-15. */
export function dayKey(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function buildPayload(event: string, platform: string): TelemetryPayload | null {
  if (!(ALLOWED_EVENTS as readonly string[]).includes(event)) return null;
  if (platform !== 'ios' && platform !== 'android') return null;
  return { platform, event: event as TelemetryEvent };
}

export function shouldSend(consent: boolean, lastSent: string | null, today = dayKey()) {
  return consent && lastSent !== today;
}

/**
 * Sends today's ping if allowed. Returns the day key to store as "last sent"
 * (stored even on failure, so a failed attempt is not retried or queued).
 */
export async function maybeSendDaily(consent: boolean, lastSent: string | null): Promise<string | null> {
  const endpoint = telemetryEndpoint();
  const today = dayKey();
  if (!endpoint || !shouldSend(consent, lastSent, today)) return null;
  const payload = buildPayload('daily_active', Platform.OS);
  if (!payload) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'omit',
    });
    clearTimeout(timer);
  } catch {
    // discarded by design
  }
  return today;
}
