import { router } from 'expo-router';
import type { DrawerContentComponentProps } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './app-text';
import { Mascot } from './mascot';
import { SymbolImage } from './symbol-image';
import { selectionHaptic } from '@/services/haptics';
import { RADIUS, useTheme } from '@/theme';

export const DRAWER_SECTIONS: { route: string; emoji: string; key: 'home' | 'communicate' | 'myDay' | 'choices' | 'feelings' | 'library' | 'myBoards' | 'settings' | 'about' }[] = [
  { route: 'index', emoji: '🏠', key: 'home' },
  { route: 'communicate', emoji: '💬', key: 'communicate' },
  { route: 'my-day', emoji: '🗓️', key: 'myDay' },
  { route: 'choices', emoji: '👆', key: 'choices' },
  { route: 'feelings', emoji: '😊', key: 'feelings' },
  { route: 'library', emoji: '📚', key: 'library' },
  { route: 'my-boards', emoji: '🗂️', key: 'myBoards' },
  { route: 'settings', emoji: '⚙️', key: 'settings' },
  { route: 'about', emoji: 'ℹ️', key: 'about' },
];

export function DrawerContent({ state, navigation }: DrawerContentComponentProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const current = state.routes[state.index]?.name;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 14 }}>
        <View style={styles.brand}>
          <Mascot size={64} sparkle={false} float={false} />
          <View style={{ flex: 1 }}>
            <AppText size={30} style={{ fontFamily: theme.fonts.logo, lineHeight: 34 * theme.textScale }} color={theme.colors.text}>
              Voca
            </AppText>
            <AppText variant="caption" muted>
              {t('app.tagline')}
            </AppText>
          </View>
        </View>

        <View style={{ gap: 4, marginTop: 10 }}>
          {DRAWER_SECTIONS.map((s) => {
            const active = current === s.route;
            return (
              <Pressable
                key={s.route}
                onPress={() => {
                  selectionHaptic();
                  navigation.navigate(s.route);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t(`nav.${s.key}`)}
                style={({ pressed }) => [
                  styles.item,
                  {
                    backgroundColor: active ? theme.colors.primarySoft : pressed ? theme.colors.surfaceAlt : 'transparent',
                    borderColor: active && theme.highContrast ? theme.colors.text : 'transparent',
                  },
                ]}
              >
                <SymbolImage emoji={s.emoji} size={30} />
                <AppText variant="subheading" color={active ? theme.colors.primary : theme.colors.text} style={{ flex: 1 }}>
                  {t(`nav.${s.key}`)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ padding: 14, paddingBottom: insets.bottom + 14, gap: 10 }}>
        <Pressable
          onPress={() => {
            navigation.closeDrawer();
            router.push('/safety');
          }}
          accessibilityRole="button"
          accessibilityLabel={t('nav.safetyA11y')}
          style={({ pressed }) => [
            styles.safety,
            { backgroundColor: theme.colors.dangerSoft, borderColor: theme.colors.danger, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <SymbolImage emoji="🆘" size={34} />
          <AppText variant="subheading" color={theme.colors.danger}>
            {t('safety.title')}
          </AppText>
        </Pressable>
        <AppText variant="tiny" muted center>
          {t('nav.menuFooter')}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, minHeight: 54, borderRadius: RADIUS.lg, borderWidth: 2 },
  safety: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: RADIUS.lg, borderWidth: 2 },
});
