import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavThemeProvider, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DialogHost } from '@/components/dialog';
import { PinHost } from '@/components/pin-host';
import { ToastHost } from '@/components/toast-host';
import { BootError } from '@/screens/boot-error';
import { useReminderSync } from '@/hooks/use-reminder-sync';
import { initI18n, setLanguage } from '@/i18n';
import { initNotifications, onReminderOpened } from '@/services/reminders';
import { configureAudioSession } from '@/services/speech';
import { maybeSendDaily } from '@/services/telemetry';
import { useApp } from '@/store/app-store';
import { useSentence } from '@/store/sentence-store';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
initI18n('en');
initNotifications();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Fredoka_700Bold,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
  });
  const ready = useApp((s) => s.ready);
  const bootError = useApp((s) => s.bootError);
  const settings = useApp((s) => s.settings);

  useEffect(() => {
    configureAudioSession();
    useApp
      .getState()
      .bootstrap()
      .then(() => useSentence.getState().hydrate());
  }, []);

  useEffect(() => {
    if (ready) setLanguage(settings.language);
  }, [ready, settings.language]);

  useReminderSync();

  // Tapping a schedule reminder opens My Day.
  useEffect(() => {
    if (!ready || !settings.onboardingDone) return;
    return onReminderOpened((url) => router.push(url as never));
  }, [ready, settings.onboardingDone]);

  const fontsDone = fontsLoaded || !!fontError;
  useEffect(() => {
    if ((fontsDone && ready) || bootError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsDone, ready, bootError]);

  // Optional telemetry: only when configured and consented; at most once a day; never queued.
  useEffect(() => {
    if (!ready || !settings.onboardingDone) return;
    maybeSendDaily(settings.telemetryConsent, settings.telemetryLastSent).then((day) => {
      if (day) useApp.getState().updateSettings({ telemetryLastSent: day });
    });
  }, [ready, settings.onboardingDone, settings.telemetryConsent, settings.telemetryLastSent]);

  if (bootError) {
    return (
      <ThemeProvider settings={settings}>
        <BootError message={bootError} />
      </ThemeProvider>
    );
  }
  if (!fontsDone || !ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider settings={settings}>
        <NavigationTheme>
          <RootStack onboardingDone={settings.onboardingDone} />
          <DialogHost />
          <PinHost />
          <ToastHost />
        </NavigationTheme>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootStack({ onboardingDone }: { onboardingDone: boolean }) {
  const theme = useTheme();
  const animation = theme.reducedMotion ? 'fade' : 'default';
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg },
        animation,
      }}
    >
      <Stack.Protected guard={!onboardingDone}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      </Stack.Protected>
      <Stack.Protected guard={onboardingDone}>
        <Stack.Screen name="(drawer)" options={{ animation: 'fade' }} />
        <Stack.Screen name="board/[id]" />
        <Stack.Screen name="routine/[id]" />
        <Stack.Screen name="button-editor" options={{ presentation: 'modal' }} />
        <Stack.Screen name="board-editor" options={{ presentation: 'modal' }} />
        <Stack.Screen name="routine-editor" options={{ presentation: 'modal' }} />
        <Stack.Screen name="quick-actions" options={{ presentation: 'modal' }} />
        <Stack.Screen name="phrase-builder" options={{ presentation: 'modal' }} />
        <Stack.Screen name="touch-check" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        <Stack.Screen name="board-info" options={{ presentation: 'modal' }} />
        <Stack.Screen name="safety" options={{ presentation: 'fullScreenModal', animation: theme.reducedMotion ? 'fade' : 'slide_from_bottom' }} />
        <Stack.Screen name="show" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        <Stack.Screen name="choice" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}

function NavigationTheme({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const navTheme = useMemo(() => {
    const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.colors.bg,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        primary: theme.colors.primary,
      },
    };
  }, [theme]);
  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </NavThemeProvider>
  );
}

