/**
 * "Always there" words: a short row of essential words on every communication
 * board, so saying no, stop, yes or asking for help never depends on finding
 * the right page. Grounded in the Communication Bill of Rights (the right to
 * refuse, request and get attention; Brady et al., 2016) and in early core
 * vocabulary research (Banajee et al., 2003).
 */
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';

import { AppText } from './app-text';
import { SymbolImage } from './symbol-image';
import type { Board, Button } from '@/db/types';
import { useActivateButton, useSpeechState } from '@/hooks/use-speech';
import { useTouchSelect } from '@/hooks/use-touch-select';
import { useLabels } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { tileSwatch, useTheme, withAlpha } from '@/theme';

export function QuickWordsBar({ board }: { board?: Pick<Board, 'tapAction'> | null }) {
  const L = useLabels();
  const ids = useApp(useShallow((s) => s.settings.quickWords));
  const buttons = useApp((s) => s.buttons);
  const activate = useActivateButton(board);
  const { activeIds } = useSpeechState();
  const list = ids.map((id) => buttons[id]).filter(Boolean);
  if (!list.length) return null;

  return (
    <View style={styles.row} accessibilityRole="toolbar" accessibilityLabel={L.t('quickWords.title')}>
      {list.map((b) => (
        <QuickWord key={b.id} button={b} label={L.buttonLabel(b)} active={activeIds.includes(b.id)} onActivate={() => activate(b)} />
      ))}
    </View>
  );
}

function QuickWord({ button, label, active, onActivate }: { button: Button; label: string; active: boolean; onActivate: () => void }) {
  const theme = useTheme();
  const sw = tileSwatch(button.type, theme.mode, { colorCoded: theme.colorCoded, highContrast: theme.highContrast });
  const touch = useTouchSelect({ onActivate });
  const fillStyle = useAnimatedStyle(() => ({ height: `${touch.progress.get() * 100}%` }));
  return (
    <Pressable
      {...touch.pressableProps}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: sw.bg,
          borderColor: active ? theme.colors.focus : sw.edge,
          borderBottomWidth: pressed ? 2 : 4,
          transform: [{ translateY: pressed ? 2 : 0 }],
        },
      ]}
    >
      {touch.holdMs > 0 ? <Animated.View pointerEvents="none" style={[styles.fill, { backgroundColor: withAlpha(sw.edge, 0.45) }, fillStyle]} /> : null}
      <SymbolImage symbol={button.symbol} photo={button.photo} size={theme.isTablet ? 34 : 26} />
      <AppText size={theme.isTablet ? 15 : 12.5} weight="heavy" color={sw.text} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} maxFontSizeMultiplier={1.3}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  item: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 2,
    paddingVertical: 4,
    gap: 2,
    overflow: 'hidden',
  },
  fill: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
