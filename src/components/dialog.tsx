/**
 * Promise-based confirm dialog, rendered once at the root:
 *   const ok = await confirm({ title, body, confirmLabel, destructive: true });
 */
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { create } from 'zustand';

import { AppText } from './app-text';
import { PushButton } from './push-button';
import { i18n } from '@/i18n';
import { RADIUS, softShadow, useTheme } from '@/theme';

interface DialogRequest {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** User must type this word before confirming (for irreversible actions). */
  requireText?: string;
  /** Hide the cancel button (information dialogs). */
  alert?: boolean;
  resolve: (ok: boolean) => void;
}

const useDialog = create<{ current: DialogRequest | null; set: (d: DialogRequest | null) => void }>((set) => ({
  current: null,
  set: (current) => set({ current }),
}));

export function confirm(opts: Omit<DialogRequest, 'resolve'>): Promise<boolean> {
  return new Promise((resolve) => {
    const prev = useDialog.getState().current;
    prev?.resolve(false);
    useDialog.getState().set({ ...opts, resolve });
  });
}

export function alertDialog(title: string, body?: string) {
  return confirm({ title, body, alert: true, confirmLabel: i18n.t('common.ok') });
}

export function DialogHost() {
  const theme = useTheme();
  const req = useDialog((s) => s.current);
  const setReq = useDialog((s) => s.set);
  const [typed, setTyped] = useState('');

  if (!req) return null;
  const close = (ok: boolean) => {
    req.resolve(ok);
    setReq(null);
    setTyped('');
  };
  const norm = (s: string) => s.trim().normalize('NFC').toUpperCase();
  const canConfirm = !req.requireText || norm(typed) === norm(req.requireText);

  return (
    <Modal transparent visible animationType="none" onRequestClose={() => close(false)} statusBarTranslucent navigationBarTranslucent>
      <Animated.View entering={FadeIn.duration(160)} style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => !req.alert && close(false)} accessibilityLabel={i18n.t('common.cancel')} />
        <Animated.View
          entering={theme.reducedMotion ? FadeIn.duration(120) : ZoomIn.duration(220).withInitialValues({ transform: [{ scale: 0.94 }] })}
          style={[styles.card, { backgroundColor: theme.colors.surface }, softShadow(theme, 3)]}
          accessibilityViewIsModal
          accessibilityRole="alert"
        >
          <AppText variant="heading" center>
            {req.title}
          </AppText>
          {req.body ? (
            <AppText variant="body" muted center style={{ marginTop: 8 }}>
              {req.body}
            </AppText>
          ) : null}
          {req.requireText ? (
            <TextInput
              value={typed}
              onChangeText={setTyped}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder={req.requireText}
              placeholderTextColor={theme.colors.textSoft}
              accessibilityLabel={req.body}
              style={[
                styles.input,
                { borderColor: theme.colors.border, color: theme.colors.text, fontFamily: theme.fonts.bold, backgroundColor: theme.colors.surfaceAlt },
              ]}
            />
          ) : null}
          <View style={styles.actions}>
            {!req.alert ? (
              <PushButton
                title={req.cancelLabel ?? i18n.t('common.cancel')}
                variant="surface"
                size="md"
                onPress={() => close(false)}
                style={{ flex: 1 }}
                full
              />
            ) : null}
            <PushButton
              title={req.confirmLabel ?? i18n.t('common.confirm')}
              variant={req.destructive ? 'danger' : 'primary'}
              size="md"
              disabled={!canConfirm}
              onPress={() => close(true)}
              style={{ flex: 1 }}
              full
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, borderRadius: RADIUS.xl, padding: 24 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 22 },
  input: { marginTop: 16, borderWidth: 2, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 12, fontSize: 18, textAlign: 'center' },
});
