import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Screen } from '@/components/layout';
import { SymbolImage } from '@/components/symbol-image';
import { useLabels } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { RADIUS, cardSwatch, useTheme } from '@/theme';

export function LibraryCategories() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const boards = useApp((s) => s.boards);
  const items = useApp((s) => s.items);
  const list = useMemo(() => boards.filter((b) => b.section === 'library' && !b.hidden), [boards]);
  const cols = theme.width >= 1000 ? 4 : theme.width >= 640 ? 3 : 2;

  return (
    <Screen>
      <AppText variant="body" muted style={{ marginBottom: 14 }}>
        {t('library.categoriesSub')}
      </AppText>
      <View style={styles.grid}>
        {list.map((b, i) => {
          const sw = cardSwatch(b.color, theme.mode);
          const hc = theme.highContrast;
          return (
            <Animated.View key={b.id} entering={theme.reducedMotion ? undefined : FadeInDown.duration(280).delay(i * 40)} style={{ width: `${100 / cols}%`, padding: 6 }}>
              <Pressable
                onPress={() => router.push({ pathname: '/board/[id]', params: { id: b.id } })}
                accessibilityRole="button"
                accessibilityLabel={`${L.boardName(b)}. ${t('common.buttonsCount', { count: items[b.id]?.length ?? 0 })}`}
                style={({ pressed }) => ({ backgroundColor: sw.edge, borderRadius: RADIUS.lg, paddingBottom: pressed ? 1 : 5, marginTop: pressed ? 4 : 0 })}
              >
                <View style={[styles.card, { backgroundColor: hc ? theme.colors.surface : sw.bg, borderWidth: hc ? 2 : 0, borderColor: theme.colors.text }]}>
                  <SymbolImage symbol={b.symbol} size={theme.isTablet ? 72 : 60} />
                  <AppText variant="subheading" center color={hc ? theme.colors.text : sw.text} numberOfLines={2}>
                    {L.boardName(b)}
                  </AppText>
                  <AppText variant="tiny" color={hc ? theme.colors.textMuted : sw.text} style={{ opacity: 0.8 }}>
                    {t('common.buttonsCount', { count: items[b.id]?.length ?? 0 })}
                  </AppText>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  card: { borderRadius: RADIUS.lg, padding: 16, alignItems: 'center', gap: 6, minHeight: 150, justifyContent: 'center' },
});
