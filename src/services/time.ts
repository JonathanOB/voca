/** Times of day stored as "HH:MM" (24-hour), shown in the user's language. */

export interface HourMinute {
  hour: number;
  minute: number;
}

export function parseTime(hhmm: string | null | undefined): HourMinute | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm ?? '');
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  return hour < 24 && minute < 60 ? { hour, minute } : null;
}

export function toHHMM({ hour, minute }: HourMinute) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(((hour % 24) + 24) % 24)}:${p(((minute % 60) + 60) % 60)}`;
}

/** Adds minutes to a time of day, wrapping round midnight. */
export function addMinutes(t: HourMinute, minutes: number): HourMinute {
  const total = (((t.hour * 60 + t.minute + minutes) % 1440) + 1440) % 1440;
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

/** When a reminder fires: the activity time minus `before` minutes. */
export function reminderAt(time: string, before: number): HourMinute | null {
  const t = parseTime(time);
  return t ? addMinutes(t, -before) : null;
}

export function formatTime(hhmm: string, lang: string): string {
  const t = parseTime(hhmm);
  if (!t) return hhmm;
  try {
    return new Date(2020, 0, 1, t.hour, t.minute).toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' });
  } catch {
    return hhmm;
  }
}

/** Steps with a time first (earliest first); steps without a time keep their order after them. */
export function sortByTime<T extends { time?: string | null }>(steps: T[]): T[] {
  const timed = steps.filter((s) => parseTime(s.time)).sort((a, b) => (a.time! < b.time! ? -1 : a.time! > b.time! ? 1 : 0));
  return [...timed, ...steps.filter((s) => !parseTime(s.time))];
}
