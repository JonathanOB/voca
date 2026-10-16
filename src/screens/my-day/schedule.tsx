import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';

import { AppText } from '@/components/app-text';
import { ButtonPicker } from '@/components/button-picker';
import { Confetti } from '@/components/decor';
import { confirm } from '@/components/dialog';
import { IconButton } from '@/components/icon-button';
import { PushButton } from '@/components/push-button';
import { SymbolImage } from '@/components/symbol-image';
import { TimeBadge, TimeSheet } from '@/components/time-sheet';
import { TODAY_ROUTINE_ID, stdBoardId } from '@/data/standard-content';
import type { RoutineStep } from '@/db/types';
import { speakItems, useSpeechState } from '@/hooks/use-speech';
import { stepSymbol, useLabels } from '@/i18n/labels';
import { BoardView } from '@/screens/board/board-view';
import { newId } from '@/services/ids';
import { selectionHaptic, successHaptic } from '@/services/haptics';
import { sortByTime } from '@/services/time';
import { useApp } from '@/store/app-store';
import { guarded } from '@/store/lock-store';
import { RADIUS, softShadow, useTheme } from '@/theme';

export function ScheduleScreen() {
  return <BoardView boardId={stdBoardId('schedule')} noSentence header={<TodayPlanner />} />;
}

