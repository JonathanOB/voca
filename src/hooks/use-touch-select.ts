/**
 * Touch help for tremor, repeated taps and accidental touches (Settings → Touch):
 *  - ignore repeated taps: after a button is chosen, further taps are ignored for a while;
 *  - hold to select: a finger must stay on the button until it fills, then lift;
 *  - allow small slips: a press still counts if the finger drifts a little.
 * Comparable to the "hold duration" and "repeated taps" settings in established AAC apps.
 */
import { useRef } from 'react';
import { AccessibilityInfo, type GestureResponderEvent } from 'react-native';
import { Easing, cancelAnimation, useSharedValue, withTiming } from 'react-native-reanimated';

import { selectionHaptic } from '@/services/haptics';
import { isRepeatTap, longPressDelay } from '@/services/touch-rules';
import { useApp } from '@/store/app-store';

export interface TouchPoint {
  x: number;
  y: number;
}

/** Shared across every button, so a shaky double tap on a neighbouring button is ignored too. */
let lastActivation = 0;

// Screen readers activate with a double tap, so hold-to-select must not apply to them.
let screenReader = false;
AccessibilityInfo.isScreenReaderEnabled()
  .then((v) => {
    screenReader = v;
  })
  .catch(() => {});
AccessibilityInfo.addEventListener('screenReaderChanged', (v) => {
  screenReader = v;
});

export function useTouchSelect({ onActivate, onLongPress }: { onActivate?: () => void; onLongPress?: (p: TouchPoint) => void }) {
  const ignoreMs = useApp((s) => s.settings.ignoreRepeatMs);
  const holdMs = useApp((s) => s.settings.holdMs);
  const slips = useApp((s) => s.settings.allowSlips);
  const progress = useSharedValue(0);
  const startedAt = useRef(0);
  const filled = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activate = () => {
    const now = Date.now();
    if (isRepeatTap(now, lastActivation, ignoreMs)) return;
    lastActivation = now;
    onActivate?.();
  };

  const onPressIn = () => {
    startedAt.current = Date.now();
    if (holdMs > 0) {
      progress.set(withTiming(1, { duration: holdMs, easing: Easing.linear }));
      filled.current = setTimeout(selectionHaptic, holdMs);
    }
  };

  const onPressOut = () => {
    if (filled.current) clearTimeout(filled.current);
    filled.current = null;
    if (holdMs > 0) {
      cancelAnimation(progress);
      progress.set(withTiming(0, { duration: 140 }));
    }
  };

  const onPress = () => {
    // With hold-to-select, a quick touch does nothing.
    if (holdMs > 0 && !screenReader && Date.now() - startedAt.current < holdMs) return;
    activate();
  };

  return {
    progress,
    holdMs,
    pressableProps: {
      onPressIn,
      onPressOut,
      onPress: onActivate ? onPress : undefined,
      onLongPress: onLongPress ? (e: GestureResponderEvent) => onLongPress({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY }) : undefined,
      delayLongPress: longPressDelay(holdMs),
      pressRetentionOffset: slips ? 48 : 16,
      hitSlop: slips ? 6 : undefined,
    },
  };
}
