/**
 * "Find my touch settings": a short, calm game. A bubble appears; the person taps
 * it the way they usually do. Voca looks for repeated taps, accidental brushes,
 * misses and drifting fingers, then suggests touch settings a carer can accept.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { AppHeader } from '@/components/app-header';
import { AppText } from '@/components/app-text';
import { ToggleRow } from '@/components/form';
import { InfoBanner } from '@/components/layout';
import { Mascot } from '@/components/mascot';
import { PushButton } from '@/components/push-button';
import { selectionHaptic, successHaptic } from '@/services/haptics';
import { analyseCalibration, type CalNote, type CalRound, type CalSuggestion } from '@/services/touch-calibration';
import { useApp } from '@/store/app-store';
import { toast } from '@/store/ui-store';
import { useTheme } from '@/theme';

const ROUNDS = 8;
const RADIUS_PX = 46;
const AFTER_HIT_MS = 1500;
const ROUND_TIMEOUT_MS = 7000;

type Phase = 'intro' | 'play' | 'result';

/** A random spot inside the play area, away from its edges. Called from timers, not during render. */
function randomPointIn(a: { x: number; y: number; w: number; h: number }, pad: number) {
  return {
    x: a.x + pad + Math.random() * Math.max(1, a.w - pad * 2),
    y: a.y + pad + Math.random() * Math.max(1, a.h - pad * 2),
  };
}

interface Area {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function TouchCheckScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(0);
  const [bubble, setBubble] = useState<{ x: number; y: number; hit: boolean } | null>(null);
  const [result, setResult] = useState<CalSuggestion | null>(null);
  const [accepted, setAccepted] = useState<Record<CalNote, boolean>>({ repeat: true, hold: true, size: true, slips: true });

