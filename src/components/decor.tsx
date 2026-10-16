/**
 * Decorative motion for onboarding and celebrations. Purely visual: hidden
 * from screen readers, slow, and switched off under reduced motion.
 */
import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SymbolImage } from './symbol-image';
import { useTheme, withAlpha } from '@/theme';

const EASE = Easing.bezier(0.45, 0, 0.55, 1);

export const FloatingSymbol = memo(function FloatingSymbol({
  emoji,
  size,
  style,
  delay = 0,
  drift = 10,
  rotate = 6,
}: {
  emoji: string;
  size: number;
  style?: ViewStyle;
  delay?: number;
  drift?: number;
  rotate?: number;
}) {
  const theme = useTheme();
  const v = useSharedValue(0);
  const appear = useSharedValue(theme.reducedMotion ? 1 : 0);

  useEffect(() => {
    if (theme.reducedMotion) return;
    appear.set(withDelay(delay, withTiming(1, { duration: 420, easing: Easing.bezier(0.23, 1, 0.32, 1) })));
    v.set(withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 2200, easing: EASE }), withTiming(0, { duration: 2200, easing: EASE })), -1)));
    return () => {
      cancelAnimation(v);
      cancelAnimation(appear);
    };
  }, [theme.reducedMotion, delay, v, appear]);

  const anim = useAnimatedStyle(() => ({
    opacity: appear.get(),
    transform: [
      { translateY: -v.get() * drift + (1 - appear.get()) * 16 },
      { rotate: `${(v.get() - 0.5) * rotate}deg` },
      { scale: 0.92 + appear.get() * 0.08 },
    ],
  }));

  return (
    <Animated.View style={[{ position: 'absolute' }, style, anim]} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
      <SymbolImage emoji={emoji} size={size} />
    </Animated.View>
  );
});

/** Soft pastel blobs behind onboarding content (like the reference design). */
export function Blobs() {
  const theme = useTheme();
  if (theme.highContrast) return null;
  const dark = theme.mode === 'dark';
  const colors = dark
    ? [withAlpha(theme.colors.primary, 0.2), withAlpha('#FFD966', 0.07), withAlpha('#F7AEDA', 0.1), withAlpha(theme.colors.primary, 0.14)]
    : [withAlpha('#FFD9B8', 0.55), withAlpha('#FFE29A', 0.5), withAlpha('#F9C9E0', 0.45), withAlpha(theme.colors.primary, 0.16)];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false}>
      <View style={[styles.blob, { width: 260, height: 260, top: -90, right: -80, backgroundColor: colors[0] }]} />
      <View style={[styles.blob, { width: 200, height: 200, top: 210, left: -110, backgroundColor: colors[1] }]} />
      <View style={[styles.blob, { width: 320, height: 320, bottom: -150, right: -120, backgroundColor: colors[2] }]} />
      <View style={[styles.blob, { width: 180, height: 180, bottom: 90, left: -90, backgroundColor: colors[3] }]} />
    </View>
  );
}

const CONFETTI_COLORS = ['#A99CFA', '#82DCA9', '#FBA7A4', '#FFD966', '#93CFFA', '#F7AEDA'];

function Piece({ i, width, height }: { i: number; width: number; height: number }) {
  const t = useSharedValue(0);
  const seed = useMemo(
    () => ({
      x: ((i * 73) % 100) / 100,
      drift: (((i * 37) % 21) - 10) * 4,
      spin: ((i * 53) % 360) + 180,
      delay: (i * 47) % 500,
      size: 8 + ((i * 13) % 8),
      round: i % 3 === 0,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      duration: 2200 + ((i * 97) % 900),
    }),
    [i],
  );
  useEffect(() => {
    t.set(withDelay(seed.delay, withTiming(1, { duration: seed.duration, easing: Easing.bezier(0.2, 0.6, 0.4, 1) })));
    return () => cancelAnimation(t);
  }, [seed, t]);
  const style = useAnimatedStyle(() => ({
    opacity: t.get() < 0.85 ? 1 : (1 - t.get()) / 0.15,
    transform: [
      { translateX: seed.x * width + seed.drift * t.get() },
      { translateY: -40 + t.get() * (height * 0.75) },
      { rotate: `${seed.spin * t.get()}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: seed.size,
          height: seed.round ? seed.size : seed.size * 1.6,
          borderRadius: seed.round ? seed.size : 3,
          backgroundColor: seed.color,
        },
        style,
      ]}
    />
  );
}

/** One gentle burst of soft confetti. Never loops, never flashes. */
export function Confetti({ count = 36 }: { count?: number }) {
  const theme = useTheme();
  if (theme.reducedMotion) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, i) => (
        <Piece key={i} i={i} width={theme.width} height={theme.height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute', borderRadius: 999 },
});
