import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { Confetti, FloatingSymbol } from '@/components/decor';
import { Segmented } from '@/components/form';
import { EmptyState } from '@/components/layout';
import { Mascot } from '@/components/mascot';
import { PushButton } from '@/components/push-button';
import { SymbolImage } from '@/components/symbol-image';
import type { RoutineStep } from '@/db/types';
import { speakItems, useSpeechState } from '@/hooks/use-speech';
import { stepSymbol, useLabels } from '@/i18n/labels';
import { selectionHaptic, successHaptic } from '@/services/haptics';
import { useApp } from '@/store/app-store';
import { RADIUS, softShadow, useTheme } from '@/theme';

/**
 * Plays a routine one step at a time (or as a checklist). Skipping, repeating
 * or going back is never treated as an error.
 */
export function RoutinePlayer({ routineId }: { routineId: string }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const L = useLabels();
  const { t } = L;
  const routine = useApp((s) => s.routines.find((r) => r.id === routineId));
  const steps = useApp(useShallow((s) => s.steps[routineId] ?? []));
  const buttons = useApp((s) => s.buttons);
  const { speaking } = useSpeechState();
  const firstOpen = useMemo(() => Math.max(0, steps.findIndex((s) => !s.done)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [index, setIndex] = useState(firstOpen);
  const [dir, setDir] = useState<1 | -1>(1);
  const [mode, setMode] = useState<'one' | 'list'>('one');
  const allDone = steps.length > 0 && steps.every((s) => s.done);
  // A gentle buzz when the last step is ticked off (not when opening a finished routine).
  const wasDone = useRef(allDone);
  useEffect(() => {
    if (allDone && !wasDone.current) successHaptic();
    wasDone.current = allDone;
  }, [allDone]);

  if (!routine) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <AppHeader title="" onBack={() => router.back()} />
        <EmptyState title={t('routine.notFound')} />
      </View>
    );
  }

  const step = steps[Math.min(index, steps.length - 1)];
  const say = (s: RoutineStep | undefined) => {
    if (!s) return;
    const btn = s.buttonId ? buttons[s.buttonId] : undefined;
    speakItems([{ id: s.id, text: L.stepSpoken(s, buttons), lang: btn?.lang, audio: s.audio ?? btn?.audio }]);
  };
  const goTo = (i: number, speak = true) => {
    const next = Math.max(0, Math.min(steps.length - 1, i));
    setDir(next >= index ? 1 : -1);
    setIndex(next);
    selectionHaptic();
    if (speak) say(steps[next]);
  };
  const markDone = async () => {
    if (!step) return;
    await useApp.getState().setStepDone(routine.id, step.id, true);
    successHaptic();
    const nextOpen = steps.findIndex((s, i) => i > index && !s.done);
    if (nextOpen >= 0) goTo(nextOpen);
  };
  const restart = async () => {
    await useApp.getState().resetRoutine(routine.id);
    setIndex(0);
  };

  const sym = step ? stepSymbol(step, buttons) : { symbol: null, photo: null };
  const entering = theme.reducedMotion ? FadeIn.duration(150) : (dir === 1 ? FadeInRight : FadeInLeft).duration(260);
  const imgSize = Math.min(theme.width * 0.55, theme.isTablet ? 300 : 220);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <AppHeader title={L.routineName(routine)} onBack={() => (router.canGoBack() ? router.back() : router.replace('/my-day/routines'))} />
      {allDone ? <Confetti /> : null}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, maxWidth: 820, width: '100%', alignSelf: 'center' }}>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'one', label: t('routine.stepView'), icon: 'albums-outline' },
            { value: 'list', label: t('routine.listView'), icon: 'list-outline' },
          ]}
        />

        {allDone ? (
          <Animated.View entering={FadeIn} style={styles.finished}>
            <View style={{ height: 210, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <FloatingSymbol emoji="🌟" size={48} style={{ top: 10, left: '18%' }} />
              <FloatingSymbol emoji="🎉" size={52} style={{ top: 26, right: '16%' }} delay={250} />
              <Mascot size={170} />
            </View>
            <AppText variant="title" center accessibilityRole="header">
              {t('routine.finishedTitle')}
            </AppText>
            <AppText muted center>
              {t('routine.finishedBody')}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <PushButton title={t('routine.startAgain')} icon="refresh" onPress={restart} />
              <PushButton title={t('common.back')} icon="arrow-back" variant="surface" onPress={() => router.back()} />
            </View>
          </Animated.View>
        ) : mode === 'one' && step ? (
          <View style={{ marginTop: 18 }}>
            <View style={styles.dots} accessible accessibilityLabel={t('routine.stepOf', { n: index + 1, total: steps.length })}>
              {steps.map((s, i) => (
                <Pressable key={s.id} onPress={() => goTo(i)} hitSlop={6} accessibilityElementsHidden>
                  <View
                    style={{
                      width: i === index ? 26 : 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: s.done ? theme.colors.success : i === index ? theme.colors.primary : theme.colors.border,
                    }}
                  />
                </Pressable>
              ))}
            </View>
            <AppText variant="label" muted center style={{ marginTop: 8 }}>
              {t('routine.stepOf', { n: index + 1, total: steps.length })}
            </AppText>

            <Animated.View key={step.id} entering={entering} style={[styles.stepCard, { backgroundColor: step.done ? theme.colors.successSoft : theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : 'transparent' }, softShadow(theme, 2)]}>
              <Pressable onPress={() => say(step)} accessibilityRole="button" accessibilityLabel={L.stepLabel(step, buttons)} accessibilityHint={t('routine.repeat')} style={{ alignItems: 'center', gap: 14 }}>
                <SymbolImage symbol={sym.symbol} photo={sym.photo} size={imgSize} />
                <AppText size={theme.isTablet ? 34 : 28} weight="black" center>
                  {L.stepLabel(step, buttons)}
                </AppText>
              </Pressable>
              {step.done ? (
                <View style={[styles.doneBadge, { backgroundColor: theme.colors.success }]}>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <AppText variant="label" color="#FFFFFF">
                    {t('routine.done')}
                  </AppText>
                </View>
              ) : null}
            </Animated.View>

            <View style={styles.controls}>
              <PushButton title={t('routine.previous')} icon="arrow-back" variant="surface" size="md" disabled={index === 0} onPress={() => goTo(index - 1)} />
              <PushButton title={speaking ? t('common.stop') : t('routine.repeat')} icon="volume-high" variant="soft" size="md" onPress={() => say(step)} />
              <PushButton title={t('routine.skip')} iconRight="arrow-forward" variant="surface" size="md" disabled={index >= steps.length - 1} onPress={() => goTo(index + 1)} />
            </View>
            <View style={{ marginTop: 14 }}>
              {step.done ? (
                <PushButton title={t('routine.undo')} icon="arrow-undo" variant="surface" full onPress={() => useApp.getState().setStepDone(routine.id, step.id, false)} />
              ) : (
                <PushButton title={t('routine.done')} icon="checkmark-circle" variant="success" full onPress={markDone} />
              )}
            </View>
          </View>
        ) : (
          <View style={{ gap: 10, marginTop: 18 }}>
            {steps.map((s, i) => {
              const ss = stepSymbol(s, buttons);
              return (
                <View key={s.id} style={[styles.listRow, { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : 'transparent', opacity: s.done ? 0.65 : 1 }, softShadow(theme, 1)]}>
                  <Pressable
                    onPress={() => useApp.getState().setStepDone(routine.id, s.id, !s.done)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: s.done }}
                    accessibilityLabel={L.stepLabel(s, buttons)}
                    style={[styles.check, { borderColor: s.done ? theme.colors.success : theme.colors.border, backgroundColor: s.done ? theme.colors.success : 'transparent' }]}
                  >
                    {s.done ? <Ionicons name="checkmark" size={22} color="#FFF" /> : <AppText variant="label" muted>{i + 1}</AppText>}
                  </Pressable>
                  <Pressable onPress={() => say(s)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }} accessibilityRole="button" accessibilityLabel={L.stepLabel(s, buttons)}>
                    <SymbolImage symbol={ss.symbol} photo={ss.photo} size={48} />
                    <AppText variant="subheading" style={{ flex: 1 }}>
                      {L.stepLabel(s, buttons)}
                    </AppText>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', flexWrap: 'wrap' },
  stepCard: { marginTop: 16, borderRadius: RADIUS.xl, padding: 24, alignItems: 'center', borderWidth: 2 },
  doneBadge: { position: 'absolute', top: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.pill },
  controls: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 18, flexWrap: 'wrap' },
  finished: { alignItems: 'center', gap: 8, marginTop: 12 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: RADIUS.lg, borderWidth: 2 },
  check: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
