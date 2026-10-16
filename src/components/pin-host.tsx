/**
 * The carer PIN prompt, rendered once at the root. Opened by requireCarer()
 * (enter the PIN) or setupPin() (choose a new one). "Forgot PIN?" asks a quick
 * grown-up question and then lets the carer choose a new PIN, all offline.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './app-text';
import { IconButton } from './icon-button';
import { Mascot } from './mascot';
import { PinPad } from './pin-pad';
import { checkPin, grownUpQuestion, hashPin } from '@/services/pin';
import { successHaptic } from '@/services/haptics';
import { useApp } from '@/store/app-store';
import { finishPin, useLock } from '@/store/lock-store';
import { RADIUS, useTheme } from '@/theme';

type Stage = 'enter' | 'question' | 'new' | 'confirm';

export function PinHost() {
  const req = useLock((s) => s.request);
  if (!req) return null;
  // A fresh prompt for every request, so no state leaks between uses.
  return <PinPrompt key={req.id} initial={req.mode === 'set' ? 'new' : 'enter'} />;
}

function PinPrompt({ initial }: { initial: Stage }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [stage, setStage] = useState<Stage>(initial);
  const [error, setError] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [first, setFirst] = useState('');
  const [question, setQuestion] = useState(() => grownUpQuestion());

  const fail = (msg: string) => {
    setMessage(msg);
    setError((e) => e + 1);
  };

  const onEnter = async (pin: string) => {
    if (await checkPin(pin, useApp.getState().settings.pinHash)) {
      successHaptic();
      finishPin(true);
    } else fail(t('lock.wrong'));
  };

  const onAnswer = (value: string) => {
    if (Number(value) === question.answer) {
      setMessage(null);
      setStage('new');
    } else {
      setQuestion(grownUpQuestion());
      fail(t('lock.forgotWrong'));
    }
  };

  const onNew = (pin: string) => {
    setFirst(pin);
    setMessage(null);
    setStage('confirm');
  };

  const onConfirm = async (pin: string) => {
    if (pin !== first) {
      setFirst('');
      setStage('new');
      fail(t('lock.mismatch'));
      return;
    }
    useApp.getState().updateSettings({ pinHash: await hashPin(pin) });
    successHaptic();
    finishPin(true);
  };

  const title =
    stage === 'enter' ? t('lock.enterTitle') : stage === 'question' ? t('lock.forgotTitle') : stage === 'new' ? t('lock.newTitle') : t('lock.confirmTitle');
  const body =
    stage === 'enter'
      ? t('lock.enterBody')
      : stage === 'question'
        ? t('lock.forgotBody', { a: question.a, b: question.b })
        : stage === 'new'
          ? t('lock.newBody')
          : '';

  return (
    <Modal transparent visible animationType="none" onRequestClose={() => finishPin(false)} statusBarTranslucent navigationBarTranslucent>
      <Animated.View entering={FadeIn.duration(160)} style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <Animated.View
          entering={theme.reducedMotion ? FadeIn.duration(140) : SlideInDown.duration(280)}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.bg,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
              borderColor: theme.highContrast ? theme.colors.text : 'transparent',
              maxWidth: theme.isTablet ? 520 : undefined,
            },
          ]}
          accessibilityViewIsModal
        >
          <View style={styles.head}>
            <Mascot size={56} float={false} sparkle={false} />
            <View style={{ flex: 1 }}>
              <AppText variant="heading" accessibilityRole="header">
                {title}
              </AppText>
              {body ? (
                <AppText variant="caption" muted>
                  {body}
                </AppText>
              ) : null}
            </View>
            <IconButton icon="close" label={t('common.cancel')} onPress={() => finishPin(false)} size={42} />
          </View>

          <AppText variant="label" center color={theme.colors.danger} style={{ minHeight: 22, marginBottom: 6 }} accessibilityLiveRegion="assertive">
            {message ?? ''}
          </AppText>

          {stage === 'enter' ? (
            <PinPad key="enter" label={title} onComplete={onEnter} errorKey={error} />
          ) : stage === 'question' ? (
            <PinPad key="question" label={body} length={2} masked={false} onComplete={onAnswer} errorKey={error} />
          ) : stage === 'new' ? (
            <PinPad key="new" label={title} onComplete={onNew} errorKey={error} />
          ) : (
            <PinPad key="confirm" label={title} onComplete={onConfirm} errorKey={error} />
          )}

          {stage === 'enter' ? (
            <Pressable
              onPress={() => {
                setMessage(null);
                setQuestion(grownUpQuestion());
                setStage('question');
              }}
              accessibilityRole="button"
              hitSlop={10}
              style={{ alignSelf: 'center', marginTop: 18, padding: 6 }}
            >
              <AppText variant="label" color={theme.colors.primary}>
                {t('lock.forgot')}
              </AppText>
            </Pressable>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  card: { width: '100%', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: 20, borderWidth: 2, borderBottomWidth: 0 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
});
