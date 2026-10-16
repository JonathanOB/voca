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

type LocalNotifications = Pick<
  typeof NotificationsModule,
  | 'setNotificationHandler'
  | 'setNotificationChannelAsync'
  | 'getPermissionsAsync'
  | 'requestPermissionsAsync'
  | 'getAllScheduledNotificationsAsync'
  | 'cancelScheduledNotificationAsync'
  | 'scheduleNotificationAsync'
  | 'getLastNotificationResponse'
  | 'addNotificationResponseReceivedListener'
  | 'AndroidImportance'
  | 'SchedulableTriggerInputTypes'
>;

/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Only the local-notification parts, loaded file by file. Expo Go on Android lacks the
 * push "topic subscription" native module, which makes the package entry fail to load
 * even though local notifications work. Release and development builds use the full package.
 */
function localOnly(): LocalNotifications {
  return {
    ...require('expo-notifications/build/NotificationsHandler'),
    ...require('expo-notifications/build/NotificationPermissions'),
    ...require('expo-notifications/build/NotificationsEmitter'),
    ...require('expo-notifications/build/Notifications.types'),
    ...require('expo-notifications/build/NotificationChannelManager.types'),
    ...require('expo-notifications/build/setNotificationChannelAsync'),
    ...require('expo-notifications/build/getAllScheduledNotificationsAsync'),
    ...require('expo-notifications/build/cancelScheduledNotificationAsync'),
    ...require('expo-notifications/build/scheduleNotificationAsync'),
  };
}

// Loaded on first use, so a build without the notifications module still starts (reminders just turn off).
let loaded: LocalNotifications | null | undefined;
function notifications(): LocalNotifications | null {
  if (loaded !== undefined) return loaded;
  loaded = null;
  if (!supported) return loaded;
  try {
    loaded = require('expo-notifications') as typeof NotificationsModule;
  } catch {
    try {
      loaded = localOnly();
    } catch {
      loaded = null;
    }
  }
  return loaded;
}
/* eslint-enable @typescript-eslint/no-require-imports */

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

/**
 * Voca's own Android channel, so families can tune reminder sounds separately.
 * Returns the channel to use, or undefined for the default channel (Expo Go cannot create channels).
 */
async function ensureChannel(Notifications: LocalNotifications): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: i18n.t('reminders.channel'),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    return CHANNEL;
  } catch {
    return undefined;
  }
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
    const channelId = await ensureChannel(Notifications);
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
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: at.hour, minute: at.minute, channelId },
      });
    }
  } catch {
    // Reminders are a convenience; never let them break the app.
  }
}

// Asks the reminder sync to run again (e.g. once notifications have just been allowed).
const resyncListeners = new Set<() => void>();
export function requestReminderResync() {
  resyncListeners.forEach((l) => l());
}
export function onReminderResync(listener: () => void) {
  resyncListeners.add(listener);
  return () => {
    resyncListeners.delete(listener);
  };
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
