import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { AppText } from '@/components/app-text';
import { TextField } from '@/components/form';
import { Screen } from '@/components/layout';
import { SentenceStrip } from '@/components/sentence-strip';
import { Tile, gridColumns } from '@/components/tile';
import { FAVOURITES_BOARD_ID } from '@/data/standard-content';
import { useActivateButton, useSpeechState } from '@/hooks/use-speech';
import { useLabels } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { useTheme } from '@/theme';

const GAP = 12;

/** Search every button on every board (offline, in memory). */
export function SearchScreen() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const [query, setQuery] = useState('');
  const [width, setWidth] = useState(0);
  const buttons = useApp((s) => s.buttons);
  const boards = useApp((s) => s.boards);
  const items = useApp((s) => s.items);
  const display = useApp((s) => s.settings.buttonDisplay);
  const gridSize = useApp((s) => s.settings.gridSize);
  const fixedGrid = useApp((s) => s.settings.fixedGrid);
  const showSentence = useApp((s) => s.settings.showSentenceBar && s.settings.tapAction !== 'speak');
  const activate = useActivateButton(null);
  const { activeIds } = useSpeechState();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    // Where to point a partner: a visible spot on a real board beats a masked one,
    // and Favourites (a shortcut copy) is the last resort.
    const onBoard = new Map<string, { id: string; name: string; rank: number }>();
    for (const b of boards) {
      if (b.hidden) continue;
      for (const it of items[b.id] ?? []) {
        const rank = (b.id === FAVOURITES_BOARD_ID ? 2 : 0) + (it.hidden ? 1 : 0);
        const prev = onBoard.get(it.buttonId);
        if (!prev || rank < prev.rank) onBoard.set(it.buttonId, { id: b.id, name: L.boardName(b), rank });
      }
    }
    return Object.values(buttons)
      .filter((b) => onBoard.has(b.id))
      .map((b) => ({ b, label: L.buttonLabel(b), spoken: L.buttonSpoken(b), board: onBoard.get(b.id)!.name, boardId: onBoard.get(b.id)!.id }))
      .filter((x) => x.label.toLowerCase().includes(q) || x.spoken.toLowerCase().includes(q))
      .sort((a, b) => Number(!a.label.toLowerCase().startsWith(q)) - Number(!b.label.toLowerCase().startsWith(q)) || a.label.localeCompare(b.label))
      .slice(0, 80);
  }, [query, buttons, boards, items, L]);

  const cols = width ? gridColumns(width, gridSize, theme.isTablet, GAP, fixedGrid) : 3;
  const tileW = width ? (width - GAP * (cols - 1)) / cols : 0;

  return (
    <Screen>
      {showSentence ? (
        <View style={{ marginBottom: 14 }}>
          <SentenceStrip compact />
        </View>
      ) : null}
      <TextField value={query} onChangeText={setQuery} placeholder={t('library.searchPlaceholder')} accessibilityLabel={t('library.searchPlaceholder')} autoCorrect={false} returnKeyType="search" large />
      <View style={{ height: 16 }} />
      {!query.trim() ? (
        <AppText muted center>
          {t('library.searchHint')}
        </AppText>
      ) : results.length === 0 ? (
        <AppText muted center>
          {t('library.searchEmpty', { query: query.trim() })}
        </AppText>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }} onLayout={(e: LayoutChangeEvent) => setWidth(Math.floor(e.nativeEvent.layout.width))}>
        {tileW > 0 &&
          results.map(({ b, label, board, boardId }) => (
            <View key={b.id} style={{ width: tileW }}>
              <Tile
                label={label}
                symbol={b.symbol}
                photo={b.photo}
                type={b.type}
                width={tileW}
                display={display}
                hasAudio={!!b.audio}
                active={activeIds.includes(b.id)}
                onPress={() => activate(b)}
                a11yHint={t('library.onBoard', { board })}
              />
              {/* Word finder: helps partners find a word to model, and learners learn where it lives. */}
              <Pressable
                onPress={() => router.push({ pathname: '/board/[id]', params: { id: boardId, highlight: b.id } })}
                accessibilityRole="button"
                accessibilityLabel={`${t('library.showWhere')}: ${label}, ${board}`}
                accessibilityHint={t('library.showWhereHint')}
                hitSlop={6}
                style={({ pressed }) => [styles.where, { backgroundColor: pressed ? theme.colors.primarySoft : 'transparent' }]}
              >
                <Ionicons name="locate" size={14} color={theme.colors.primary} />
                <AppText variant="tiny" color={theme.colors.primary} numberOfLines={2} style={{ flexShrink: 1 }}>
                  {board}
                </AppText>
              </Pressable>
            </View>
          ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  where: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4, paddingVertical: 6, borderRadius: 10, minHeight: 32 },
});
