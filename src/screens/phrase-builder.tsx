/**
 * Phrase builder: make a whole message that can be said with one tap.
 * Build it from word buttons (drag to reorder) or type it, then save it as a
 * button on the Phrases board (or another board).
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { alertDialog } from '@/components/dialog';
import { DragChips, type WordChip } from '@/components/drag-chips';
import { Chip, FieldLabel, Segmented, TextField } from '@/components/form';
import { IconButton } from '@/components/icon-button';
import { PushButton } from '@/components/push-button';
import { SymbolImage } from '@/components/symbol-image';
import { SymbolPicker } from '@/components/symbol-picker';
import { Tile } from '@/components/tile';
import { FAVOURITES_BOARD_ID, PHRASES_BOARD_ID, stdBoardId } from '@/data/standard-content';
import { symbolId } from '@/data/symbols';
import type { Button } from '@/db/types';
import { speakText, stopSpeaking, useSpeechState } from '@/hooks/use-speech';
import { joinWords } from '@/i18n/join';
import { useLabels } from '@/i18n/labels';
import { newId } from '@/services/ids';
import { moveItem } from '@/services/touch-rules';
import { useApp } from '@/store/app-store';
import { useSentence } from '@/store/sentence-store';
import { toast } from '@/store/ui-store';
import { RADIUS, softShadow, useTheme } from '@/theme';

type Mode = 'words' | 'type';

const EMPTY_SYMBOL = symbolId('💬');

export function PhraseBuilder() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const L = useLabels();
  const params = useLocalSearchParams<{ boardId?: string; fromSentence?: string; text?: string }>();
  const buttons = useApp((s) => s.buttons);
  const boards = useApp((s) => s.boards);
  const items = useApp((s) => s.items);
  const display = useApp((s) => s.settings.buttonDisplay);
  const { speaking } = useSpeechState();

  const [chips, setChips] = useState<WordChip[]>(() =>
    params.fromSentence
      ? useSentence.getState().items.map((i) => ({ key: newId('chip'), text: i.label, symbol: i.symbol, photo: i.photo, buttonId: i.buttonId }))
      : [],
  );
  const [typed, setTyped] = useState(params.text ?? '');
  const [mode, setMode] = useState<Mode>(params.text ? 'type' : 'words');
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [extra, setExtra] = useState('');
  const [symbol, setSymbol] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [target, setTarget] = useState(params.boardId ?? PHRASES_BOARD_ID);
  const [saving, setSaving] = useState(false);

  const text = mode === 'words' ? joinWords(chips.map((c) => c.text)) : typed.trim();
  const picture = symbol ?? chips.find((c) => c.symbol)?.symbol ?? EMPTY_SYMBOL;
  const photo = symbol ? null : (chips.find((c) => c.symbol || c.photo)?.photo ?? null);

  // Words to pick from: search results, or core words when the search is empty.
  const sources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return Object.values(buttons)
        .filter((b) => L.buttonLabel(b).toLowerCase().includes(q))
        .sort((a, b) => Number(!L.buttonLabel(a).toLowerCase().startsWith(q)) - Number(!L.buttonLabel(b).toLowerCase().startsWith(q)))
        .slice(0, 30);
    }
    const ids = [...(items[stdBoardId('core')] ?? []), ...(items[stdBoardId('core2')] ?? [])].map((i) => i.buttonId);
    return [...new Set(ids)].map((id) => buttons[id]).filter(Boolean);
  }, [query, buttons, items, L]);

  const targets = useMemo(
    () => boards.filter((b) => !b.hidden && (b.id === PHRASES_BOARD_ID || b.id === FAVOURITES_BOARD_ID || !b.isStandard)),
    [boards],
  );

  const addButton = (b: Button) => {
    setChips((c) => [...c, { key: newId('chip'), text: L.buttonLabel(b), symbol: b.symbol, photo: b.photo, buttonId: b.id }]);
  };

  const addExtra = () => {
    const words = extra.trim();
    if (!words) return;
    setChips((c) => [...c, { key: newId('chip'), text: words, symbol: null, photo: null, buttonId: null }]);
    setExtra('');
  };

  const switchMode = (m: Mode) => {
    // Carry the phrase across so nothing is lost when switching.
    if (m === 'type' && !typed.trim() && chips.length) setTyped(joinWords(chips.map((c) => c.text)));
    if (m === 'words' && !chips.length && typed.trim()) {
      setChips(typed.trim().split(/\s+/).map((w) => ({ key: newId('chip'), text: w, symbol: null, photo: null, buttonId: null })));
    }
    setMode(m);
  };

  const selIndex = chips.findIndex((c) => c.key === selected);
  // Word tiles fill the row: 4 across on phones, 6 on tablets.
  const gridCols = theme.isTablet ? 6 : 4;
  const tileW = Math.floor((Math.min(theme.width, 760) - 40 - 10 * (gridCols - 1)) / gridCols);

  const save = async () => {
    if (!text) return alertDialog(t('phrases.required'));
    setSaving(true);
    try {
      const now = Date.now();
      const btn: Button = {
        id: newId('btn'),
        stdKey: null,
        label: text,
        spoken: null,
        lang: null,
        symbol: photo ? null : picture,
        photo,
        audio: null,
        type: 'social',
        forms: null,
        isStandard: false,
        createdAt: now,
        updatedAt: now,
      };
      await useApp.getState().saveButton(btn, { addToBoard: target });
      toast(t('phrases.saved'), { tone: 'success' });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10 }]}>
        <IconButton icon="close" label={t('common.cancel')} onPress={() => router.back()} size={44} />
        <AppText variant="heading" style={{ flex: 1 }} center accessibilityRole="header">
          {t('phrases.title')}
        </AppText>
        <IconButton icon="checkmark" label={t('phrases.save')} variant="primary" onPress={save} size={44} disabled={!text || saving} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, maxWidth: 760, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
        {/* preview */}
        <View style={[styles.preview, { backgroundColor: theme.colors.surface }, softShadow(theme, 2)]}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <SymbolImage symbol={photo ? null : picture} photo={photo} size={64} rounded={12} />
            <Chip label={t('phrases.picture')} icon="image-outline" onPress={() => setPickerOpen(true)} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <AppText variant="caption" muted>
              {t('phrases.preview')}
            </AppText>
            <AppText variant="subheading" accessibilityLiveRegion="polite">
              {text || t('phrases.empty')}
            </AppText>
          </View>
          <IconButton
            icon={speaking ? 'stop' : 'volume-high'}
            label={speaking ? t('common.stop') : t('common.speak')}
            variant="primary"
            disabled={!text && !speaking}
            onPress={() => (speaking ? stopSpeaking() : speakText(text))}
          />
        </View>

        <View style={{ marginTop: 18 }}>
          <Segmented
            value={mode}
            onChange={switchMode}
            options={[
              { value: 'words', label: t('phrases.words'), icon: 'apps-outline' },
              { value: 'type', label: t('phrases.type'), icon: 'create-outline' },
            ]}
          />
        </View>

        {mode === 'words' ? (
          <>
            <View style={[styles.chipArea, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt }]}>
              {chips.length ? (
                <DragChips
                  chips={chips}
                  selected={selected}
                  onSelect={setSelected}
                  onMove={(from, to) => setChips((c) => moveItem(c, from, to))}
                  onRemove={(key) => setChips((c) => c.filter((x) => x.key !== key))}
                />
              ) : (
                <AppText muted center>
                  {t('phrases.empty')}
                </AppText>
              )}
            </View>
            {chips.length ? (
              <AppText variant="caption" muted style={{ marginTop: 6 }}>
                {t('phrases.dragHint')}
              </AppText>
            ) : null}
            {selIndex >= 0 ? (
              <View style={styles.selRow}>
                <IconButton icon="chevron-back" label={t('common.moveLeft')} variant="soft" size={44} disabled={selIndex === 0} onPress={() => setChips((c) => moveItem(c, selIndex, selIndex - 1))} />
                <IconButton icon="chevron-forward" label={t('common.moveRight')} variant="soft" size={44} disabled={selIndex === chips.length - 1} onPress={() => setChips((c) => moveItem(c, selIndex, selIndex + 1))} />
                <View style={{ flex: 1 }} />
                <IconButton
                  icon="trash-outline"
                  label={t('phrases.removeWord')}
                  variant="soft"
                  size={44}
                  onPress={() => {
                    setChips((c) => c.filter((x) => x.key !== selected));
                    setSelected(null);
                  }}
                />
              </View>
            ) : null}

            <FieldLabel>{query.trim() ? t('phrases.search') : t('phrases.core')}</FieldLabel>
            <TextField value={query} onChangeText={setQuery} placeholder={t('phrases.search')} accessibilityLabel={t('phrases.search')} returnKeyType="search" />
            <View style={styles.grid}>
              {sources.map((b) => (
                <Tile key={b.id} label={L.buttonLabel(b)} symbol={b.symbol} photo={b.photo} type={b.type} width={tileW} display={display} onPress={() => addButton(b)} />
              ))}
            </View>

            <FieldLabel>{t('phrases.addTyped')}</FieldLabel>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <TextField value={extra} onChangeText={setExtra} placeholder={t('phrases.addTypedPlaceholder')} accessibilityLabel={t('phrases.addTyped')} onSubmitEditing={addExtra} returnKeyType="done" />
              </View>
              <IconButton icon="add" label={t('phrases.addTyped')} variant="primary" onPress={addExtra} disabled={!extra.trim()} />
            </View>
          </>
        ) : (
          <View style={{ marginTop: 14 }}>
            <TextField
              value={typed}
              onChangeText={setTyped}
              placeholder={t('phrases.typePlaceholder')}
              accessibilityLabel={t('phrases.typePlaceholder')}
              multiline
              large
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
          </View>
        )}

        <FieldLabel>{t('phrases.saveTo')}</FieldLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={t('phrases.saveTo')}>
          {targets.map((b) => (
            <Chip key={b.id} label={L.boardName(b)} selected={target === b.id} onPress={() => setTarget(b.id)} />
          ))}
        </View>

        <View style={{ marginTop: 22 }}>
          <PushButton title={t('phrases.save')} icon="bookmark" full onPress={save} disabled={!text || saving} />
        </View>
      </ScrollView>

      <SymbolPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} initialQuery={chips[0]?.text ?? ''} onPick={(id) => setSymbol(id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: RADIUS.xl },
  chipArea: { marginTop: 14, minHeight: 88, padding: 12, borderRadius: RADIUS.lg, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center' },
  selRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
});
