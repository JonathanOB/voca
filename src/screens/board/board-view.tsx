import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';

import { AppText } from '@/components/app-text';
import { confirm } from '@/components/dialog';
import { NavRow } from '@/components/form';
import { IconButton } from '@/components/icon-button';
import { FormsBubble } from '@/components/forms-bubble';
import { EmptyState, InfoBanner, Screen } from '@/components/layout';
import { QuickWordsBar } from '@/components/quick-words-bar';
import { SentenceStrip } from '@/components/sentence-strip';
import { Sheet } from '@/components/sheet';
import { SymbolImage } from '@/components/symbol-image';
import { AddTile, Tile, gridColumns } from '@/components/tile';
import type { BoardItem, Button } from '@/db/types';
import { speakButton, toSentenceItem, useActivateButton, useSpeechState } from '@/hooks/use-speech';
import type { TouchPoint } from '@/hooks/use-touch-select';
import { wordForms } from '@/i18n/forms';
import { useLabels } from '@/i18n/labels';
import { FAVOURITES_BOARD_ID, isFavourite, useApp } from '@/store/app-store';
import { guarded, requireCarer } from '@/store/lock-store';
import { useSentence } from '@/store/sentence-store';
import { toast } from '@/store/ui-store';
import { useTheme } from '@/theme';

const GAP = 12;

export interface BoardViewProps {
  boardId: string;
  /** Hide the title row (e.g. when the screen header already names the board). */
  hideTitle?: boolean;
  /** Render without the sentence strip regardless of settings. */
  noSentence?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** Button to point out ("Show where"), e.g. from search, to help partners model a word. */
  highlightId?: string;
  /** Replaces the Add tile's action (e.g. the phrase builder on the Phrases board). */
  onAdd?: () => void;
}

