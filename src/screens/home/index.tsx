import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { AppText } from '@/components/app-text';
import { SafetyButton } from '@/components/app-header';
import { LanguageButton } from '@/components/language-button';
import { IconButton } from '@/components/icon-button';
import { SectionHeader } from '@/components/layout';
import { Mascot } from '@/components/mascot';
import { SentenceStrip } from '@/components/sentence-strip';
import { SymbolImage } from '@/components/symbol-image';
import { AddTile, Tile } from '@/components/tile';
import { QUICK_ACTIONS } from '@/data/quick-actions';
import { FAVOURITES_BOARD_ID, TODAY_ROUTINE_ID } from '@/data/standard-content';
import type { Button } from '@/db/types';
import { useActivateButton, useSpeechState } from '@/hooks/use-speech';
import { useLabels } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { guarded } from '@/store/lock-store';
import { useSentence } from '@/store/sentence-store';
import type { QuickActionId } from '@/store/settings';
import { RADIUS, cardSwatch, softShadow, useTheme } from '@/theme';

export function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const L = useLabels();
  const { t } = L;
  const navigation = useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const userName = useApp((s) => s.settings.userName.trim());
  const quick = useApp((s) => s.settings.quickActions);
  const hasSentence = useSentence((s) => s.items.length > 0);
  const { speaking } = useSpeechState();
  const permanentDrawer = theme.width >= 1100;
  const pad = theme.isTablet ? 28 : 18;
  const cols = theme.width >= 1100 ? 4 : theme.width >= 700 ? 3 : 2;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingHorizontal: pad, paddingBottom: insets.bottom + 40, maxWidth: 1100, width: '100%', alignSelf: 'center' }}
    >
      {/* top row */}
      <View style={styles.topRow}>
        {!permanentDrawer ? <IconButton icon="menu" label={t('nav.openMenu')} onPress={() => navigation.openDrawer()} size={46} /> : null}
        <View style={{ flex: 1 }} />
        <LanguageButton />
        <SafetyButton />
      </View>

      {/* greeting */}
      <View style={styles.greeting}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primarySoft }]}>
          <Mascot size={74} talking={speaking} float={false} sparkle={false} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="title" accessibilityRole="header">
            {userName ? t('home.greeting', { name: userName }) : t('home.greetingNoName')} 👋
          </AppText>
          <AppText variant="body" muted>
            {t('home.subtitle')}
          </AppText>
        </View>
      </View>

      <TodayCard />

      {hasSentence ? (
        <View style={{ marginTop: 16 }}>
          <SentenceStrip compact />
        </View>
      ) : null}

      {/* quick actions */}
      <SectionHeader title={t('home.quickActions')} action={t('home.editShortcuts')} onAction={() => guarded(() => router.push('/quick-actions'))} />
      <View style={styles.grid}>
        {quick.map((id, i) => (
          <Animated.View
            key={id}
            entering={theme.reducedMotion ? undefined : FadeInDown.duration(320).delay(60 + i * 60)}
            style={{ width: `${100 / cols}%`, padding: 6 }}
          >
            <QuickCard id={id} />
          </Animated.View>
        ))}
      </View>

      <FavouritesRow />
      <RoutinesSection />
    </ScrollView>
      {/* Solid strip behind the status bar so scrolled content never sits under the clock. */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: theme.colors.bg }} />
    </View>
  );
}

