import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { AppText } from './app-text';
import { selectionHaptic, warningHaptic } from '@/services/haptics';
import { useTheme } from '@/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

/**
 * Big number pad with entry dots. Calls onComplete once `length` digits are in.
 * Bump `errorKey` to shake and clear (wrong PIN or answer).
 */
export function PinPad({
  length = 4,
  masked = true,
  onComplete,
  errorKey = 0,
  label,
}: {
  length?: number;
  masked?: boolean;
  onComplete: (value: string) => void;
  errorKey?: number;
  label: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [seenError, setSeenError] = useState(errorKey);
  const shake = useSharedValue(0);

  // A new error clears what was typed.
  if (errorKey !== seenError) {
    setSeenError(errorKey);
    setValue('');
  }

  useEffect(() => {
    if (!errorKey) return;
    warningHaptic();
    if (theme.reducedMotion) return;
    shake.set(withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 70 }), withTiming(-6, { duration: 60 }), withTiming(0, { duration: 60 })));
  }, [errorKey, shake, theme.reducedMotion]);

  const dotsStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.get() }] }));
  const keySize = theme.isTablet ? 78 : 68;

  const press = (k: (typeof KEYS)[number]) => {
    if (!k) return;
    selectionHaptic();
    if (k === 'del') {
      setValue((v) => v.slice(0, -1));
      return;
    }
    if (value.length >= length) return;
    const next = value + k;
    setValue(next);
    if (next.length === length) onComplete(next);
  };

  return (
    <View style={{ alignItems: 'center', gap: 20 }}>
      <Animated.View
        style={[styles.dots, dotsStyle]}
        accessible
        accessibilityLabel={`${label}. ${t('lock.progress', { count: value.length })}`}
        accessibilityLiveRegion="polite"
      >
        {Array.from({ length }, (_, i) => {
          const filled = i < value.length;
          return masked ? (
            <View
              key={i}
              style={[styles.dot, { borderColor: theme.colors.primary, backgroundColor: filled ? theme.colors.primary : 'transparent' }]}
            />
          ) : (
            <View key={i} style={[styles.box, { borderColor: filled ? theme.colors.primary : theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <AppText size={28} weight="black">
                {value[i] ?? ''}
              </AppText>
            </View>
          );
        })}
      </Animated.View>
      <View style={[styles.pad, { width: keySize * 3 + 32 }]}>
        {KEYS.map((k, i) =>
          k ? (
            <Pressable
              key={i}
              onPress={() => press(k)}
              accessibilityRole="button"
              accessibilityLabel={k === 'del' ? t('lock.deleteDigit') : k}
              style={({ pressed }) => [
                styles.key,
                {
                  width: keySize,
                  height: keySize,
                  borderRadius: keySize,
                  backgroundColor: k === 'del' ? 'transparent' : pressed ? theme.colors.primarySoft : theme.colors.surface,
                  borderColor: k === 'del' ? 'transparent' : theme.highContrast ? theme.colors.text : theme.colors.border,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
            >
              {k === 'del' ? (
                <Ionicons name="backspace-outline" size={28} color={theme.colors.text} />
              ) : (
                <AppText size={30} weight="heavy" maxFontSizeMultiplier={1.2}>
                  {k}
                </AppText>
              )}
            </Pressable>
          ) : (
            <View key={i} style={{ width: keySize, height: keySize }} />
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 16, minHeight: 56, alignItems: 'center' },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 3 },
  box: { width: 52, height: 60, borderRadius: 14, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  pad: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  key: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
});