function TodayPlanner() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const routine = useApp((s) => s.routines.find((r) => r.id === TODAY_ROUTINE_ID));
  const steps = useApp(useShallow((s) => s.steps[TODAY_ROUTINE_ID] ?? []));
  const buttons = useApp((s) => s.buttons);
  const [editing, setEditing] = useState(false);
  const [picker, setPicker] = useState(false);
  const [celebrate, setCelebrate] = useState(0);
  const [timing, setTiming] = useState<RoutineStep | null>(null);
  const lang = useApp((s) => s.settings.language);
  const { activeIds } = useSpeechState();
  const done = steps.filter((s) => s.done).length;
  const pending = steps.filter((s) => !s.done);
  const nowId = pending[0]?.id;
  const nextId = pending[1]?.id;
  const allDone = steps.length > 0 && done === steps.length;

  if (!routine) return null;

  const save = (list: RoutineStep[]) => useApp.getState().saveRoutine(routine, list);

  const toggle = async (step: RoutineStep) => {
    await useApp.getState().setStepDone(routine.id, step.id, !step.done);
    if (!step.done) {
      successHaptic();
      const remaining = steps.filter((s) => !s.done && s.id !== step.id).length;
      if (remaining === 0) setCelebrate((c) => c + 1);
    } else selectionHaptic();
  };

  const move = (i: number, d: number) => {
    const list = [...steps];
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    save(list);
  };

  const add = (ids: string[]) => {
    const extra: RoutineStep[] = ids.map((buttonId) => ({
      id: newId('step'),
      routineId: routine.id,
      position: 0,
      buttonId,
      stdKey: null,
      label: null,
      spoken: null,
      symbol: null,
      photo: null,
      audio: null,
      done: false,
    }));
    save([...steps, ...extra]);
  };

  const reset = async () => {
    const ok = await confirm({ title: t('schedule.resetConfirmTitle'), body: t('schedule.resetConfirmBody'), confirmLabel: t('common.reset') });
    if (ok) useApp.getState().resetRoutine(routine.id);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      {celebrate ? <Confetti key={celebrate} /> : null}
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <AppText variant="title" accessibilityRole="header">
            {t('schedule.title')}
          </AppText>
          <AppText variant="caption" muted>
            {t('schedule.subtitle')}
          </AppText>
        </View>
        <IconButton icon="refresh" label={t('schedule.reset')} size={44} variant="soft" onPress={reset} />
        <IconButton
          icon={editing ? 'checkmark' : 'create-outline'}
          label={editing ? t('common.done') : t('common.edit')}
          size={44}
          variant={editing ? 'primary' : 'soft'}
          onPress={() => (editing ? setEditing(false) : guarded(() => setEditing(true)))}
        />
      </View>

      <View style={styles.progressRow} accessible accessibilityLabel={t('schedule.progress', { done, total: steps.length })}>
        <View style={[styles.bar, { backgroundColor: theme.colors.bgAlt }]}>
          <View style={[styles.fill, { width: `${steps.length ? (done / steps.length) * 100 : 0}%`, backgroundColor: theme.colors.success }]} />
        </View>
        <AppText variant="label" color={theme.colors.success}>
          {t('schedule.progress', { done, total: steps.length })}
        </AppText>
      </View>

      {allDone ? (
        <Animated.View entering={FadeIn} style={[styles.allDone, { backgroundColor: theme.colors.successSoft }]}>
          <SymbolImage emoji="🎉" size={40} />
          <AppText variant="subheading" style={{ flex: 1 }}>
            {t('schedule.allDone')}
          </AppText>
        </Animated.View>
      ) : null}

      {steps.length === 0 ? (
        <AppText muted center style={{ padding: 20 }}>
          {t('schedule.empty')}
        </AppText>
      ) : null}

      <View style={{ gap: 10 }}>
        {steps.map((step, i) => {
          const label = L.stepLabel(step, buttons);
          const sym = stepSymbol(step, buttons);
          const isNow = step.id === nowId;
          const isNext = step.id === nextId;
          const btn = step.buttonId ? buttons[step.buttonId] : undefined;
          const speaking = activeIds.includes(step.id);
          return (
            <Animated.View key={step.id} layout={theme.reducedMotion ? undefined : LinearTransition.duration(180)}>
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: isNow ? theme.colors.primarySoft : theme.colors.surface,
                    borderColor: speaking ? theme.colors.focus : isNow ? theme.colors.primary : theme.highContrast ? theme.colors.text : 'transparent',
                    opacity: step.done ? 0.6 : 1,
                  },
                  softShadow(theme, 1),
                ]}
              >
                <Pressable
                  onPress={() => toggle(step)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: step.done }}
                  accessibilityLabel={step.done ? t('schedule.markNotDone') : t('schedule.markDone')}
                  hitSlop={8}
                  style={[styles.check, { borderColor: step.done ? theme.colors.success : theme.colors.border, backgroundColor: step.done ? theme.colors.success : 'transparent' }]}
                >
                  {step.done ? <Ionicons name="checkmark" size={24} color="#FFFFFF" /> : <AppText variant="label" muted>{i + 1}</AppText>}
                </Pressable>
                <Pressable
                  style={styles.rowMain}
                  onPress={() => speakItems([{ id: step.id, text: L.stepSpoken(step, buttons), lang: btn?.lang, audio: step.audio ?? btn?.audio }])}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}${isNow ? `, ${t('schedule.now')}` : isNext ? `, ${t('schedule.next')}` : ''}${step.done ? `, ${t('schedule.done')}` : ''}`}
                >
                  <SymbolImage symbol={sym.symbol} photo={sym.photo} size={48} />
                  <View style={{ flex: 1, gap: 4 }}>
                    {step.time ? <TimeBadge time={step.time} lang={lang} /> : null}
                    <AppText variant="subheading" numberOfLines={2}>
                      {label}
                    </AppText>
                  </View>
                  {isNow ? <Badge text={t('schedule.now')} tone="primary" /> : isNext ? <Badge text={t('schedule.next')} tone="soft" /> : step.done ? <Badge text={t('schedule.done')} tone="success" /> : null}
                </Pressable>
                {editing ? (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <IconButton icon={step.remindBefore !== null && step.remindBefore !== undefined ? 'alarm' : 'time-outline'} label={t('reminders.title')} size={36} variant="soft" onPress={() => setTiming(step)} />
                    <IconButton icon="arrow-up" label={t('common.moveUp')} size={36} variant="soft" disabled={i === 0} onPress={() => move(i, -1)} />
                    <IconButton icon="arrow-down" label={t('common.moveDown')} size={36} variant="soft" disabled={i === steps.length - 1} onPress={() => move(i, 1)} />
                    <IconButton icon="close" label={t('schedule.removeStep')} size={36} variant="soft" onPress={() => save(steps.filter((s) => s.id !== step.id))} />
                  </View>
                ) : null}
              </View>
            </Animated.View>
          );
        })}
      </View>
      <View style={{ marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <PushButton title={t('schedule.add')} icon="add" variant="soft" size="md" onPress={() => guarded(() => setPicker(true))} />
        {editing && steps.some((s) => s.time) ? (
          <PushButton title={t('reminders.sort')} icon="swap-vertical" variant="surface" size="md" onPress={() => save(sortByTime(steps))} />
        ) : null}
      </View>
      <TimeSheet
        visible={!!timing}
        title={timing ? `${t('reminders.title')} · ${L.stepLabel(timing, buttons)}` : ''}
        time={timing?.time}
        remindBefore={timing?.remindBefore}
        lang={lang}
        onClose={() => setTiming(null)}
        onSave={(r) => timing && save(steps.map((s) => (s.id === timing.id ? { ...s, ...r } : s)))}
      />
      <ButtonPicker visible={picker} onClose={() => setPicker(false)} onDone={add} multiple title={t('schedule.pickTitle')} preferBoards={[stdBoardId('schedule')]} />
    </View>
  );
}

function Badge({ text, tone }: { text: string; tone: 'primary' | 'soft' | 'success' }) {
  const theme = useTheme();
  const bg = tone === 'primary' ? theme.colors.primary : tone === 'success' ? theme.colors.success : theme.colors.bgAlt;
  const fg = tone === 'soft' ? theme.colors.text : '#FFFFFF';
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill }}>
      <AppText variant="tiny" color={fg}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  bar: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
  allDone: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: RADIUS.lg, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: RADIUS.lg, borderWidth: 2.5 },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  check: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
