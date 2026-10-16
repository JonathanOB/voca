/**
 * A wrapping row of word chips that can be reordered by dragging (hold, then
 * move) and by accessibility actions (move left / right, remove).
 */
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type LayoutRectangle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AppText } from './app-text';
import { SymbolImage } from './symbol-image';
import { selectionHaptic } from '@/services/haptics';
import { nearestIndex } from '@/services/touch-rules';
import { useTheme } from '@/theme';

export interface WordChip {
  key: string;
  text: string;
  symbol: string | null;
  photo: string | null;
  buttonId: string | null;
}

export function DragChips({
  chips,
  selected,
  onSelect,
  onMove,
  onRemove,
}: {
  chips: WordChip[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  onMove: (from: number, to: number) => void;
  onRemove: (key: string) => void;
}) {
  const container = useRef<View>(null);
  const origin = useRef({ x: 0, y: 0 });
  const layouts = useRef<Record<string, LayoutRectangle>>({});

  const measure = () => container.current?.measureInWindow((x, y) => (origin.current = { x, y }));

  const drop = (from: number, absX: number, absY: number) => {
    const to = nearestIndex(
      chips.map((c) => layouts.current[c.key]),
      absX - origin.current.x,
      absY - origin.current.y,
    );
    if (to >= 0 && to !== from) onMove(from, to);
  };

  return (
    <View ref={container} onLayout={measure} style={styles.wrap}>
      {chips.map((c, i) => (
        <DragChip
          key={c.key}
          chip={c}
          index={i}
          total={chips.length}
          selected={selected === c.key}
          onLayout={(l) => (layouts.current[c.key] = l)}
          onDragStart={measure}
          onDrop={(x, y) => drop(i, x, y)}
          onPress={() => onSelect(selected === c.key ? null : c.key)}
          onMove={(d) => onMove(i, i + d)}
          onRemove={() => onRemove(c.key)}
        />
      ))}
    </View>
  );
}

function DragChip({
  chip,
  index,
  total,
  selected,
  onLayout,
  onDragStart,
  onDrop,
  onPress,
  onMove,
  onRemove,
}: {
  chip: WordChip;
  index: number;
  total: number;
  selected: boolean;
  onLayout: (l: LayoutRectangle) => void;
  onDragStart: () => void;
  onDrop: (absX: number, absY: number) => void;
  onPress: () => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lift = useSharedValue(0);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .activateAfterLongPress(180)
    .onStart(() => {
      onDragStart();
      selectionHaptic();
      lift.set(withTiming(1, { duration: 120 }));
    })
    .onUpdate((e) => {
      tx.set(e.translationX);
      ty.set(e.translationY);
    })
    .onEnd((e) => onDrop(e.absoluteX, e.absoluteY))
    .onFinalize(() => {
      tx.set(0);
      ty.set(0);
      lift.set(withTiming(0, { duration: 120 }));
    });
  const tap = Gesture.Tap().runOnJS(true).onEnd(onPress);
  const gesture = Gesture.Exclusive(pan, tap);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.get() }, { translateY: ty.get() }, { scale: 1 + lift.get() * 0.08 }],
    elevation: lift.get() > 0 ? 8 : 0,
    opacity: 1 - lift.get() * 0.1,
  }));
  // The lifted chip draws above its neighbours.
  const raise = useAnimatedStyle(() => ({ zIndex: lift.get() > 0 ? 10 : 0 }));

  return (
    // The outer view holds the chip's place in the row; the inner one follows the finger.
    // Chips snap to their new place: a layout transition here left chips overlapping after a drop.
    <Animated.View onLayout={(e) => onLayout(e.nativeEvent.layout)} style={raise}>
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.chip,
          {
            backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
            borderColor: selected ? theme.colors.primary : theme.highContrast ? theme.colors.text : theme.colors.border,
          },
          style,
        ]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={t('phrases.chipA11y', { index: index + 1, total, label: chip.text })}
        accessibilityState={{ selected }}
        accessibilityActions={[
          { name: 'activate' },
          { name: 'moveLeft', label: t('common.moveLeft') },
          { name: 'moveRight', label: t('common.moveRight') },
          { name: 'remove', label: t('phrases.removeWord') },
        ]}
        onAccessibilityAction={(e) => {
          const a = e.nativeEvent.actionName;
          if (a === 'activate') onPress();
          else if (a === 'moveLeft') onMove(-1);
          else if (a === 'moveRight') onMove(1);
          else if (a === 'remove') onRemove();
        }}
      >
        {chip.symbol || chip.photo ? <SymbolImage symbol={chip.symbol} photo={chip.photo} size={26} rounded={6} /> : null}
        <AppText size={18} weight="heavy" maxFontSizeMultiplier={1.5}>
          {chip.text}
        </AppText>
      </Animated.View>
    </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 2, minHeight: 48 },
});
