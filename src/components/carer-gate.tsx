import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from './app-text';
import { Mascot } from './mascot';
import { PushButton } from './push-button';
import { requireCarer, useLocked } from '@/store/lock-store';
import { useTheme } from '@/theme';

/** Shows its children only when the carer lock is off or unlocked. */
export function CarerGate({ children, showBack = true }: { children: ReactNode; showBack?: boolean }) {
  const locked = useLocked();
  if (!locked) return <>{children}</>;
  return <LockedScreen showBack={showBack} />;
}

function LockedScreen({ showBack }: { showBack: boolean }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 }}>
      <Mascot size={130} />
      <AppText variant="title" center accessibilityRole="header">
        {t('lock.lockedTitle')}
      </AppText>
      <AppText variant="body" muted center style={{ maxWidth: 380 }}>
        {t('lock.lockedBody')}
      </AppText>
      <PushButton title={t('lock.unlock')} icon="lock-open-outline" onPress={() => requireCarer()} style={{ alignSelf: 'center' }} />
      {showBack && router.canGoBack() ? (
        <PushButton title={t('common.back')} icon="arrow-back" variant="surface" size="md" onPress={() => router.back()} style={{ alignSelf: 'center' }} />
      ) : null}
    </View>
  );
}
