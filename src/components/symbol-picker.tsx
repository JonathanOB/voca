import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { AppText } from './app-text';
import { Chip, TextField } from './form';
import { Sheet } from './sheet';
import { SymbolImage } from './symbol-image';
import { STD_BUTTONS, STD_STEPS } from '@/data/standard-content';
import { SYMBOL_GROUPS, searchSymbols, symbolId, type SymbolGroup } from '@/data/symbols';
import { vocabLabel } from '@/i18n/labels';
import { useTheme } from '@/theme';

export function SymbolPicker({
  visible,
  onClose,
  onPick,
  initialQuery = '',
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (id: string) => void;
  initialQuery?: string;
}) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [group, setGroup] = useState<SymbolGroup | null>(null);

  // Start each opening from the current label, so typing "Grandma" first finds Grandma.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setQuery(initialQuery);
      setGroup(null);
    }
  }

  // Translated vocabulary words help people search in their own language.
  const extra = useMemo(() => {
    const m = new Map<string, string>();
    const add = (sym: string, word: string) => {
      const id = symbolId(sym);
      m.set(id, `${m.get(id) ?? ''} ${word.toLowerCase()}`);
    };
    Object.entries(STD_BUTTONS).forEach(([k, b]) => add(b.sym, vocabLabel(k)));
    Object.entries(STD_STEPS).forEach(([k, s]) => add(s, vocabLabel(k)));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const results = useMemo(() => searchSymbols(query, group, extra), [query, group, extra]);
  const cell = theme.isTablet ? 76 : 64;
  const cols = Math.max(4, Math.floor((Math.min(theme.width, 720) - 40) / cell));

  return (
    <Sheet visible={visible} onClose={onClose} title={t('symbolPicker.title')} scroll={false} maxHeight="92%">
      <TextField value={query} onChangeText={setQuery} placeholder={t('symbolPicker.search')} accessibilityLabel={t('symbolPicker.search')} autoCorrect={false} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }} style={{ flexGrow: 0 }}>
        <Chip label={t('symbolPicker.groups.all')} selected={!group} onPress={() => setGroup(null)} />
        {SYMBOL_GROUPS.map((g) => (
          <Chip key={g} label={t(`symbolPicker.groups.${g}`)} selected={group === g} onPress={() => setGroup(g)} />
        ))}
      </ScrollView>
      <FlatList
        data={results}
        key={cols}
        numColumns={cols}
        keyExtractor={(s) => s.id}
        initialNumToRender={cols * 6}
        windowSize={7}
        style={{ flexShrink: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <AppText muted center style={{ padding: 24 }}>
            {t('symbolPicker.noResults')}
          </AppText>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              onPick(item.id);
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            style={({ pressed }) => ({
              width: `${100 / cols}%`,
              aspectRatio: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
              backgroundColor: pressed ? theme.colors.primarySoft : 'transparent',
            })}
          >
            <View pointerEvents="none">
              <SymbolImage symbol={item.id} size={cell * 0.72} />
            </View>
          </Pressable>
        )}
      />
    </Sheet>
  );
}
