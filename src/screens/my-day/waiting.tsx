import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

import { AppText } from '@/components/app-text';
import { Chip, ToggleRow } from '@/components/form';
import { InfoBanner } from '@/components/layout';
import { PushButton } from '@/components/push-button';
import { stdBoardId } from '@/data/standard-content';
import { speakText } from '@/hooks/use-speech';
import { useLabels, vocabLabel } from '@/i18n/labels';
import { BoardView } from '@/screens/board/board-view';
import { successHaptic } from '@/services/haptics';
import { useApp } from '@/store/app-store';
import { RADIUS, softShadow, useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const PRESETS = [1, 2, 3, 5, 10, 15, 20, 30];

export function WaitingScreen() {
  return <BoardView boardId={stdBoardId('waiting')} noSentence header={<WaitTimer />} />;
}

type Phase = 'idle' | 'running' | 'paused' | 'finished';

function WaitTimer() {
  const theme = useTheme();
  const { t } = useLabels();
  const minutes = useApp((s) => s.settings.timerMinutes);
  const total = minutes * 60_000;
  const [phase, setPhase] = useState<Phase>('idle');
  const [remaining, setRemaining] = useState(total);
  const [speakEnd, setSpeakEnd] = useState(true);
  const endAt = useRef(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => {
      const left = Math.max(0, endAt.current - Date.now());
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        setPhase('finished');
        successHaptic();
        AccessibilityInfo.announceForAccessibility(t('waiting.finished'));
        if (speakEnd) speakText(vocabLabel('finished'));
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase, speakEnd, t]);

  const pause = () => {
    cancelAnimation(progress);
    setPhase('paused');
  };

  const reset = () => {
    cancelAnimation(progress);
    progress.set(0);
    setRemaining(total);
    setPhase('idle');
  };

  const size = Math.min(theme.width - 80, theme.isTablet ? 320 : 250);
  const stroke = size * 0.5;
  const r = size / 4;
  const c = 2 * Math.PI * r;
  // A pie that shrinks as time passes (remaining time = coloured area).
  const pieProps = useAnimatedProps(() => ({ strokeDashoffset: c * progress.get() }));

  // While idle the display follows the chosen duration.
  const secs = Math.ceil((phase === 'idle' ? total : remaining) / 1000);
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, '0');
  const time = `${mm}:${ss}`;

  return (
    <View style={{ marginBottom: 24 }}>
      <AppText variant="title" accessibilityRole="header">
        {t('waiting.timerTitle')}
      </AppText>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : 'transparent' }, softShadow(theme, 2)]}>
        <View
          accessible
          accessibilityRole="timer"
          accessibilityLabel={t('waiting.timerA11y', { time, total: minutes })}
          style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
        >
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill={theme.colors.bgAlt} stroke={theme.colors.border} strokeWidth={3} />
            <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={phase === 'finished' ? theme.colors.success : theme.colors.primary}
                strokeWidth={stroke}
                strokeDasharray={`${c} ${c}`}
                animatedProps={pieProps}
              />
            </G>
          </Svg>
          <View style={[styles.center, { backgroundColor: theme.colors.surface, width: size * 0.48, height: size * 0.48, borderRadius: size }]}>
            <AppText size={size * 0.13} weight="black">
              {phase === 'finished' ? '0:00' : time}
            </AppText>
            <AppText variant="tiny" muted center>
              {phase === 'finished' ? t('waiting.finished') : t('waiting.left')}
            </AppText>
          </View>
        </View>

        <View style={styles.presets}>
          {PRESETS.map((m) => (
            <Chip
              key={m}
              label={t('waiting.minutesShort', { count: m })}
              selected={minutes === m}
              onPress={() => {
                useApp.getState().updateSettings({ timerMinutes: m });
                if (phase !== 'idle') reset();
              }}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {phase === 'idle' || phase === 'finished' ? (
            <PushButton title={t('waiting.start')} icon="play" onPress={() => {
              cancelAnimation(progress);
              progress.set(0);
              endAt.current = Date.now() + total;
              setRemaining(total);
              setPhase('running');
              progress.set(withTiming(1, { duration: total, easing: Easing.linear }));
            }} />
          ) : phase === 'running' ? (
            <PushButton title={t('waiting.pause')} icon="pause" variant="soft" onPress={pause} />
          ) : (
            <PushButton title={t('waiting.resume')} icon="play" onPress={() => {
              endAt.current = Date.now() + remaining;
              setPhase('running');
              progress.set(withTiming(1, { duration: remaining, easing: Easing.linear }));
            }} />
          )}
          <PushButton title={t('waiting.reset')} icon="refresh" variant="surface" onPress={reset} disabled={phase === 'idle'} />
        </View>
        <View style={{ alignSelf: 'stretch', marginTop: 12 }}>
          <ToggleRow icon="megaphone-outline" label={t('waiting.speakAtEnd')} value={speakEnd} onChange={setSpeakEnd} />
        </View>
      </View>
      <View style={{ marginTop: 14 }}>
        <InfoBanner text={t('waiting.note')} />
      </View>
      <AppText variant="heading" style={{ marginTop: 24 }} accessibilityRole="header">
        {t('waiting.wordsTitle')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12, borderRadius: RADIUS.xl, padding: 20, alignItems: 'center', gap: 16, borderWidth: 2 },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 12 },
});
