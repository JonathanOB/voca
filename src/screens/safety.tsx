import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import { InfoBanner } from '@/components/layout';
import { SymbolImage } from '@/components/symbol-image';
import { SAFETY_BOARD_ID } from '@/data/standard-content';
import { stopSpeaking } from '@/hooks/use-speech';
import { useLabels } from '@/i18n/labels';
import { BoardView } from '@/screens/board/board-view';
import { useTheme } from '@/theme';

/** Safety & urgent communication: reachable from every screen in one tap. Speaks immediately. */
export function SafetyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useLabels();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: theme.colors.dangerSoft }]}>
        <SymbolImage emoji="🆘" size={44} />
        <View style={{ flex: 1 }}>
          <AppText variant="title" accessibilityRole="header">
            {t('safety.title')}
          </AppText>
          <AppText variant="caption" muted>
            {t('safety.subtitle')}
          </AppText>
        </View>
        <IconButton
          icon="close"
          label={t('common.close')}
          size={50}
          onPress={() => {
            stopSpeaking();
            router.back();
          }}
        />
      </View>
      <BoardView
        boardId={SAFETY_BOARD_ID}
        hideTitle
        noSentence
        footer={
          <View style={{ marginTop: 20 }}>
            <InfoBanner tone="warning" icon="call-outline" text={t('safety.notice')} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
});