  const areaView = useRef<View>(null);
  const area = useRef<Area | null>(null);
  const rounds = useRef<CalRound[]>([]);
  const current = useRef(-1);
  const hitDone = useRef(false);
  const pending = useRef(new Map<string, { t0: number; x0: number; y0: number }>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const finish = () => {
    if (timer.current) clearTimeout(timer.current);
    setBubble(null);
    setResult(analyseCalibration(rounds.current));
    setPhase('result');
  };

  const nextRound = (i: number) => {
    if (timer.current) clearTimeout(timer.current);
    const a = area.current;
    if (i >= ROUNDS || !a) {
      finish();
      return;
    }
    const { x, y } = randomPointIn(a, RADIUS_PX + 12);
    rounds.current.push({ target: { x, y, r: RADIUS_PX }, touches: [] });
    current.current = i;
    hitDone.current = false;
    setRound(i);
    setBubble({ x: x - a.x, y: y - a.y, hit: false });
    timer.current = setTimeout(() => nextRound(i + 1), ROUND_TIMEOUT_MS);
  };

  const start = () => {
    rounds.current = [];
    setResult(null);
    setPhase('play');
    // Wait a frame so the play area is laid out and measured.
    setTimeout(() => nextRound(0), 350);
  };

  const touchesOf = (e: GestureResponderEvent) => {
    const list = e.nativeEvent.changedTouches;
    return list && list.length ? list : [e.nativeEvent];
  };

  const onTouchStart = (e: GestureResponderEvent) => {
    for (const tc of touchesOf(e)) pending.current.set(String(tc.identifier), { t0: Date.now(), x0: tc.pageX, y0: tc.pageY });
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    const r = rounds.current[current.current];
    for (const tc of touchesOf(e)) {
      const start0 = pending.current.get(String(tc.identifier));
      pending.current.delete(String(tc.identifier));
      if (!start0 || !r) continue;
      r.touches.push({ ...start0, t1: Date.now(), x1: tc.pageX, y1: tc.pageY });
      const isHit = Math.hypot(start0.x0 - r.target.x, start0.y0 - r.target.y) <= r.target.r * 1.15;
      if (isHit && !hitDone.current) {
        hitDone.current = true;
        successHaptic();
        setBubble((b) => (b ? { ...b, hit: true } : b));
        if (timer.current) clearTimeout(timer.current);
        // Keep listening briefly to notice repeated taps.
        timer.current = setTimeout(() => nextRound(current.current + 1), AFTER_HIT_MS);
      } else selectionHaptic();
    }
  };

  const onAreaLayout = (_e: LayoutChangeEvent) => {
    areaView.current?.measureInWindow((x, y, w, h) => {
      area.current = { x, y, w, h };
    });
  };

  const apply = () => {
    if (!result) return;
    const patch: Parameters<ReturnType<typeof useApp.getState>['updateSettings']>[0] = {};
    if (result.notes.includes('repeat') && accepted.repeat) patch.ignoreRepeatMs = result.ignoreRepeatMs;
    if (result.notes.includes('hold') && accepted.hold) patch.holdMs = result.holdMs;
    if (result.notes.includes('slips') && accepted.slips) patch.allowSlips = true;
    if (result.notes.includes('size') && accepted.size) patch.gridSize = 'large';
    useApp.getState().updateSettings(patch);
    toast(t('touch.applied'), { tone: 'success' });
    router.back();
  };

  const noteText = (n: CalNote) =>
    n === 'repeat'
      ? t('touch.sugRepeat', { s: (result!.ignoreRepeatMs / 1000).toLocaleString() })
      : n === 'hold'
        ? t('touch.sugHold', { s: (result!.holdMs / 1000).toLocaleString() })
        : n === 'size'
          ? t('touch.sugSize')
          : t('touch.sugSlips');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <AppHeader title={t('touch.calTitle')} onBack={() => router.back()} />
      {phase === 'intro' ? (
        <View style={styles.center}>
          <Mascot size={150} />
          <AppText variant="title" center>
            {t('touch.calTitle')}
          </AppText>
          <AppText variant="body" muted center style={{ maxWidth: 420 }}>
            {t('touch.calIntro')}
          </AppText>
          <PushButton title={t('touch.calStart')} iconRight="arrow-forward" onPress={start} />
          <View style={{ maxWidth: 420, alignSelf: 'stretch' }}>
            <InfoBanner text={t('touch.a11yNote')} icon="accessibility-outline" />
          </View>
        </View>
      ) : phase === 'play' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.playHead}>
            <AppText variant="label" muted style={{ flex: 1 }} accessibilityLiveRegion="polite">
              {t('touch.calRound', { n: round + 1, total: ROUNDS })}
            </AppText>
            <PushButton title={t('touch.calStop')} variant="surface" size="md" onPress={finish} />
          </View>
          <View
            ref={areaView}
            onLayout={onAreaLayout}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={[styles.area, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}
            accessibilityLabel={t('touch.calTap')}
          >
            {bubble ? (
              <Animated.View
                key={round}
                pointerEvents="none"
                entering={theme.reducedMotion ? FadeIn.duration(150) : ZoomIn.duration(260)}
                style={[
                  styles.bubble,
                  {
                    left: bubble.x - RADIUS_PX,
                    top: bubble.y - RADIUS_PX,
                    backgroundColor: bubble.hit ? theme.colors.success : theme.colors.primary,
                  },
                ]}
              >
                <Ionicons name={bubble.hit ? 'checkmark' : 'ellipse'} size={bubble.hit ? 44 : 22} color="#FFFFFF" />
              </Animated.View>
            ) : null}
          </View>
        </View>
      ) : result ? (
        <View style={[styles.center, { justifyContent: 'flex-start', paddingTop: 12 }]}>
          <Mascot size={110} />
          <AppText variant="title" center>
            {t('touch.calDoneTitle')}
          </AppText>
          {result.notes.length === 0 ? (
            <AppText variant="body" muted center style={{ maxWidth: 420 }}>
              {t('touch.calNone')}
            </AppText>
          ) : (
            <View style={{ gap: 10, alignSelf: 'stretch', maxWidth: 520, width: '100%', marginHorizontal: 'auto' }}>
              {result.notes.map((n) => (
                <ToggleRow key={n} label={noteText(n)} value={accepted[n]} onChange={(v) => setAccepted((a) => ({ ...a, [n]: v }))} />
              ))}
            </View>
          )}
          <View style={styles.actions}>
            {result.notes.length ? <PushButton title={t('touch.apply')} icon="checkmark" onPress={apply} /> : null}
            <PushButton title={t('touch.again')} icon="refresh" variant="soft" onPress={start} />
            <PushButton title={t('touch.keep')} variant="surface" onPress={() => router.back()} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  playHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 12 },
  area: { flex: 1, margin: 16, marginTop: 0, borderRadius: 28, borderWidth: 2, overflow: 'hidden' },
  bubble: { position: 'absolute', width: RADIUS_PX * 2, height: RADIUS_PX * 2, borderRadius: RADIUS_PX, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 8 },
});
