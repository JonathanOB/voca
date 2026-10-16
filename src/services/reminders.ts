/**
 * Schedule reminders as local notifications (scheduled on the device, no
 * internet or server). Each timed activity with a reminder repeats daily.
 * Voca's reminders are re-created whenever the schedule changes.
 */
import type * as NotificationsModule from 'expo-notifications';
import { Platform } from 'react-native';

import { i18n } from '@/i18n';
import { formatTime, reminderAt } from './time';

export const REMIND_CHOICES = [0, 5, 10, 15, 30];
const PREFIX = 'voca-sched-';
const CHANNEL = 'schedule';

export interface ReminderJob {
  id: string;
  label: string;
  time: string;
  before: number;
}

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

// Loaded on first use, so a build without the notifications module still starts (reminders just turn off).
let loaded: typeof NotificationsModule | null | undefined;
function notifications(): typeof NotificationsModule | null {
  if (loaded !== undefined) return loaded;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    loaded = supported ? (require('expo-notifications') as typeof NotificationsModule) : null;
  } catch {
    loaded = null;
  }
  return loaded;
}

let initialised = false;
export function initNotifications() {
  const Notifications = notifications();
  if (!Notifications || initialised) return;
  initialised = true;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
  } catch {
    loaded = null;
  }
}

async function ensureChannel(Notifications: typeof NotificationsModule) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: i18n.t('reminders.channel'),
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** Asks for permission when a reminder is first set. Resolves false if notifications are off. */
export async function ensureReminderPermission(): Promise<boolean> {
  const Notifications = notifications();
  if (!Notifications) return false;
  try {
    await ensureChannel(Notifications);
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Replaces Voca's scheduled reminders with `jobs`. */
export async function syncReminders(jobs: ReminderJob[], lang: string) {
  const Notifications = notifications();
  if (!Notifications) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(scheduled.filter((n) => n.identifier.startsWith(PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
    if (!jobs.length || !(await Notifications.getPermissionsAsync()).granted) return;
    await ensureChannel(Notifications);
    for (const job of jobs) {
      const at = reminderAt(job.time, job.before);
      if (!at) continue;
      const time = formatTime(job.time, lang);
      await Notifications.scheduleNotificationAsync({
        identifier: PREFIX + job.id,
        content: {
          title: job.before ? i18n.t('reminders.notifTitle', { label: job.label }) : i18n.t('reminders.notifNow', { label: job.label }),
          body: job.before ? i18n.t('reminders.notifSoon', { label: job.label, time }) : time,
          data: { url: '/my-day' },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: at.hour, minute: at.minute, channelId: CHANNEL },
      });
    }
  } catch {
    // Reminders are a convenience; never let them break the app.
  }
}

/** Opens Voca's My Day when a reminder is tapped. */
export function onReminderOpened(open: (url: string) => void) {
  const Notifications = notifications();
  if (!Notifications) return () => {};
  const handle = (r: NotificationsModule.NotificationResponse | null) => {
    const url = r?.notification.request.content.data?.url;
    if (typeof url === 'string') open(url);
  };
  handle(Notifications.getLastNotificationResponse());
  const sub = Notifications.addNotificationResponseReceivedListener(handle);
  return () => sub.remove();
}
