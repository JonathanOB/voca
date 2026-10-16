import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme, withAlpha } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  onLongPress?: () => void;
  label: string;
  hint?: string;
  variant?: 'surface' | 'primary' | 'soft' | 'danger' | 'ink' | 'ghost';
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
}

/** Round 3D icon button (≥44pt target). Always has an accessible label. */
export function IconButton({
  icon,
  onPress,
  onLongPress,
  label,
  hint,
  variant = 'surface',
  size = 48,
  disabled,
  style,
  selected,
}: IconButtonProps) {
  const theme = useTheme();
  const c = theme.colors;
  const pressed = useSharedValue(0);
  const depth = variant === 'ghost' ? 0 : 3;
  const p = {
    surface: { face: c.surface, edge: c.border, fg: c.text },
    primary: { face: c.primary, edge: c.primaryEdge, fg: c.onPrimary },
    soft: { face: c.primarySoft, edge: withAlpha(c.primary, 0.3), fg: theme.mode === 'dark' ? c.text : c.primaryEdge },
    danger: { face: c.danger, edge: c.dangerEdge, fg: '#FFFFFF' },
    ink: { face: c.ink, edge: c.inkEdge, fg: c.inkText },
    ghost: { face: 'transparent', edge: 'transparent', fg: c.text },
  }[selected ? 'primary' : variant];

  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: pressed.get() * depth }] }));

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onLongPress={onLongPress}
      onPressIn={() => pressed.set(withTiming(1, { duration: 90, easing: EASE_OUT }))}
      onPressOut={() => pressed.set(withTiming(0, { duration: 140, easing: EASE_OUT }))}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      hitSlop={Math.max(0, (48 - size) / 2)}
      style={[{ opacity: disabled ? 0.4 : 1 }, style]}
    >
      <View style={{ backgroundColor: p.edge, borderRadius: size, paddingBottom: depth }}>
        <Animated.View
          style={[
            {
              width: size,
              height: size,
              borderRadius: size,
              backgroundColor: p.face,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: theme.highContrast && variant !== 'ghost' ? 2 : 0,
              borderColor: c.text,
            },
            anim,
          ]}
        >
          <Ionicons name={icon} size={Math.round(size * 0.46)} color={p.fg} />
        </Animated.View>
      </View>
    </Pressable>
  );
}
