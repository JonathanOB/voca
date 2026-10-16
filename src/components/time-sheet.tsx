/**
 * Set a time of day and an optional daily reminder for a schedule activity.
 * Big −/+ buttons instead of a wheel picker (easier for many people to use).
 */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import { AppText } from './app-text';
import { Chip, FieldLabel } from './form';
import { IconButton } from './icon-button';
import { InfoBanner } from './layout';
import { PushButton } from './push-button';
import { Sheet } from './sheet';
import { REMIND_CHOICES, ensureReminderPermission } from '@/services/reminders';
import { addMinutes, formatTime, parseTime, toHHMM, type HourMinute } from '@/services/time';
import { toast } from '@/store/ui-store';
import { RADIUS, useTheme } from '@/theme';

export interface TimeSheetResult {
  time: string | null;
  remindBefore: number | null;
}

export function TimeSheet({
  visible,
  title,
  time,
  remindBefore,
  lang,
  onClose,
  onSave,
}: {
  visible: boolean;
  title: string;
  time: string | null | undefined;
  remindBefore: number | null | undefined;
  lang: string;
  onClose: () => void;
  onSave: (r: TimeSheetResult) => void;
}) {
  if (!visible) return null;
  return <TimeSheetBody title={title} time={time} remindBefore={remindBefore} lang={lang} onClose={onClose} onSave={onSave} />;
}

function TimeSheetBody({
  title,
  time,
  remindBefore,
  lang,
  onClose,
  onSave,
}: {
  title: string;
  time: string | null | undefined;
  remindBefore: number | null | undefined;
  lang: string;
  onClose: () => void;
  onSave: (r: TimeSheetResult) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState<HourMinute | null>(parseTime(time));
  const [remind, setRemind] = useState<number | null>(remindBefore ?? null);

  const nudge = (minutes: number) => setValue((v) => addMinutes(v ?? { hour: 8, minute: 0 }, minutes));

  const save = async () => {
    const result = { time: value ? toHHMM(value) : null, remindBefore: value ? remind : null };
    if (result.time && result.remindBefore !== null) {
      const ok = await ensureReminderPermission();
      if (!ok) {
        toast(t('reminders.permission'), { tone: 'warning', action: { label: t('reminders.openSettings'), onPress: () => Linking.openSettings() } });
      } else {
        toast(t('reminders.saved', { time: formatTime(result.time, lang) }), { tone: 'success' });
      }
    }
    onSave(result);
    onClose();
  };

  return (
    <Sheet visible onClose={onClose} title={title}>
      <FieldLabel>{t('reminders.time')}</FieldLabel>
      {value ? (
        <View style={[styles.clock, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.col}>
            <IconButton icon="chevron-up" label={`${t('reminders.hour')} ${t('reminders.later')}`} variant="soft" onPress={() => nudge(60)} />
            <IconButton icon="chevron-down" label={`${t('reminders.hour')} ${t('reminders.earlier')}`} variant="soft" onPress={() => nudge(-60)} />
          </View>
          <AppText size={44} weight="black" style={{ minWidth: 150, textAlign: 'center' }} accessibilityLiveRegion="polite">
            {formatTime(toHHMM(value), lang)}
          </AppText>
          <View style={styles.col}>
            <IconButton icon="chevron-up" label={`${t('reminders.minute')} ${t('reminders.later')}`} variant="soft" onPress={() => nudge(5)} />
            <IconButton icon="chevron-down" label={`${t('reminders.minute')} ${t('reminders.earlier')}`} variant="soft" onPress={() => nudge(-5)} />
          </View>
        </View>
      ) : (
        <PushButton title={t('reminders.setTime')} icon="time-outline" variant="soft" onPress={() => setValue({ hour: 8, minute: 0 })} />
      )}
      {value ? (
        <View style={{ marginTop: 10, alignItems: 'flex-start' }}>
          <Chip label={t('reminders.noTime')} icon="close" onPress={() => setValue(null)} />
        </View>
      ) : null}

      <FieldLabel>{t('reminders.remind')}</FieldLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, opacity: value ? 1 : 0.45 }} accessibilityRole="radiogroup" accessibilityLabel={t('reminders.remind')}>
        <Chip label={t('reminders.off')} selected={remind === null} onPress={() => setRemind(null)} />
        {REMIND_CHOICES.map((m) => (
          <Chip key={m} label={m === 0 ? t('reminders.atTime') : t('reminders.before', { n: m })} selected={remind === m} onPress={() => value && setRemind(m)} />
        ))}
      </View>
      <View style={{ marginTop: 14 }}>
        <InfoBanner text={t('reminders.note')} icon="notifications-outline" />
      </View>
      <View style={{ marginTop: 16, marginBottom: 8 }}>
        <PushButton title={t('common.save')} icon="checkmark" full onPress={save} />
      </View>
    </Sheet>
  );
}

/** Small time label shown on a schedule row. */
export function TimeBadge({ time, lang }: { time: string; lang: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.bgAlt }]}>
      <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
      <AppText variant="tiny">{formatTime(time, lang)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  clock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: RADIUS.lg, borderWidth: 2 },
  col: { gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill, alignSelf: 'flex-start' },
});
