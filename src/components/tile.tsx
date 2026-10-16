import { Ionicons } from '@expo/vector-icons';
import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { AppText } from './app-text';
import { SymbolImage } from './symbol-image';
import type { ButtonDisplay } from '@/store/settings';
import { useTouchSelect, type TouchPoint } from '@/hooks/use-touch-select';
import { tileSwatch, useTheme, withAlpha, type WordType } from '@/theme';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export interface TileProps {
  label: string;
  symbol?: string | null;
  photo?: string | null;
  type: WordType;
  width: number;
  display: ButtonDisplay;
  urgent?: boolean;
  active?: boolean;
  dimmed?: boolean;
  hasAudio?: boolean;
  onPress?: () => void;
  onLongPress?: (p: TouchPoint) => void;
  a11yHint?: string;
  footer?: ReactNode;
  badge?: ReactNode;
}

export const Tile = memo(function Tile({
  label,
  symbol,
  photo,
  type,
  width,
  display,
  urgent,
  active,
  dimmed,
  hasAudio,
  onPress,
  onLongPress,
  a11yHint,
  footer,
  badge,
}: TileProps) {
  const theme = useTheme();
  const sw = tileSwatch(type, theme.mode, { colorCoded: theme.colorCoded, highContrast: theme.highContrast, urgent });
  const pressed = useSharedValue(0);
  const depth = 5;
  const radius = Math.min(26, width * 0.2);
  const textOnly = display === 'text' || (!symbol && !photo);
  const imageOnly = display === 'image' && !textOnly;
  const height = textOnly ? Math.max(width * 0.62, 64) : width * (imageOnly ? 0.92 : 1.08);
  const imgSize = imageOnly ? width * 0.68 : width * 0.56;
  const labelSize = Math.max(13, Math.min(22, width * (textOnly ? 0.15 : 0.125)));

  const touch = useTouchSelect({ onActivate: onPress, onLongPress });
  const { onPressIn, onPressOut, ...touchProps } = touch.pressableProps;

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.get() * depth }, { scale: 1 - pressed.get() * 0.02 }],
  }));
  // Hold to select: the button fills from the bottom while the finger stays on it.
  const fillStyle = useAnimatedStyle(() => ({ height: `${touch.progress.get() * 100}%` }));

  return (
    <Pressable
      {...touchProps}
      onPressIn={() => {
        onPressIn();
        pressed.set(withTiming(1, { duration: 80, easing: EASE_OUT }));
      }}
      onPressOut={() => {
        onPressOut();
        pressed.set(theme.reducedMotion ? withTiming(0, { duration: 120 }) : withSpring(0, { duration: 260, dampingRatio: 0.55 }));
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={a11yHint}
      accessibilityState={{ selected: !!active }}
      style={{ width, opacity: dimmed ? 0.45 : 1 }}
    >
      <View style={{ backgroundColor: sw.edge, borderRadius: radius, paddingBottom: depth }}>
        <Animated.View
          style={[
            styles.face,
            {
              backgroundColor: sw.bg,
              borderRadius: radius,
              height,
              borderWidth: active ? 3 : theme.highContrast ? 2 : 0,
              borderColor: active ? theme.colors.focus : sw.edge,
              paddingHorizontal: width * 0.06,
            },
            faceStyle,
          ]}
        >
          {touch.holdMs > 0 ? (
            <Animated.View pointerEvents="none" style={[styles.holdFill, { backgroundColor: withAlpha(sw.edge, 0.45) }, fillStyle]} />
          ) : null}
          {!textOnly ? <SymbolImage symbol={symbol} photo={photo} size={imgSize} rounded={radius * 0.6} /> : null}
          {!imageOnly ? (
            <AppText
              size={labelSize}
              weight="heavy"
              color={sw.text}
              center
              numberOfLines={textOnly ? 3 : 2}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              maxFontSizeMultiplier={1.5}
              // Bounded by the face's height, so long words shrink rather than being cut off.
              style={{ marginTop: textOnly ? 0 : 4, flexShrink: 1 }}
            >
              {label}
            </AppText>
          ) : null}
          {hasAudio ? (
            <View style={[styles.audioBadge, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="mic" size={12} color={theme.colors.primary} />
            </View>
          ) : null}
          {badge}
        </Animated.View>
      </View>
      {footer}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  holdFill: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  audioBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/** Dashed "Add" tile shown at the end of every board. */
export function AddTile({ width, display, label, onPress, a11yLabel }: { width: number; display: ButtonDisplay; label: string; onPress: () => void; a11yLabel: string }) {
  const theme = useTheme();
  const textOnly = display === 'text';
  const height = (textOnly ? Math.max(width * 0.62, 64) : width * (display === 'image' ? 0.92 : 1.08)) + 5;
  const radius = Math.min(26, width * 0.2);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      style={({ pressed }) => ({
        width,
        height,
        borderRadius: radius,
        borderWidth: 2.5,
        borderStyle: 'dashed',
        borderColor: theme.colors.primary,
        backgroundColor: pressed ? theme.colors.primarySoft : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      })}
    >
      <View
        style={{
          width: Math.min(52, width * 0.38),
          height: Math.min(52, width * 0.38),
          borderRadius: 999,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="add" size={Math.min(32, width * 0.24)} color={theme.colors.onPrimary} />
      </View>
      <AppText variant="label" color={theme.colors.primary} maxFontSizeMultiplier={1.4}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Columns for a board grid when "same layout on every screen" is on (motor planning). */
export const FIXED_COLUMNS = { large: 3, medium: 4, small: 6 } as const;

export function gridColumns(width: number, size: 'large' | 'medium' | 'small', isTablet: boolean, gap: number, fixed = false) {
  // With a fixed grid, a word keeps the same row and column on a phone, a tablet and in
  // landscape, so the movement to reach it stays the same (as in LAMP or Speak for Yourself).
  if (fixed) return FIXED_COLUMNS[size];
  const target = { large: isTablet ? 190 : 150, medium: isTablet ? 150 : 108, small: isTablet ? 116 : 80 }[size];
  return Math.max(2, Math.min(10, Math.floor((width + gap) / (target + gap))));
}