function TodayCard() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const steps = useApp(useShallow((s) => s.steps[TODAY_ROUTINE_ID] ?? []));
  const buttons = useApp((s) => s.buttons);
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  const shown = steps.slice(0, 8);

  return (
    <Pressable
      onPress={() => router.push('/my-day')}
      accessibilityRole="button"
      accessibilityLabel={`${t('home.todayTitle')}. ${t('home.todayProgress', { done, total: steps.length })}. ${next ? t('home.todayNext', { label: L.stepLabel(next, buttons) }) : ''}`}
      style={({ pressed }) => [
        styles.today,
        { backgroundColor: theme.colors.primarySoft, borderColor: theme.highContrast ? theme.colors.text : 'transparent', transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <View style={{ flex: 1 }}>
        <AppText variant="subheading">
          {t('home.todayTitle')} · {t('home.todayProgress', { done, total: steps.length })}
        </AppText>
        <View style={styles.dots}>
          {shown.map((s) => (
            <View key={s.id} style={{ alignItems: 'center', gap: 4 }}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: s.done ? theme.colors.primary : theme.colors.surface,
                    borderColor: s.done ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                {s.done ? <Ionicons name="checkmark" size={16} color={theme.colors.onPrimary} /> : <SymbolImage {...L_stepSym(s, buttons)} size={20} />}
              </View>
            </View>
          ))}
        </View>
        <AppText variant="caption" muted style={{ marginTop: 6 }}>
          {next ? t('home.todayNext', { label: L.stepLabel(next, buttons) }) : t('home.todayAllDone')}
        </AppText>
      </View>
      <SymbolImage emoji={next ? '🗓️' : '⭐'} size={48} />
    </Pressable>
  );
}

function L_stepSym(step: { symbol: string | null; photo: string | null; buttonId: string | null }, buttons: Record<string, Button>) {
  const b = step.buttonId ? buttons[step.buttonId] : undefined;
  return { symbol: step.symbol ?? b?.symbol ?? null, photo: step.photo ?? b?.photo ?? null };
}

function QuickCard({ id }: { id: QuickActionId }) {
  const theme = useTheme();
  const { t } = useLabels();
  const qa = QUICK_ACTIONS[id];
  const sw = cardSwatch(qa.color, theme.mode);
  const hc = theme.highContrast;
  return (
    <Pressable
      onPress={() => router.push(qa.href)}
      accessibilityRole="button"
      accessibilityLabel={`${t(`quick.${id}.title`)}. ${t(`quick.${id}.sub`)}`}
      style={({ pressed }) => [{ backgroundColor: sw.edge, borderRadius: RADIUS.lg, paddingBottom: pressed ? 1 : 5, marginTop: pressed ? 4 : 0 }]}
    >
      <View style={[styles.qcard, { backgroundColor: hc ? theme.colors.surface : sw.bg, borderWidth: hc ? 2 : 0, borderColor: theme.colors.text }]}>
        <SymbolImage emoji={qa.emoji} size={theme.isTablet ? 58 : 48} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 10 }}>
          <View style={{ flex: 1 }}>
            <AppText variant="subheading" color={hc ? theme.colors.text : sw.text} numberOfLines={1}>
              {t(`quick.${id}.title`)}
            </AppText>
            <AppText variant="caption" color={hc ? theme.colors.textMuted : sw.text} style={{ opacity: hc ? 1 : 0.8 }} numberOfLines={2}>
              {t(`quick.${id}.sub`)}
            </AppText>
          </View>
          <View style={[styles.arrow, { backgroundColor: theme.mode === 'dark' && !hc ? 'rgba(255,255,255,0.2)' : '#FFFFFF' }]}>
            <Ionicons name="arrow-forward" size={18} color={hc ? '#000' : theme.mode === 'dark' ? '#FFFFFF' : sw.edge} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function FavouritesRow() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const items = useApp(useShallow((s) => (s.items[FAVOURITES_BOARD_ID] ?? []).filter((i) => !i.hidden)));
  const buttons = useApp((s) => s.buttons);
  const board = useApp((s) => s.boards.find((b) => b.id === FAVOURITES_BOARD_ID));
  const display = useApp((s) => s.settings.buttonDisplay);
  const activate = useActivateButton(board);
  const { activeIds } = useSpeechState();
  const w = theme.isTablet ? 130 : 104;

  return (
    <View>
      <SectionHeader title={t('home.favourites')} action={t('common.seeAll')} onAction={() => router.push('/library/favourites')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4, paddingRight: 8 }}>
        {items.map((it) => {
          const b = buttons[it.buttonId];
          if (!b) return null;
          return (
            <Tile
              key={it.id}
              label={L.buttonLabel(b)}
              symbol={b.symbol}
              photo={b.photo}
              type={b.type}
              width={w}
              display={display}
              hasAudio={!!b.audio}
              active={activeIds.includes(b.id)}
              onPress={() => activate(b)}
              a11yHint={t('board.tileHint')}
            />
          );
        })}
        <AddTile
          width={w}
          display={display}
          label={t('common.add')}
          a11yLabel={t('board.addA11y', { board: t('home.favourites') })}
          onPress={() => guarded(() => router.push({ pathname: '/button-editor', params: { boardId: FAVOURITES_BOARD_ID } }))}
        />
      </ScrollView>
      {items.length === 0 ? (
        <AppText variant="caption" muted style={{ marginTop: 6 }}>
          {t('home.favouritesEmpty')}
        </AppText>
      ) : null}
    </View>
  );
}

function RoutinesSection() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const routines = useApp((s) => s.routines);
  const allSteps = useApp((s) => s.steps);
  const list = useMemo(() => {
    const visible = routines.filter((r) => !r.hidden && r.kind === 'routine');
    const withProgress = visible.map((r) => {
      const steps = allSteps[r.id] ?? [];
      return { r, done: steps.filter((s) => s.done).length, total: steps.length };
    });
    const inProgress = withProgress.filter((x) => x.done > 0 && x.done < x.total);
    return [...inProgress, ...withProgress.filter((x) => !inProgress.includes(x))].slice(0, 2);
  }, [routines, allSteps]);

  if (!list.length) return null;
  return (
    <View>
      <SectionHeader title={t('home.routines')} action={t('common.seeAll')} onAction={() => router.push('/my-day/routines')} />
      <View style={{ gap: 12 }}>
        {list.map(({ r, done, total }) => {
          const sw = cardSwatch(r.color, theme.mode);
          const pct = total ? done / total : 0;
          return (
            <Pressable
              key={r.id}
              onPress={() => router.push({ pathname: '/routine/[id]', params: { id: r.id } })}
              accessibilityRole="button"
              accessibilityLabel={`${L.routineName(r)}. ${t('home.routineProgress', { done, total })}`}
              style={({ pressed }) => [
                styles.routine,
                { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : 'transparent', transform: [{ scale: pressed ? 0.985 : 1 }] },
                softShadow(theme, 1),
              ]}
            >
              <View style={[styles.routineArt, { backgroundColor: sw.bg }]}>
                <SymbolImage symbol={r.symbol} photo={r.photo} size={48} />
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <AppText variant="subheading" numberOfLines={1}>
                  {L.routineName(r)}
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.bar, { backgroundColor: theme.colors.bgAlt }]}>
                    <View style={[styles.barFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: theme.colors.success }]} />
                  </View>
                  <AppText variant="tiny" color={theme.colors.success}>
                    {done}/{total}
                  </AppText>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10, marginBottom: 18 },
  avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: 6 },
  today: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: RADIUS.xl, borderWidth: 2 },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  dot: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  qcard: { borderRadius: RADIUS.lg, padding: 16, minHeight: 150, justifyContent: 'space-between' },
  arrow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  routine: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: RADIUS.lg, borderWidth: 2 },
  routineArt: { width: 72, height: 72, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  bar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
});
