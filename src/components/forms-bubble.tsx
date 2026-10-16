/**
 * Long-press bubble with other forms of a word (wants, wanted, wanting…).
 * The last option opens the full button menu.
 */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './app-text';
import { selectionHaptic } from '@/services/haptics';
import { RADIUS, softShadow, useTheme } from '@/theme';

export interface FormsBubbleProps {
  word: string;
  forms: string[];
  /** Touch point (window coordinates) the bubble points at. */
  x: number;
  y: number;
  onPick: (form: string) => void;
  onMore: () => void;
  onClose: () => void;
}

export function FormsBubble({ word, forms, x, y, onPick, onMore, onClose }: FormsBubbleProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [bubbleH, setBubbleH] = useState(0);
  const boxW = Math.min(width - 24, theme.isTablet ? 460 : 360);
  const left = Math.max(12, Math.min(width - boxW - 12, x - boxW / 2));
  // Above the finger when there is room (measured first, so it never covers the button), otherwise below.
  const aboveTop = y - 64 - bubbleH;
  const top = aboveTop > insets.top + 8 ? aboveTop : y + 64;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.close')} />
      <View
        style={[styles.anchor, { left, width: boxW, top, opacity: bubbleH ? 1 : 0 }]}
        pointerEvents="box-none"
        onLayout={(e) => !bubbleH && setBubbleH(e.nativeEvent.layout.height)}
      >
        <Animated.View
          entering={theme.reducedMotion ? FadeIn.duration(120) : ZoomIn.duration(180).withInitialValues({ transform: [{ scale: 0.9 }] })}
          style={[
            styles.bubble,
            { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : theme.colors.primary },
            softShadow(theme, 3),
          ]}
          accessibilityViewIsModal
          accessibilityLabel={t('forms.a11y', { word })}
        >
          {forms.map((f) => (
            <Pressable
              key={f}
              onPress={() => {
                selectionHaptic();
                onPick(f);
              }}
              accessibilityRole="button"
              accessibilityLabel={f}
              style={({ pressed }) => [styles.chip, { backgroundColor: pressed ? theme.colors.primary : theme.colors.primarySoft }]}
            >
              {({ pressed }) => (
                <AppText size={19} weight="heavy" color={pressed ? theme.colors.onPrimary : theme.colors.text} maxFontSizeMultiplier={1.4}>
                  {f}
                </AppText>
              )}
            </Pressable>
          ))}
          <Pressable
            onPress={onMore}
            accessibilityRole="button"
            accessibilityLabel={t('forms.more')}
            style={({ pressed }) => [styles.chip, styles.more, { backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.bgAlt }]}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text} />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', alignItems: 'center' },
  bubble: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, padding: 10, borderRadius: RADIUS.xl, borderWidth: 2.5 },
  chip: { minHeight: 52, minWidth: 52, paddingHorizontal: 16, borderRadius: RADIUS.pill, alignItems: 'center', justifyContent: 'center' },
  more: { paddingHorizontal: 12 },
});
