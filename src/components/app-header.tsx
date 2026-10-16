import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './app-text';
import { IconButton } from './icon-button';
import { LanguageButton } from './language-button';
import { SymbolImage } from './symbol-image';
import { RADIUS, useTheme } from '@/theme';

/** Always-visible shortcut to the Safety & help board (brief §6, §8 board 12). */
export function SafetyButton({ compact }: { compact?: boolean }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => router.push('/safety')}
      accessibilityRole="button"
      accessibilityLabel={t('nav.safetyA11y')}
      hitSlop={6}
      style={({ pressed }) => [
        styles.safety,
        {
          backgroundColor: theme.colors.dangerSoft,
          borderColor: theme.highContrast ? theme.colors.text : theme.colors.danger,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <SymbolImage emoji="🆘" size={compact ? 22 : 26} />
      {!compact ? (
        <AppText variant="label" color={theme.colors.danger}>
          {t('nav.safety')}
        </AppText>
      ) : null}
    </Pressable>
  );
}

export function AppHeader({ title, onMenu, onBack, right }: { title: string; onMenu?: () => void; onBack?: () => void; right?: React.ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.colors.bg }]}>
      {onBack ? (
        <IconButton icon="chevron-back" label={t('common.back')} onPress={onBack} size={46} />
      ) : onMenu ? (
        <IconButton icon="menu" label={t('nav.openMenu')} onPress={onMenu} size={46} />
      ) : null}
      <AppText variant="heading" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={{ flex: 1 }} accessibilityRole="header">
        {title}
      </AppText>
      {right}
      <LanguageButton />
      <SafetyButton />
    </View>
  );
}

export function BackChevron({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return <Ionicons name="chevron-back" size={24} color={theme.colors.text} onPress={onPress} />;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 10 },
  safety: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    minHeight: 46,
    borderRadius: RADIUS.pill,
    borderWidth: 2,
  },
});
