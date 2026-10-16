import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import { Card, InfoBanner } from '@/components/layout';
import { SymbolImage } from '@/components/symbol-image';
import { RESEARCH, TOPIC_NOTE } from '@/data/research';
import { useLabels } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { RADIUS, useTheme } from '@/theme';

export function BoardInfo() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const L = useLabels();
  const { t } = L;
  const { id } = useLocalSearchParams<{ id: string }>();
  const board = useApp((s) => s.boards.find((b) => b.id === id));
  // Standard boards have their own note (or the general topic-board note). Custom boards
  // get practical tips only: Voca supplies no research citations for user-created content.
  const custom = !board?.isStandard;
  const note = !custom && board?.stdKey ? (RESEARCH[board.stdKey] ?? TOPIC_NOTE) : undefined;
  const tips = note?.tips ?? TOPIC_NOTE.tips;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10 }]}>
        <AppText variant="heading" style={{ flex: 1 }} accessibilityRole="header">
          {t('info.title')}
        </AppText>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} size={44} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 14, maxWidth: 760, width: '100%', alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <SymbolImage symbol={board?.symbol} size={56} />
          <AppText variant="title" style={{ flex: 1 }}>
            {L.boardName(board)}
          </AppText>
        </View>

        <Card>
          <AppText variant="subheading">{t('info.purpose')}</AppText>
          <AppText style={{ marginTop: 6 }}>{L.boardPurpose(board)}</AppText>
        </Card>

        <Card>
          <AppText variant="subheading">{t('info.tips')}</AppText>
          {tips.map((tip) => (
            <View key={tip} style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <SymbolImage emoji="💡" size={22} />
              <AppText style={{ flex: 1 }}>{tip}</AppText>
            </View>
          ))}
          <Pressable onPress={() => router.push('/about/guide')} accessibilityRole="link" style={{ marginTop: 12 }}>
            <AppText variant="label" color={theme.colors.primary}>
              {t('info.moreInGuide')} →
            </AppText>
          </Pressable>
        </Card>

        {note ? (
          <>
            <Card>
              <AppText variant="subheading">{t('info.evidence')}</AppText>
              <AppText style={{ marginTop: 6 }}>{note.evidence}</AppText>
            </Card>
            <Card>
              <AppText variant="subheading">{t('info.limitations')}</AppText>
              <AppText style={{ marginTop: 6 }}>{note.limitations}</AppText>
            </Card>
            {note.references.length ? (
              <Card>
                <AppText variant="subheading">{t('info.reference')}</AppText>
                {note.references.map((r) => (
                  <View key={r.url} style={{ marginTop: 10, gap: 6 }}>
                    <AppText variant="caption">{r.citation}</AppText>
                    <Pressable
                      onPress={() => Linking.openURL(r.url)}
                      accessibilityRole="link"
                      accessibilityLabel={`${t('info.openLink')}: ${r.citation}`}
                      style={[styles.link, { backgroundColor: theme.colors.primarySoft }]}
                    >
                      <AppText variant="tiny" color={theme.colors.primary} numberOfLines={1}>
                        {r.url}
                      </AppText>
                    </Pressable>
                  </View>
                ))}
              </Card>
            ) : null}
            <InfoBanner text={t('info.offline')} icon="cloud-offline-outline" />
          </>
        ) : (
          <InfoBanner text={t('info.custom')} />
        )}
        <InfoBanner text={t('info.notClinical')} icon="medkit-outline" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 8 },
  link: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.md, alignSelf: 'flex-start', maxWidth: '100%' },
});
