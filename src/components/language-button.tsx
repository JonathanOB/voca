/**
 * Current language, next to the Help button. Tapping it (after the carer PIN,
 * when one is set) opens a short list to switch language straight away, which
 * helps bilingual families who move between languages during the day.
 */
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { AppText } from './app-text';
import { SymbolImage } from './symbol-image';
import { setLanguage } from '@/i18n';
import { LANGUAGES, languageInfo } from '@/i18n/languages';
import { selectionHaptic } from '@/services/haptics';
import { useApp } from '@/store/app-store';
import { requireCarer } from '@/store/lock-store';
import { toast } from '@/store/ui-store';
import { RADIUS, softShadow, useTheme } from '@/theme';

const MENU_W = 270;

export function LanguageButton() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const language = useApp((s) => s.settings.language);
  const show = useApp((s) => s.settings.showLanguageButton);
  const ref = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
  if (!show) return null;
  const info = languageInfo(language);

  const open = async () => {
    if (!(await requireCarer())) return;
    // Page coordinates match the full-screen modal on both platforms (measureInWindow can differ by the status bar).
    ref.current?.measure((_x, _y, w, h, pageX, pageY) => setAnchor({ top: pageY + h + 8, right: Math.max(12, width - (pageX + w)) }));
  };

  const choose = (code: string) => {
    selectionHaptic();
    setAnchor(null);
    if (code === language) return;
    useApp.getState().updateSettings({ language: code, voiceId: null });
    setLanguage(code);
    toast(t('langSwitch.changed', { name: languageInfo(code).native }), { tone: 'success' });
  };

  return (
    <>
      <Pressable
        ref={ref}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={t('langSwitch.a11y', { name: info.native })}
        hitSlop={6}
        style={({ pressed }) => [
          styles.pill,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.highContrast ? theme.colors.text : theme.colors.border,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}
      >
        <SymbolImage emoji={info.sym} size={22} />
        <AppText variant="label">{info.code.toUpperCase()}</AppText>
        {width >= 400 ? <Ionicons name="chevron-down" size={14} color={theme.colors.textMuted} /> : null}
      </Pressable>

      {anchor ? (
        <Modal transparent visible animationType="none" onRequestClose={() => setAnchor(null)} statusBarTranslucent navigationBarTranslucent>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAnchor(null)} accessibilityLabel={t('common.close')} />
          <Animated.View
            entering={theme.reducedMotion ? FadeIn.duration(120) : ZoomIn.duration(180).withInitialValues({ transform: [{ scale: 0.92 }] })}
            style={[
              styles.menu,
              { top: anchor.top, right: anchor.right, width: Math.min(MENU_W, width - 24), backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : theme.colors.border },
              softShadow(theme, 3),
            ]}
            accessibilityViewIsModal
          >
            <AppText variant="label" muted style={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4 }} accessibilityRole="header">
              {t('langSwitch.title')}
            </AppText>
            <ScrollView style={{ maxHeight: 420 }}>
              {LANGUAGES.map((l) => {
                const selected = l.code === language;
                return (
                  <Pressable
                    key={l.code}
                    onPress={() => choose(l.code)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`${l.native} (${l.english})`}
                    style={({ pressed }) => [styles.row, { backgroundColor: selected ? theme.colors.primarySoft : pressed ? theme.colors.surfaceAlt : 'transparent' }]}
                  >
                    <SymbolImage emoji={l.sym} size={28} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodyStrong">{l.native}</AppText>
                      <AppText variant="caption" muted>
                        {l.hello}
                      </AppText>
                    </View>
                    {selected ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, minHeight: 46, borderRadius: RADIUS.pill, borderWidth: 2 },
  menu: { position: 'absolute', borderRadius: RADIUS.lg, borderWidth: 2, paddingBottom: 6, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10, minHeight: 56 },
});
