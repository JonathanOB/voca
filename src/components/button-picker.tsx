import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, View } from 'react-native';

import { AppText } from './app-text';
import { Chip, TextField } from './form';
import { PushButton } from './push-button';
import { Sheet } from './sheet';
import { Tile } from './tile';
import { useLabels } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { useTheme } from '@/theme';

/** Pick one or more existing buttons (reused by stable ID, never duplicated). */
export function ButtonPicker({
  visible,
  onClose,
  onDone,
  title,
  multiple = false,
  max = 99,
  initial = [],
  preferBoards = [],
}: {
  visible: boolean;
  onClose: () => void;
  onDone: (ids: string[]) => void;
  title?: string;
  multiple?: boolean;
  max?: number;
  initial?: string[];
  preferBoards?: string[];
}) {
  const theme = useTheme();
  const L = useLabels();
  const { t } = useTranslation();
  const boards = useApp((s) => s.boards);
  const items = useApp((s) => s.items);
  const buttons = useApp((s) => s.buttons);
  const [query, setQuery] = useState('');
  const [boardId, setBoardId] = useState<string | null>(preferBoards[0] ?? null);
  const [picked, setPicked] = useState<string[]>(initial);

  const visibleBoards = useMemo(() => {
    const list = boards.filter((b) => !b.hidden && (items[b.id]?.length ?? 0) > 0);
    return [...list.filter((b) => preferBoards.includes(b.id)), ...list.filter((b) => !preferBoards.includes(b.id))];
  }, [boards, items, preferBoards]);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    let ids: string[];
    if (q) {
      ids = Object.values(buttons)
        .filter((b) => L.buttonLabel(b).toLowerCase().includes(q))
        .map((b) => b.id);
    } else if (boardId) {
      ids = (items[boardId] ?? []).map((i) => i.buttonId);
    } else {
      ids = visibleBoards.flatMap((b) => (items[b.id] ?? []).map((i) => i.buttonId));
    }
    return [...new Set(ids)].filter((id) => buttons[id]);
  }, [query, boardId, items, buttons, visibleBoards, L]);

  const w = theme.isTablet ? 120 : 96;
  const cols = Math.max(3, Math.floor((Math.min(theme.width, 720) - 40) / (w + 10)));
  const tileW = (Math.min(theme.width, 720) - 40 - (cols - 1) * 10) / cols;

  const toggle = (id: string) => {
    if (!multiple) {
      onDone([id]);
      onClose();
      return;
    }
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= max ? p : [...p, id]));
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title ?? t('buttonPicker.title')}
      scroll={false}
      maxHeight="92%"
      footer={
        multiple ? (
          <PushButton
            title={`${t('common.done')} · ${t('buttonPicker.selected', { count: picked.length })}`}
            full
            onPress={() => {
              onDone(picked);
              onClose();
            }}
          />
        ) : undefined
      }
    >
      <TextField value={query} onChangeText={setQuery} placeholder={t('buttonPicker.search')} accessibilityLabel={t('buttonPicker.search')} autoCorrect={false} />
      {!query ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }} style={{ flexGrow: 0 }}>
          {visibleBoards.map((b) => (
            <Chip key={b.id} label={L.boardName(b)} selected={boardId === b.id} onPress={() => setBoardId(b.id)} />
          ))}
        </ScrollView>
      ) : (
        <View style={{ height: 12 }} />
      )}
      <FlatList
        data={data}
        key={cols}
        numColumns={cols}
        keyExtractor={(id) => id}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        style={{ flexShrink: 1 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <AppText muted center style={{ padding: 24 }}>
            {t('buttonPicker.empty')}
          </AppText>
        }
        renderItem={({ item: id }) => {
          const b = buttons[id];
          return (
            <Tile
              label={L.buttonLabel(b)}
              symbol={b.symbol}
              photo={b.photo}
              type={b.type}
              width={tileW}
              display="imageText"
              active={picked.includes(id)}
              onPress={() => toggle(id)}
            />
          );
        }}
      />
    </Sheet>
  );
}
