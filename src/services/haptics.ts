import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let enabled = true;

export function setHapticsEnabled(v: boolean) {
  enabled = v;
}

/** Light tap used when a communication button is activated. Never the only feedback. */
export function tapHaptic() {
  if (!enabled || Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function selectionHaptic() {
  if (!enabled || Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

export function successHaptic() {
  if (!enabled || Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function warningHaptic() {
  if (!enabled || Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
