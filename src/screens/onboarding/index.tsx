import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Blobs, Confetti, FloatingSymbol } from '@/components/decor';
import { FieldLabel, OptionCard, TextField, ToggleRow } from '@/components/form';
import { InfoBanner } from '@/components/layout';
import { Mascot } from '@/components/mascot';
import { PushButton } from '@/components/push-button';
import { SymbolImage } from '@/components/symbol-image';
import { useSpeechState } from '@/hooks/use-speech';
import { successHaptic } from '@/services/haptics';
import { telemetryAvailable } from '@/services/telemetry';
import { useApp } from '@/store/app-store';
import { setupPin } from '@/store/lock-store';
import { RADIUS, softShadow, useTheme } from '@/theme';
import {
  DisplayPanel,
  LanguagePanel,
  QuickActionsPicker,
  SkinTonePicker,
  TapActionPanel,
  ThemePanel,
  VoicePanel,
} from '@/screens/settings/panels';

const STEPS = ['welcome', 'language', 'about', 'theme', 'display', 'voice', 'talk', 'shortcuts', 'lock', 'privacy', 'done'] as const;
type StepKey = (typeof STEPS)[number];

export function OnboardingScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const step = useApp((s) => Math.min(s.settings.onboardingStep, STEPS.length - 1));
  // Slide forwards or backwards depending on which way the step moved.
  const [shownStep, setShownStep] = useState(step);
  const [direction, setDirection] = useState<1 | -1>(1);
  if (step !== shownStep) {
    setShownStep(step);
    setDirection(step >= shownStep ? 1 : -1);
  }
  const key = STEPS[step];
  const update = useApp.getState().updateSettings;

  const go = (next: number) => {
    update({ onboardingStep: Math.max(0, Math.min(STEPS.length - 1, next)) });
  };

  const finish = () => {
    successHaptic();
    update({ onboardingDone: true, onboardingStep: 0 });
    setTimeout(() => router.replace('/'), 0);
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 0) {
        go(step - 1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const entering = theme.reducedMotion
    ? FadeIn.duration(180)
    : (direction === 1 ? FadeInRight : FadeInLeft).duration(320).withInitialValues({ transform: [{ translateX: 40 * direction }], opacity: 0 });

  const isWelcome = key === 'welcome';
  const isDone = key === 'done';
  const maxW = theme.isTablet ? 760 : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, overflow: 'hidden' }}>
      <Blobs />
      {isDone ? <Confetti /> : null}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8, maxWidth: maxW }]}>
          {step > 0 && !isDone ? (
            <Pressable onPress={() => go(step - 1)} accessibilityRole="button" accessibilityLabel={t('onboarding.back')} hitSlop={12} style={styles.topBtn}>
              <AppText variant="label" muted>
                ‹ {t('onboarding.back')}
              </AppText>
            </Pressable>
          ) : (
            <View style={styles.topBtn} />
          )}
          <View style={{ flex: 1, alignItems: 'center' }}>
            {!isWelcome ? <Progress step={step} total={STEPS.length} label={t('onboarding.progress', { n: step + 1, total: STEPS.length })} /> : null}
          </View>
          {!isDone ? (
            <Pressable
              onPress={() => go(STEPS.length - 1)}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.skip')}
              hitSlop={12}
              style={[styles.topBtn, { alignItems: 'flex-end' }]}
            >
              <AppText variant="label" muted>
                {t('onboarding.skip')}
              </AppText>
            </Pressable>
          ) : (
            <View style={styles.topBtn} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, width: '100%', maxWidth: maxW, alignSelf: 'center', flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View key={key} entering={entering} style={{ flexGrow: 1 }}>
            <StepBody step={key} />
          </Animated.View>
        </ScrollView>

        {/* bottom */}
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 16, maxWidth: maxW }]}>
          {isWelcome ? <Dots step={0} /> : null}
          {isWelcome ? (
            <PushButton title={t('onboarding.getStarted')} iconRight="arrow-forward" variant="ink" full onPress={() => go(1)} />
          ) : isDone ? (
            <PushButton title={t('onboarding.finish')} iconRight="arrow-forward" variant="ink" full onPress={finish} />
          ) : (
            <PushButton title={t('onboarding.next')} iconRight="arrow-forward" variant="primary" full onPress={() => go(step + 1)} />
          )}
          {isWelcome ? (
            <AppText variant="caption" muted center>
              {t('onboarding.welcome.free')}
            </AppText>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function StepBody({ step }: { step: StepKey }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { speaking } = useSpeechState();
  const userName = useApp((s) => s.settings.userName);
  const skinTone = useApp((s) => s.settings.skinTone);
  const consent = useApp((s) => s.settings.telemetryConsent);
  const pinOn = useApp((s) => !!s.settings.pinHash);
  const update = useApp.getState().updateSettings;

  switch (step) {
    case 'welcome':
      return (
        <View style={{ flexGrow: 1 }}>
          <AppText size={theme.isTablet ? 52 : 42} weight="black" style={{ marginTop: 12, lineHeight: (theme.isTablet ? 58 : 48) * theme.textScale }} accessibilityRole="header">
            {t('onboarding.welcome.title')}
          </AppText>
          <AppText variant="body" muted style={{ marginTop: 14, fontSize: 18 * theme.textScale, lineHeight: 26 * theme.textScale }}>
            {t('onboarding.welcome.body')}
          </AppText>
          <View style={styles.hero}>
            <FloatingSymbol emoji="💬" size={58} style={{ top: 10, left: '8%' }} delay={100} />
            <FloatingSymbol emoji="⭐" size={46} style={{ top: 0, right: '12%' }} delay={300} />
            <FloatingSymbol emoji="😊" size={52} style={{ bottom: 40, left: '4%' }} delay={500} />
            <FloatingSymbol emoji="🎵" size={42} style={{ bottom: 60, right: '6%' }} delay={700} />
            <FloatingSymbol emoji="🧸" size={40} style={{ top: 120, right: '2%' }} delay={900} />
            <Mascot size={theme.isTablet ? 240 : 190} />
          </View>
        </View>
      );

    case 'language':
      return (
        <Step
          title={t('onboarding.language.title')}
          body={t('onboarding.language.body')}
          art={<Illustration main="🌍" side={['👋', '💬']} />}
        >
          <LanguagePanel />
        </Step>
      );

    case 'about':
      return (
        <Step title={t('onboarding.about.title')} body={t('onboarding.about.body')} art={<Illustration main="👋" side={['🙂', '✨']} mascot />}>
          <TextField
            value={userName}
            onChangeText={(v) => update({ userName: v.slice(0, 40) })}
            placeholder={t('onboarding.about.placeholder')}
            accessibilityLabel={t('onboarding.about.placeholder')}
            autoCapitalize="words"
            returnKeyType="done"
            large
          />
          <FieldLabel>{t('onboarding.about.skinTone')}</FieldLabel>
          <SkinTonePicker value={skinTone} />
        </Step>
      );

    case 'theme':
      return (
        <Step title={t('onboarding.theme.title')} body={t('onboarding.theme.body')} art={<Illustration main="🎨" side={['🌈', '✨']} mascot />}>
          <ThemePanel />
        </Step>
      );

    case 'display':
      return (
        <Step title={t('onboarding.display.title')} body={t('onboarding.display.body')} art={<Illustration main="🧩" side={['🔤', '🖼️']} />}>
          <DisplayPanel compact />
        </Step>
      );

    case 'voice':
      return (
        <Step
          title={t('onboarding.voice.title')}
          body={t('onboarding.voice.body')}
          art={
            <View style={styles.art}>
              <FloatingSymbol emoji="🔊" size={44} style={{ top: 6, right: '20%' }} />
              <FloatingSymbol emoji="🎶" size={36} style={{ bottom: 6, left: '20%' }} delay={300} />
              <Mascot size={120} talking={speaking} />
            </View>
          }
        >
          <VoicePanel compact />
        </Step>
      );

    case 'talk':
      return (
        <Step title={t('onboarding.talk.title')} body={t('onboarding.talk.body')} art={<Illustration main="💬" side={['🧩', '🔊']} />}>
          <TapActionPanel />
        </Step>
      );

    case 'shortcuts':
      return (
        <Step title={t('onboarding.shortcuts.title')} body={t('onboarding.shortcuts.body')} art={<Illustration main="🏠" side={['⭐', '🗓️']} />}>
          <QuickActionsPicker />
        </Step>
      );

    case 'lock':
      return (
        <Step title={t('lock.obTitle')} body={t('lock.obBody')} art={<Illustration main="🔐" side={['👪', '✋']} mascot />}>
          <View style={{ gap: 10 }} accessibilityRole="radiogroup">
            <OptionCard title={t('lock.obNone')} sub={t('lock.obNoneSub')} emoji="🔓" selected={!pinOn} onPress={() => update({ pinHash: null })} />
            <OptionCard title={t('lock.obPin')} sub={t('lock.obPinSub')} emoji="🔐" selected={pinOn} onPress={() => setupPin()} />
          </View>
          {pinOn ? (
            <View style={{ marginTop: 14 }}>
              <InfoBanner icon="key-outline" text={t('lock.obSaved')} />
            </View>
          ) : null}
        </Step>
      );

    case 'privacy':
      return (
        <Step title={t('onboarding.privacy.title')} body={t('onboarding.privacy.body')} art={<Illustration main="🔒" side={['🛡️', '📱']} />}>
          <View style={{ gap: 10 }}>
            {(
              [
                ['📱', 'local'],
                ['🚫', 'account'],
                ['✈️', 'offline'],
                ['🖼️', 'media'],
              ] as const
            ).map(([emoji, k]) => (
              <View key={k} style={[styles.point, { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : 'transparent' }, softShadow(theme, 1)]}>
                <SymbolImage emoji={emoji} size={34} />
                <AppText variant="bodyStrong" style={{ flex: 1 }}>
                  {t(`onboarding.privacy.${k}`)}
                </AppText>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 16 }}>
            {telemetryAvailable() ? (
              <ToggleRow
                icon="stats-chart-outline"
                label={t('onboarding.privacy.telemetryTitle')}
                sub={t('onboarding.privacy.telemetryBody')}
                value={consent}
                onChange={(v) => update({ telemetryConsent: v })}
              />
            ) : (
              <InfoBanner icon="shield-checkmark-outline" text={t('onboarding.privacy.nothingSent')} />
            )}
          </View>
        </Step>
      );

    case 'done':
      return (
        <View style={{ alignItems: 'center', flexGrow: 1, justifyContent: 'center', paddingVertical: 24 }}>
          <View style={styles.hero}>
            <FloatingSymbol emoji="🎉" size={56} style={{ top: 10, left: '10%' }} />
            <FloatingSymbol emoji="⭐" size={44} style={{ top: 30, right: '12%' }} delay={250} />
            <FloatingSymbol emoji="💖" size={40} style={{ bottom: 50, right: '16%' }} delay={500} />
            <Mascot size={200} />
          </View>
          <AppText variant="display" center accessibilityRole="header">
            {t('onboarding.done.title')}
          </AppText>
          <AppText variant="body" muted center style={{ marginTop: 10, maxWidth: 420 }}>
            {t('onboarding.done.body')}
          </AppText>
        </View>
      );
  }
}

function Step({ title, body, art, children }: { title: string; body: string; art: ReactNode; children: ReactNode }) {
  return (
    <View>
      {art}
      <AppText variant="title" accessibilityRole="header" style={{ marginTop: 4 }}>
        {title}
      </AppText>
      <AppText variant="body" muted style={{ marginTop: 6, marginBottom: 18 }}>
        {body}
      </AppText>
      {children}
    </View>
  );
}

function Illustration({ main, side, mascot }: { main: string; side: [string, string]; mascot?: boolean }) {
  return (
    <View style={styles.art}>
      <FloatingSymbol emoji={side[0]} size={38} style={{ top: 8, left: '18%' }} delay={150} />
      <FloatingSymbol emoji={side[1]} size={34} style={{ bottom: 10, right: '18%' }} delay={450} />
      {mascot ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
          <Mascot size={108} />
          <FloatingSymbol emoji={main} size={64} style={{ position: 'relative' }} drift={6} />
        </View>
      ) : (
        <FloatingSymbol emoji={main} size={104} style={{ position: 'relative' }} drift={8} rotate={4} />
      )}
    </View>
  );
}

function Progress({ step, total, label }: { step: number; total: number; label: string }) {
  const theme = useTheme();
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 1, max: total, now: step + 1 }} style={{ flexDirection: 'row', gap: 5 }}>
      {Array.from({ length: total - 1 }, (_, i) => (
        <View
          key={i}
          style={{
            width: i + 1 === step ? 22 : 12,
            height: 6,
            borderRadius: 3,
            backgroundColor: i + 1 <= step ? theme.colors.primary : theme.colors.border,
          }}
        />
      ))}
    </View>
  );
}

function Dots({ step }: { step: number }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'center', marginBottom: 6 }} accessible={false}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: i === step ? theme.colors.ink : theme.colors.border }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8, width: '100%', alignSelf: 'center' },
  topBtn: { minWidth: 72, minHeight: 44, justifyContent: 'center' },
  hero: { height: 300, alignItems: 'center', justifyContent: 'center', marginTop: 12, width: '100%' },
  art: { height: 150, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  bottom: { paddingHorizontal: 24, gap: 12, paddingTop: 8, width: '100%', alignSelf: 'center' },
  point: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: RADIUS.lg, borderWidth: 2 },
});
