import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { confirm } from '@/components/dialog';
import { IconButton } from '@/components/icon-button';
import { EmptyState, Screen } from '@/components/layout';
import { PushButton } from '@/components/push-button';
import { SymbolImage } from '@/components/symbol-image';
import { stdBoardId } from '@/data/standard-content';
import type { Routine, RoutineStep } from '@/db/types';
import { useLabels } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { guarded, requireCarer } from '@/store/lock-store';
import { RADIUS, cardSwatch, softShadow, useTheme } from '@/theme';

export function RoutinesScreen() {
  const L = useLabels();
  const { t } = L;
  const routines = useApp((s) => s.routines);
  const list = useMemo(() => routines.filter((r) => r.kind === 'routine' && !r.hidden), [routines]);

  return (
    <Screen>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <AppText variant="title" accessibilityRole="header">
            {t('tabs.routines')}
          </AppText>
          <AppText variant="caption" muted>
            {t('routines.subtitle')}
          </AppText>
        </View>
        <IconButton icon="information" label={t('board.info')} size={44} variant="soft" onPress={() => router.push({ pathname: '/board-info', params: { id: stdBoardId('routines') } })} />
      </View>
      <PushButton title={t('routines.new')} icon="add" onPress={() => guarded(() => router.push('/routine-editor'))} style={{ marginBottom: 16 }} />
      {list.length === 0 ? <EmptyState title={t('routines.empty')} /> : null}
      <View style={{ gap: 14 }}>
        {list.map((r) => (
          <RoutineCard key={r.id} routine={r} />
        ))}
      </View>
    </Screen>
  );
}

function RoutineCard({ routine }: { routine: Routine }) {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const steps = useApp((s) => s.steps[routine.id] ?? NO_STEPS);
  const done = steps.filter((s) => s.done).length;
  const sw = cardSwatch(routine.color, theme.mode);
  const pct = steps.length ? done / steps.length : 0;
  const started = done > 0 && done < steps.length;

  const remove = async () => {
    if (!(await requireCarer())) return;
    const ok = await confirm(
      routine.isStandard
        ? { title: t('routines.hideConfirmTitle'), body: t('routines.hideConfirmBody'), confirmLabel: t('common.hide'), destructive: true }
        : { title: t('routines.deleteConfirmTitle'), body: t('routines.deleteConfirmBody'), confirmLabel: t('common.delete'), destructive: true },
    );
    if (ok) useApp.getState().deleteRoutine(routine.id);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : 'transparent' }, softShadow(theme, 1)]}>
      <Pressable
        onPress={() => router.push({ pathname: '/routine/[id]', params: { id: routine.id } })}
        accessibilityRole="button"
        accessibilityLabel={`${L.routineName(routine)}. ${t('routines.progress', { done, total: steps.length })}`}
        style={styles.main}
      >
        <View style={[styles.art, { backgroundColor: sw.bg }]}>
          <SymbolImage symbol={routine.symbol} photo={routine.photo} size={52} />
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <AppText variant="subheading" numberOfLines={2}>
            {L.routineName(routine)}
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[styles.bar, { backgroundColor: theme.colors.bgAlt }]}>
              <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: theme.colors.success }]} />
            </View>
            <AppText variant="tiny" muted>
              {t('routines.progress', { done, total: steps.length })}
            </AppText>
          </View>
        </View>
        <View style={[styles.go, { backgroundColor: theme.colors.primary }]}>
          <AppText variant="tiny" color={theme.colors.onPrimary}>
            {started ? t('routines.continue') : t('routines.start')}
          </AppText>
          <Ionicons name="play" size={14} color={theme.colors.onPrimary} />
        </View>
      </Pressable>
      <View style={styles.tools}>
        <IconButton icon="create-outline" label={t('common.edit')} size={38} variant="soft" onPress={() => guarded(() => router.push({ pathname: '/routine-editor', params: { id: routine.id } }))} />
        <IconButton
          icon="copy-outline"
          label={t('common.duplicate')}
          size={38}
          variant="soft"
          onPress={() => guarded(() => useApp.getState().duplicateRoutine(routine.id, t('routines.copyOf', { name: L.routineName(routine) })).then(() => {}))}
        />
        <IconButton icon="refresh" label={t('routine.startAgain')} size={38} variant="soft" disabled={done === 0} onPress={() => useApp.getState().resetRoutine(routine.id)} />
        <View style={{ flex: 1 }} />
        <IconButton icon={routine.isStandard ? 'eye-off-outline' : 'trash-outline'} label={routine.isStandard ? t('common.hide') : t('common.delete')} size={38} variant="soft" onPress={remove} />
      </View>
    </View>
  );
}

const NO_STEPS: RoutineStep[] = [];

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  card: { borderRadius: RADIUS.xl, padding: 14, gap: 12, borderWidth: 2 },
  main: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  art: { width: 76, height: 76, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  bar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  go: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.pill },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
