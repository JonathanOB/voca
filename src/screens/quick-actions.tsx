import { router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import { SectionHeader } from '@/components/layout';
import { SymbolImage } from '@/components/symbol-image';
import { MAX_QUICK_ACTIONS, QUICK_ACTIONS } from '@/data/quick-actions';
import { useLabels } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { ALL_QUICK_ACTIONS, type QuickActionId } from '@/store/settings';
import { toast } from '@/store/ui-store';
import { RADIUS, cardSwatch, softShadow, useTheme } from '@/theme';

export function QuickActionsEditor() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useLabels();
  const selected = useApp((s) => s.settings.quickActions);
  const set = (q: QuickActionId[]) => useApp.getState().updateSettings({ quickActions: q });
  const available = ALL_QUICK_ACTIONS.filter((q) => !selected.includes(q));

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= selected.length) return;
    const next = [...selected];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  };

  const Row = ({ id, children }: { id: QuickActionId; children: React.ReactNode }) => {
    const qa = QUICK_ACTIONS[id];
    const sw = cardSwatch(qa.color, theme.mode);
    return (
      <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : 'transparent' }, softShadow(theme, 1)]}>
        <View style={[styles.art, { backgroundColor: sw.bg }]}>
          <SymbolImage emoji={qa.emoji} size={34} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong">{t(`quick.${id}.title`)}</AppText>
          <AppText variant="caption" muted>
            {t(`quick.${id}.sub`)}
          </AppText>
        </View>
        {children}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10 }]}>
        <AppText variant="heading" style={{ flex: 1 }} accessibilityRole="header">
          {t('quickEditor.title')}
        </AppText>
        <IconButton icon="checkmark" label={t('common.done')} variant="primary" onPress={() => router.back()} size={44} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, maxWidth: 720, width: '100%', alignSelf: 'center' }}>
        <AppText muted>{t('quickEditor.subtitle')}</AppText>
        <SectionHeader title={`${t('quickEditor.onHome')} (${selected.length}/${MAX_QUICK_ACTIONS})`} />
        <View style={{ gap: 10 }}>
          {selected.map((id, i) => (
            <Row key={id} id={id}>
              <IconButton icon="arrow-up" label={t('common.moveUp')} size={36} variant="soft" disabled={i === 0} onPress={() => move(i, -1)} />
              <IconButton icon="arrow-down" label={t('common.moveDown')} size={36} variant="soft" disabled={i === selected.length - 1} onPress={() => move(i, 1)} />
              <IconButton icon="remove" label={t('common.remove')} size={36} variant="soft" onPress={() => set(selected.filter((x) => x !== id))} />
            </Row>
          ))}
        </View>
        <SectionHeader title={t('quickEditor.available')} />
        <View style={{ gap: 10 }}>
          {available.map((id) => (
            <Row key={id} id={id}>
              <IconButton
                icon="add"
                label={t('common.add')}
                size={36}
                variant="primary"
                onPress={() => {
                  if (selected.length >= MAX_QUICK_ACTIONS) return toast(t('quickEditor.limit'), { tone: 'warning' });
                  set([...selected, id]);
                }}
              />
            </Row>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: RADIUS.lg, borderWidth: 2 },
  art: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
