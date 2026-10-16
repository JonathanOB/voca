import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './app-text';
import { IconButton } from './icon-button';
import { i18n } from '@/i18n';
import { RADIUS, useTheme } from '@/theme';

const SHEET_EASE = Easing.bezier(0.32, 0.72, 0, 1);

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Let children manage their own scrolling (e.g. a FlatList). */
  scroll?: boolean;
  maxHeight?: number | `${number}%`;
  footer?: ReactNode;
}

/** Bottom sheet built on Modal. Slides up, closes by tapping outside or the close button. */
export function Sheet({ visible, onClose, title, children, scroll = true, maxHeight = '88%', footer }: SheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  if (!visible) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Animated.View entering={FadeIn.duration(160)} style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={i18n.t('common.close')} />
        <Animated.View
          entering={theme.reducedMotion ? FadeIn.duration(140) : SlideInDown.duration(300).easing(SHEET_EASE)}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.bg,
              paddingBottom: Math.max(insets.bottom, 16),
              ...(scroll ? { maxHeight } : { height: maxHeight }),
              width: '100%',
              maxWidth: theme.isTablet ? 720 : undefined,
              borderColor: theme.highContrast ? theme.colors.text : 'transparent',
            },
          ]}
          accessibilityViewIsModal
        >
          <View style={[styles.grabber, { backgroundColor: theme.colors.border }]} />
          {title ? (
            <View style={styles.header}>
              <AppText variant="heading" style={{ flex: 1 }} accessibilityRole="header">
                {title}
              </AppText>
              <IconButton icon="close" label={i18n.t('common.close')} onPress={onClose} size={42} />
            </View>
          ) : null}
          {scroll ? (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, paddingHorizontal: 20 }}>{children}</View>
          )}
          {footer ? <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>{footer}</View> : null}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, paddingTop: 8, borderWidth: 2, borderBottomWidth: 0 },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginBottom: 6 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, gap: 12 },
});
