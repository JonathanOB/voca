import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import { SymbolImage } from '@/components/symbol-image';
import { speakText, stopSpeaking, useSpeechState } from '@/hooks/use-speech';
import { useLabels } from '@/i18n/labels';
import { sentenceText, useSentence } from '@/store/sentence-store';
import { useTheme } from '@/theme';

/** Large-text display to show a message to a communication partner (also the fallback when speech fails). */
export function ShowScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useLabels();
  const params = useLocalSearchParams<{ text?: string }>();
  const items = useSentence((s) => s.items);
  const question = useSentence((s) => s.question);
  const text = (params.text ?? sentenceText(items, question)).trim();
  const fromSentence = !params.text && items.length > 0;
  const { speaking } = useSpeechState();
  const len = text.length;
  const size = (theme.isTablet ? 1.4 : 1) * (len < 20 ? 56 : len < 60 ? 44 : len < 140 ? 34 : 26);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }}>
      <View style={styles.top}>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} size={48} />
        <AppText variant="caption" muted style={{ flex: 1, textAlign: 'center' }}>
          {t('show.hint')}
        </AppText>
        <IconButton icon={speaking ? 'stop' : 'volume-high'} label={speaking ? t('common.stop') : t('common.speak')} variant="primary" size={48} onPress={() => (speaking ? stopSpeaking() : speakText(text))} disabled={!text} />
      </View>
      <View style={styles.body} accessible accessibilityRole="text" accessibilityLabel={text || t('show.empty')}>
        {fromSentence && items.some((i) => i.symbol || i.photo) ? (
          <View style={styles.symbols}>
            {items.map((i) => (i.symbol || i.photo ? <SymbolImage key={i.key} symbol={i.symbol} photo={i.photo} size={theme.isTablet ? 96 : 64} /> : null))}
          </View>
        ) : null}
        <AppText size={size} weight="black" center maxFontSizeMultiplier={1.3}>
          {text || t('show.empty')}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  symbols: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
});
