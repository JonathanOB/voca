/**
 * Chunky "3D" button: a coloured face sitting on a darker base. Pressing pushes
 * the face down onto the base, like a physical key. Feedback starts on press-in.
 */
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { AppText } from './app-text';
import { RADIUS, useTheme, withAlpha } from '@/theme';

export type PushVariant = 'primary' | 'ink' | 'soft' | 'surface' | 'danger' | 'success';
type IconName = ComponentProps<typeof Ionicons>['name'];

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export interface PushButtonProps {
  title?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  variant?: PushVariant;
  size?: 'lg' | 'md' | 'sm';
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  children?: ReactNode;
  colors?: { face: string; edge: string; text: string };
}

export function PushButton({
  title,
  onPress,
  onLongPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  disabled,
  loading,
  full,
  style,
  accessibilityLabel,
  accessibilityHint,
  children,
  colors: custom,
}: PushButtonProps) {
  const theme = useTheme();
  const c = theme.colors;
  const depth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const pressed = useSharedValue(0);

  const palette = custom ?? {
    primary: { face: c.primary, edge: c.primaryEdge, text: c.onPrimary },
    ink: { face: c.ink, edge: c.inkEdge, text: c.inkText },
    soft: { face: c.primarySoft, edge: withAlpha(c.primary, 0.35), text: theme.mode === 'dark' ? c.text : c.primaryEdge },
    surface: { face: c.surface, edge: c.border, text: c.text },
    danger: { face: c.danger, edge: c.dangerEdge, text: '#FFFFFF' },
    success: { face: c.success, edge: '#127046', text: '#FFFFFF' },
  }[variant];

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.get() * depth }],
  }));

  const height = size === 'lg' ? 58 : size === 'md' ? 48 : 40;
  const pad = size === 'lg' ? 26 : size === 'md' ? 18 : 14;
  const iconSize = size === 'lg' ? 22 : size === 'md' ? 20 : 18;
  const textVariant = size === 'sm' ? 'caption' : 'label';

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      onLongPress={onLongPress}
      onPressIn={() => pressed.set(withTiming(1, { duration: 90, easing: EASE_OUT }))}
      onPressOut={() => pressed.set(withTiming(0, { duration: 140, easing: EASE_OUT }))}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      pressRetentionOffset={20}
      hitSlop={6}
      style={[{ alignSelf: full ? 'stretch' : 'flex-start', opacity: disabled ? 0.5 : 1 }, style]}
    >
      <View style={[styles.base, { backgroundColor: palette.edge, borderRadius: RADIUS.pill, paddingBottom: depth }]}>
        <Animated.View
          style={[
            styles.face,
            {
              backgroundColor: palette.face,
              borderRadius: RADIUS.pill,
              minHeight: height,
              paddingHorizontal: pad,
              borderWidth: theme.highContrast ? 2 : 0,
              borderColor: c.text,
            },
            faceStyle,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={palette.text} />
          ) : (
            <>
              {icon ? <Ionicons name={icon} size={iconSize} color={palette.text} /> : null}
              {title ? (
                <AppText variant={textVariant} color={palette.text} numberOfLines={2} center>
                  {title}
                </AppText>
              ) : null}
              {children}
              {iconRight ? <Ionicons name={iconRight} size={iconSize} color={palette.text} /> : null}
            </>
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {},
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
  },
});
