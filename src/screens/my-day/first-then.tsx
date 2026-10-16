import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { ButtonPicker } from '@/components/button-picker';
import { InfoBanner } from '@/components/layout';
import { PushButton } from '@/components/push-button';
import { SymbolImage } from '@/components/symbol-image';
import { stdBoardId } from '@/data/standard-content';
import type { Button } from '@/db/types';
import { speakItems } from '@/hooks/use-speech';
import { useLabels } from '@/i18n/labels';
import { BoardView } from '@/screens/board/board-view';
import { successHaptic } from '@/services/haptics';
import { useApp } from '@/store/app-store';
import { RADIUS, softShadow, useTheme } from '@/theme';

export function FirstThenScreen() {
  return <BoardView boardId={stdBoardId('firstthen')} noSentence header={<FirstThenTool />} />;
}

function FirstThenTool() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const ft = useApp((s) => s.settings.firstThen);
  const buttons = useApp((s) => s.buttons);
  const [picking, setPicking] = useState<'first' | 'then' | null>(null);
  const first = ft.first ? buttons[ft.first] : undefined;
  const then = ft.then ? buttons[ft.then] : undefined;
  const update = (patch: Partial<typeof ft>) => useApp.getState().updateSettings({ firstThen: { ...ft, ...patch } });
  const stacked = theme.width < 420;

  const say = () => {
    const a = first ? L.buttonLabel(first) : '…';
    const b = then ? L.buttonLabel(then) : '…';
    speakItems([{ id: 'firstthen', text: t('firstThen.sentence', { first: a, then: b }) }]);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={[styles.slots, { flexDirection: stacked ? 'column' : 'row' }]}>
        <Slot
          title={t('firstThen.first')}
          emoji="1️⃣"
          button={first}
          done={ft.firstDone}
          highlight={!ft.firstDone}
          onPress={() => setPicking('first')}
          onSpeak={first ? () => speakItems([{ id: first.id, text: L.buttonSpoken(first), lang: first.lang, audio: first.audio }]) : undefined}
        />
        <View style={styles.arrow} accessible={false}>
          <Ionicons name={stacked ? 'arrow-down' : 'arrow-forward'} size={34} color={theme.colors.primary} />
        </View>
        <Slot
          title={t('firstThen.then')}
          emoji="2️⃣"
          button={then}
          highlight={ft.firstDone}
          onPress={() => setPicking('then')}
          onSpeak={then ? () => speakItems([{ id: then.id, text: L.buttonSpoken(then), lang: then.lang, audio: then.audio }]) : undefined}
        />
      </View>

      {ft.firstDone ? (
        <Animated.View entering={FadeIn} style={{ marginTop: 14 }}>
          <InfoBanner icon="checkmark-circle" text={t('firstThen.firstDoneBanner')} />
        </Animated.View>
      ) : null}

      <View style={styles.actions}>
        <PushButton title={t('firstThen.speak')} icon="volume-high" onPress={say} size="md" />
        {!ft.firstDone ? (
          <PushButton
            title={t('firstThen.markFirstDone')}
            icon="checkmark"
            variant="success"
            size="md"
            disabled={!first}
            onPress={() => {
              successHaptic();
              update({ firstDone: true });
            }}
          />
        ) : (
          <PushButton title={t('firstThen.reset')} icon="refresh" variant="soft" size="md" onPress={() => update({ firstDone: false })} />
        )}
        <PushButton title={t('firstThen.swap')} icon="swap-horizontal" variant="surface" size="md" onPress={() => update({ first: ft.then, then: ft.first, firstDone: false })} />
      </View>

      <AppText variant="heading" style={{ marginTop: 28 }} accessibilityRole="header">
        {t('firstThen.wordsTitle')}
      </AppText>

      <ButtonPicker
        visible={!!picking}
        onClose={() => setPicking(null)}
        title={picking === 'first' ? t('firstThen.pickFirst') : t('firstThen.pickThen')}
        preferBoards={[stdBoardId('schedule'), stdBoardId('play'), stdBoardId('food')]}
        onDone={([id]) => {
          if (!id) return;
          if (picking === 'first') update({ first: id, firstDone: false });
          else update({ then: id });
        }}
      />
    </View>
  );
}

function Slot({
  title,
  emoji,
  button,
  done,
  highlight,
  onPress,
  onSpeak,
}: {
  title: string;
  emoji: string;
  button?: Button;
  done?: boolean;
  highlight?: boolean;
  onPress: () => void;
  onSpeak?: () => void;
}) {
  const theme = useTheme();
  const L = useLabels();
  const glow = useSharedValue(0);
  useEffect(() => {
    if (highlight && !theme.reducedMotion) {
      glow.set(withRepeat(withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1400 })), -1));
    } else glow.set(withTiming(0, { duration: 200 }));
  }, [highlight, theme.reducedMotion, glow]);
  const glowStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + glow.get() * 0.015 }] }));
  const label = button ? L.buttonLabel(button) : L.t('firstThen.emptySlot');

  return (
    <Animated.View style={[{ flex: 1 }, glowStyle]}>
      <View style={styles.slotHead}>
        <SymbolImage emoji={emoji} size={30} />
        <AppText variant="heading">{title}</AppText>
      </View>
      <Pressable
        onPress={onSpeak ?? onPress}
        onLongPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${label}${done ? `, ${L.t('schedule.done')}` : ''}`}
        accessibilityHint={L.t('firstThen.choose')}
        style={[
          styles.slot,
          {
            backgroundColor: done ? theme.colors.successSoft : theme.colors.surface,
            borderColor: highlight ? theme.colors.primary : theme.highContrast ? theme.colors.text : theme.colors.border,
            borderStyle: button ? 'solid' : 'dashed',
          },
          softShadow(theme, highlight ? 2 : 1),
        ]}
      >
        {button ? <SymbolImage symbol={button.symbol} photo={button.photo} size={theme.isTablet ? 150 : 104} /> : <Ionicons name="add-circle" size={56} color={theme.colors.primary} />}
        <AppText variant="heading" center numberOfLines={2}>
          {label}
        </AppText>
        {done ? (
          <View style={[styles.doneBadge, { backgroundColor: theme.colors.success }]}>
            <Ionicons name="checkmark" size={28} color="#FFFFFF" />
          </View>
        ) : null}
      </Pressable>
      <PushButton title={L.t('firstThen.choose')} icon="swap-vertical" variant="surface" size="sm" onPress={onPress} style={{ alignSelf: 'center', marginTop: 10 }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slots: { gap: 12, alignItems: 'stretch' },
  arrow: { alignItems: 'center', justifyContent: 'center' },
  slotHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, justifyContent: 'center' },
  slot: { borderRadius: RADIUS.xl, borderWidth: 3, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 10, minHeight: 210 },
  doneBadge: { position: 'absolute', top: 10, right: 10, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18, justifyContent: 'center' },
});
