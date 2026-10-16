import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { NavRow } from '@/components/form';
import { IconButton } from '@/components/icon-button';
import { EmptyState, InfoBanner, Screen, SectionHeader } from '@/components/layout';
import { PushButton } from '@/components/push-button';
import { Sheet } from '@/components/sheet';
import { SymbolImage } from '@/components/symbol-image';
import type { Board } from '@/db/types';
import { useLabels } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { guarded, requireCarer } from '@/store/lock-store';
import { toast } from '@/store/ui-store';
import { RADIUS, cardSwatch, useTheme } from '@/theme';

export function MyBoardsScreen() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const boards = useApp((s) => s.boards);
  const items = useApp((s) => s.items);
  const [copyOpen, setCopyOpen] = useState(false);
  const custom = useMemo(() => boards.filter((b) => b.section === 'custom'), [boards]);
  const hiddenStd = useMemo(() => boards.filter((b) => b.isStandard && b.hidden), [boards]);
  const copyable = useMemo(() => boards.filter((b) => b.isStandard && !b.hidden && (items[b.id]?.length ?? 0) > 0), [boards, items]);

  const duplicate = async (b: Board) => {
    if (!(await requireCarer())) return;
    const id = await useApp.getState().duplicateBoard(b.id, t('myBoards.copyOf', { name: L.boardName(b) }));
    setCopyOpen(false);
    if (id) router.push({ pathname: '/board/[id]', params: { id } });
  };

  return (
    <Screen>
      <AppText variant="body" muted>
        {t('myBoards.subtitle')}
      </AppText>
      <View style={styles.actions}>
        <PushButton title={t('myBoards.create')} icon="add" onPress={() => guarded(() => router.push('/board-editor'))} />
        <PushButton title={t('myBoards.copyStandard')} icon="copy-outline" variant="surface" onPress={() => setCopyOpen(true)} />
      </View>

      {custom.length === 0 ? (
        <EmptyState title={t('myBoards.emptyTitle')} body={t('myBoards.emptyBody')} />
      ) : (
        <View style={{ gap: 14, marginTop: 8 }}>
          {custom.map((b, i) => (
            <BoardCard key={b.id} board={b} count={items[b.id]?.length ?? 0} first={i === 0} last={i === custom.length - 1} onDuplicate={() => duplicate(b)} />
          ))}
          <InfoBanner text={t('myBoards.userCreated')} />
        </View>
      )}

      {hiddenStd.length ? (
        <>
          <SectionHeader title={t('myBoards.hiddenTitle')} />
          <View style={{ gap: 10 }}>
            {hiddenStd.map((b) => (
              <NavRow
                key={b.id}
                label={L.boardName(b)}
                icon="eye-off-outline"
                onPress={async () => {
                  await useApp.getState().saveBoard({ ...b, hidden: false });
                  toast(L.boardName(b), { tone: 'success' });
                }}
                right={<AppText variant="label" color={theme.colors.primary}>{t('common.show')}</AppText>}
              />
            ))}
          </View>
        </>
      ) : null}

      <Sheet visible={copyOpen} onClose={() => setCopyOpen(false)} title={t('myBoards.copyStandard')}>
        <View style={{ gap: 10, paddingBottom: 12 }}>
          {copyable.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => duplicate(b)}
              accessibilityRole="button"
              accessibilityLabel={L.boardName(b)}
              style={({ pressed }) => [styles.copyRow, { backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <SymbolImage symbol={b.symbol} size={40} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">{L.boardName(b)}</AppText>
                <AppText variant="caption" muted>
                  {t('common.buttonsCount', { count: items[b.id]?.length ?? 0 })}
                </AppText>
              </View>
              <Ionicons name="copy-outline" size={22} color={theme.colors.primary} />
            </Pressable>
          ))}
        </View>
      </Sheet>
    </Screen>
  );
}

function BoardCard({ board, count, first, last, onDuplicate }: { board: Board; count: number; first: boolean; last: boolean; onDuplicate: () => void }) {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const sw = cardSwatch(board.color, theme.mode);
  const hc = theme.highContrast;
  return (
    <View style={{ backgroundColor: sw.edge, borderRadius: RADIUS.xl, paddingBottom: 5 }}>
      <View style={[styles.card, { backgroundColor: hc ? theme.colors.surface : sw.bg, borderWidth: hc ? 2 : 0, borderColor: theme.colors.text }]}>
        <Pressable
          onPress={() => router.push({ pathname: '/board/[id]', params: { id: board.id } })}
          accessibilityRole="button"
          accessibilityLabel={`${L.boardName(board)}. ${t('common.buttonsCount', { count })}`}
          style={styles.cardMain}
        >
          <SymbolImage symbol={board.symbol} photo={board.photo} size={56} />
          <View style={{ flex: 1 }}>
            <AppText variant="heading" color={hc ? theme.colors.text : sw.text} numberOfLines={2}>
              {L.boardName(board)}
            </AppText>
            <AppText variant="caption" color={hc ? theme.colors.textMuted : sw.text}>
              {t('common.buttonsCount', { count })}
            </AppText>
          </View>
          <Ionicons name="arrow-forward-circle" size={34} color={hc ? theme.colors.text : '#FFFFFF'} />
        </Pressable>
        <View style={styles.cardTools}>
          <IconButton icon="create-outline" label={t('common.edit')} size={40} onPress={() => guarded(() => router.push({ pathname: '/board-editor', params: { id: board.id } }))} />
          <IconButton icon="copy-outline" label={t('common.duplicate')} size={40} onPress={onDuplicate} />
          <View style={{ flex: 1 }} />
          <IconButton icon="arrow-up" label={t('common.moveUp')} size={40} disabled={first} onPress={() => guarded(() => useApp.getState().moveBoard(board.id, -1))} />
          <IconButton icon="arrow-down" label={t('common.moveDown')} size={40} disabled={last} onPress={() => guarded(() => useApp.getState().moveBoard(board.id, 1))} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginVertical: 16 },
  card: { borderRadius: RADIUS.xl, padding: 14, gap: 10 },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardTools: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: RADIUS.lg, borderWidth: 2 },
});
