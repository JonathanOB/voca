import { Text, View } from 'react-native';

import { PushButton } from '@/components/push-button';
import { useApp } from '@/store/app-store';
import { useTheme } from '@/theme';

/** Shown if the local database can't be opened. Uses system fonts in case custom fonts failed too. */
export function BootError({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.text, textAlign: 'center' }}>Voca couldn’t start</Text>
      <Text style={{ fontSize: 16, color: theme.colors.textMuted, textAlign: 'center' }}>
        Something went wrong opening your library on this device. Your data has not been deleted.
      </Text>
      <Text selectable style={{ fontSize: 12, color: theme.colors.textSoft, textAlign: 'center' }}>
        {message}
      </Text>
      <PushButton title="Try again" onPress={() => useApp.getState().bootstrap()} />
    </View>
  );
}
