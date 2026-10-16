import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './app-text';
import { useUi } from '@/store/ui-store';
import { RADIUS, softShadow, useTheme } from '@/theme';

export function ToastHost() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);
  const latest = toasts[toasts.length - 1];

  useEffect(() => {
    if (latest) AccessibilityInfo.announceForAccessibility(latest.message);
  }, [latest]);

  if (!toasts.length) return null;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 18 }]}>
      {toasts.map((t) => {
        const icon = t.tone === 'success' ? 'checkmark-circle' : t.tone === 'warning' ? 'alert-circle' : 'information-circle';
        const tint = t.tone === 'success' ? theme.colors.success : t.tone === 'warning' ? '#E8A21A' : theme.colors.primary;
        return (
          <Animated.View
            key={t.id}
            entering={theme.reducedMotion ? undefined : FadeInDown.duration(220)}
            exiting={FadeOut.duration(160)}
            style={[styles.toast, { backgroundColor: theme.colors.ink }, softShadow(theme, 3)]}
            accessibilityLiveRegion="polite"
          >
            <Ionicons name={icon} size={22} color={tint} />
            <AppText variant="bodyStrong" color={theme.colors.inkText} style={{ flex: 1 }}>
              {t.message}
            </AppText>
            {t.action ? (
              <Pressable
                onPress={() => {
                  t.action?.onPress();
                  dismiss(t.id);
                }}
                accessibilityRole="button"
                style={[styles.action, { backgroundColor: theme.colors.primary }]}
                hitSlop={8}
              >
                <AppText variant="label" color={theme.colors.onPrimary}>
                  {t.action.label}
                </AppText>
              </Pressable>
            ) : null}
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', gap: 8 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.lg,
    maxWidth: 560,
    width: '100%',
  },
  action: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill },
});
