import { useEffect, useMemo } from 'react';

import { stepLabel } from '@/i18n/labels';
import { syncReminders, type ReminderJob } from '@/services/reminders';
import { useApp } from '@/store/app-store';

/** Keeps the device's scheduled reminders in step with timed schedule activities. */
export function useReminderSync() {
  const ready = useApp((s) => s.ready);
  const language = useApp((s) => s.settings.language);
  const routines = useApp((s) => s.routines);
  const steps = useApp((s) => s.steps);
  const buttons = useApp((s) => s.buttons);

  const jobs = useMemo(() => {
    const out: ReminderJob[] = [];
    for (const r of routines) {
      if (r.kind !== 'schedule' || r.hidden) continue;
      for (const st of steps[r.id] ?? []) {
        if (st.time && st.remindBefore !== null && st.remindBefore !== undefined) {
          out.push({ id: st.id, label: stepLabel(st, buttons), time: st.time, before: st.remindBefore });
        }
      }
    }
    return out;
    // Labels follow the interface language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routines, steps, buttons, language]);

  const signature = `${language}|${JSON.stringify(jobs)}`;
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => syncReminders(jobs, language), 600);
    return () => clearTimeout(id);
    // Re-sync only when the reminders themselves change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, signature]);
}