export function BoardView({ boardId, hideTitle, noSentence, header, footer, highlightId, onAdd }: BoardViewProps) {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const board = useApp((s) => s.boards.find((b) => b.id === boardId));
  const items = useApp(useShallow((s) => s.items[boardId] ?? EMPTY));
  const buttons = useApp((s) => s.buttons);
  const settings = useApp(
    useShallow((s) => ({
      display: s.settings.buttonDisplay,
      gridSize: s.settings.gridSize,
      stable: s.settings.stableLayout,
      fixedGrid: s.settings.fixedGrid,
      showSentence: s.settings.showSentenceBar,
      showQuickWords: s.settings.showQuickWords,
      tapAction: s.settings.tapAction,
    })),
  );
  const activate = useActivateButton(board);
  const { activeIds } = useSpeechState();
  const [width, setWidth] = useState(0);
  const [editing, setEditing] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [menuItem, setMenuItem] = useState<BoardItem | null>(null);
  const [bubble, setBubble] = useState<{ item: BoardItem; btn: Button; forms: string[]; at: TouchPoint } | null>(null);
  const language = useApp((s) => s.settings.language);
  const [pointing, setPointing] = useState<string | null>(highlightId ?? null);
  const scrollRef = useRef<ScrollView>(null);
  const gridY = useRef(0);

  const cols = width ? gridColumns(width, settings.gridSize, theme.isTablet, GAP, settings.fixedGrid) : 3;
  const tileW = width ? (width - GAP * (cols - 1)) / cols : 0;
  const effectiveTap = board?.tapAction ?? settings.tapAction;
  const showSentence = !noSentence && settings.showSentence && effectiveTap !== 'speak';
  const showQuick = !noSentence && settings.showQuickWords && board?.section !== 'safety';
  const hasInfo = !!board && board.id !== FAVOURITES_BOARD_ID;
  const hiddenCount = items.filter((i) => i.hidden).length;
  const revealHidden = editing || exploring;

  const visible = useMemo(
    () => items.filter((i) => buttons[i.buttonId] && (revealHidden || !i.hidden || settings.stable)),
    [items, buttons, revealHidden, settings.stable],
  );

  // "Show where": stop pointing after a few seconds.
  useEffect(() => {
    if (!pointing) return;
    const found = buttons[pointing];
    if (found) AccessibilityInfo.announceForAccessibility(`${t('board.foundHere')}: ${L.buttonLabel(found)}`);
    const id = setTimeout(() => setPointing(null), 4500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointing]);

  const menuButton = menuItem ? buttons[menuItem.buttonId] : undefined;
  const menuIsFav = useApp((s) => (menuButton ? isFavourite(s, menuButton.id) : false));

  if (!board) {
    return (
      <Screen>
        <EmptyState title={t('board.notFound')} />
      </Screen>
    );
  }

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.floor(e.nativeEvent.layout.width);
    if (w && Math.abs(w - width) > 1) setWidth(w);
  };

  const openEditor = (item?: BoardItem) =>
    router.push({
      pathname: '/button-editor',
      params: item ? { boardId, itemId: item.id, buttonId: item.buttonId } : { boardId },
    });

  const onTilePress = (item: BoardItem, btn: Button) => {
    if (editing) openEditor(item);
    else activate(btn);
  };

  // Long press: other forms of the word first (if any), with the full menu as the last option.
  const onTileLongPress = (item: BoardItem, btn: Button, at: TouchPoint) => {
    const forms = editing ? [] : wordForms(btn, language);
    if (forms.length) setBubble({ item, btn, forms, at });
    else setMenuItem(item);
  };

  return (
    <Screen scrollRef={scrollRef}>
      {header}
      {showSentence ? (
        <View style={{ marginBottom: 12 }}>
          <SentenceStrip compact={!theme.isTablet} />
        </View>
      ) : null}
      {showQuick ? <QuickWordsBar board={board} /> : null}

      <View style={[styles.titleRow, hideTitle && { marginTop: 0 }]}>
        {!hideTitle ? <SymbolImage symbol={board.symbol} photo={board.photo} size={40} /> : null}
        <View style={{ flex: 1 }}>
          {!hideTitle ? (
            <AppText variant="title" accessibilityRole="header" numberOfLines={2}>
              {L.boardName(board)}
            </AppText>
          ) : null}
          {editing ? (
            <AppText variant="caption" color={theme.colors.primary}>
              {t('board.editing')}
            </AppText>
          ) : null}
        </View>
        {hiddenCount > 0 && !editing ? (
          <IconButton
            icon={exploring ? 'eye-off-outline' : 'eye-outline'}
            label={exploring ? t('board.exploreOff') : t('board.explore')}
            size={44}
            variant="soft"
            selected={exploring}
            onPress={() => setExploring((x) => !x)}
          />
        ) : null}
        {hasInfo ? (
          <IconButton icon="information" label={t('board.info')} size={44} variant="soft" onPress={() => router.push({ pathname: '/board-info', params: { id: board.id } })} />
        ) : null}
        <IconButton
          icon={editing ? 'checkmark' : 'create-outline'}
          label={editing ? t('common.done') : t('board.edit')}
          size={44}
          variant={editing ? 'primary' : 'soft'}
          onPress={() => (editing ? setEditing(false) : guarded(() => setEditing(true)))}
        />
      </View>

      {editing ? (
        <View style={{ gap: 10, marginBottom: 14 }}>
          <InfoBanner text={t('board.editHint')} icon="hand-left-outline" />
          {board.id !== FAVOURITES_BOARD_ID ? (
            <NavRow icon="options-outline" label={t('board.boardSettings')} onPress={() => router.push({ pathname: '/board-editor', params: { id: board.id } })} />
          ) : null}
        </View>
      ) : exploring ? (
        <View style={{ marginBottom: 14 }}>
          <InfoBanner text={t('board.exploring')} icon="eye-outline" />
        </View>
      ) : null}

      <View
        style={styles.grid}
        onLayout={(e) => {
          onLayout(e);
          gridY.current = e.nativeEvent.layout.y;
        }}
      >
        {tileW > 0 &&
          visible.map((item, i) => {
            const btn = buttons[item.buttonId];
            if (!btn) return null;
            if (item.hidden && !revealHidden) {
              // Masking: the hidden word keeps its space so nothing else moves.
              return <View key={item.id} style={{ width: tileW, height: 1 }} accessible={false} />;
            }
            const label = L.buttonLabel(btn);
            const pointed = pointing === btn.id;
            return (
              <Animated.View
                key={item.id}
                entering={theme.reducedMotion ? undefined : FadeIn.duration(200).delay(Math.min(i * 10, 160))}
                onLayout={
                  pointed
                    ? (e) => scrollRef.current?.scrollTo({ y: Math.max(0, gridY.current + e.nativeEvent.layout.y - 160), animated: !theme.reducedMotion })
                    : undefined
                }
              >
                <Pulse active={pointed} />
                <Tile
                  label={label}
                  symbol={btn.symbol}
                  photo={btn.photo}
                  type={btn.type}
                  width={tileW}
                  display={settings.display}
                  urgent={board.tone === 'urgent'}
                  hasAudio={!!btn.audio}
                  dimmed={item.hidden}
                  active={activeIds.includes(btn.id) || pointed}
                  onPress={() => onTilePress(item, btn)}
                  onLongPress={(at) => onTileLongPress(item, btn, at)}
                  a11yHint={editing ? t('board.editButton') : t('board.tileHint')}
                  badge={
                    item.hidden ? (
                      <View style={[styles.hiddenBadge, { backgroundColor: theme.colors.ink }]}>
                        <AppText variant="tiny" color={theme.colors.inkText}>
                          {t('board.hidden')}
                        </AppText>
                      </View>
                    ) : null
                  }
                  footer={
                    editing ? (
                      <View style={styles.editRow}>
                        <IconButton icon="chevron-back" label={t('board.moveEarlier')} size={34} variant="soft" onPress={() => useApp.getState().moveItem(boardId, item.id, -1)} />
                        <IconButton
                          icon={item.hidden ? 'eye-outline' : 'eye-off-outline'}
                          label={item.hidden ? t('board.showHere') : t('board.hideHere')}
                          size={34}
                          variant="soft"
                          onPress={() => useApp.getState().setItemHidden(boardId, item.id, !item.hidden)}
                        />
                        <IconButton icon="chevron-forward" label={t('board.moveLater')} size={34} variant="soft" onPress={() => useApp.getState().moveItem(boardId, item.id, 1)} />
                      </View>
                    ) : null
                  }
                />
              </Animated.View>
            );
          })}
        {tileW > 0 ? (
          <AddTile
            width={tileW}
            display={settings.display}
            label={t('board.add')}
            a11yLabel={t('board.addA11y', { board: L.boardName(board) })}
            onPress={() => guarded(() => (onAdd ? onAdd() : openEditor()))}
          />
        ) : null}
      </View>

      {items.length === 0 ? <EmptyState title={t('board.emptyTitle')} body={t('board.emptyBody')} /> : null}
      {footer}

      {bubble ? (
        <FormsBubble
          word={L.buttonLabel(bubble.btn)}
          forms={bubble.forms}
          x={bubble.at.x}
          y={bubble.at.y}
          onPick={(form) => {
            setBubble(null);
            activate(bubble.btn, undefined, form);
          }}
          onMore={() => {
            setMenuItem(bubble.item);
            setBubble(null);
          }}
          onClose={() => setBubble(null)}
        />
      ) : null}

      <Sheet visible={!!menuItem && !!menuButton} onClose={() => setMenuItem(null)} title={menuButton ? L.buttonLabel(menuButton) : t('board.menuTitle')}>
        {menuItem && menuButton ? (
          <View style={{ gap: 10, paddingBottom: 8 }}>
            <NavRow icon="volume-high-outline" label={t('board.speakOnly')} onPress={() => { setMenuItem(null); speakButton(menuButton); }} />
            <NavRow
              icon="add-circle-outline"
              label={t('board.addToSentence')}
              onPress={() => {
                setMenuItem(null);
                useSentence.getState().add(toSentenceItem(menuButton));
              }}
            />
            <NavRow
              icon={menuIsFav ? 'star' : 'star-outline'}
              label={menuIsFav ? t('board.unfavourite') : t('board.favourite')}
              onPress={() => {
                setMenuItem(null);
                guarded(async () => {
                  const now = await useApp.getState().toggleFavourite(menuButton.id);
                  toast(t(now ? 'board.favouriteAdded' : 'board.favouriteRemoved'), { tone: 'success' });
                });
              }}
            />
            <NavRow icon="create-outline" label={t('board.editButton')} onPress={() => { setMenuItem(null); guarded(() => openEditor(menuItem)); }} />
            <NavRow
              icon={menuItem.hidden ? 'eye-outline' : 'eye-off-outline'}
              label={menuItem.hidden ? t('board.showHere') : t('board.hideHere')}
              onPress={() => {
                const item = menuItem;
                setMenuItem(null);
                guarded(() => useApp.getState().setItemHidden(boardId, item.id, !item.hidden));
              }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <NavRow icon="arrow-back" label={t('board.moveEarlier')} onPress={() => guarded(() => useApp.getState().moveItem(boardId, menuItem.id, -1))} right={<View />} />
              </View>
              <View style={{ flex: 1 }}>
                <NavRow icon="arrow-forward" label={t('board.moveLater')} onPress={() => guarded(() => useApp.getState().moveItem(boardId, menuItem.id, 1))} right={<View />} />
              </View>
            </View>
            <NavRow
              icon="trash-outline"
              danger
              label={t('board.removeHere')}
              onPress={async () => {
                const item = menuItem;
                setMenuItem(null);
                if (!(await requireCarer())) return;
                const ok = await confirm({
                  title: t('board.removeConfirmTitle'),
                  body: t('board.removeConfirmBody'),
                  confirmLabel: t('common.remove'),
                  destructive: true,
                });
                if (ok) await useApp.getState().removeItem(boardId, item.id);
              }}
            />
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const EMPTY: BoardItem[] = [];

/** Gentle expanding ring that points out a tile (word finder). Static outline under reduced motion. */
function Pulse({ active }: { active: boolean }) {
  const theme = useTheme();
  const v = useSharedValue(0);
  useEffect(() => {
    if (active && !theme.reducedMotion) v.set(withRepeat(withTiming(1, { duration: 900 }), 4, false));
    else v.set(0);
  }, [active, theme.reducedMotion, v]);
  const style = useAnimatedStyle(() => ({ opacity: (1 - v.get()) * 0.9, transform: [{ scale: 1 + v.get() * 0.14 }] }));
  if (!active) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius: 28, borderWidth: 4, borderColor: theme.colors.focus, zIndex: 2 }, style]}
    />
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  editRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 6 },
  hiddenBadge: { position: 'absolute', top: 6, left: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
});
