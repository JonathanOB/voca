import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import { PushButton } from '@/components/push-button';
import { SymbolImage } from '@/components/symbol-image';
import { Tile } from '@/components/tile';
import { speakButton, speakText } from '@/hooks/use-speech';
import { useLabels } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { successHaptic } from '@/services/haptics';
import { RADIUS, useTheme } from '@/theme';

/** Full-screen choice. "None of these" and "Something else" are always available. */
export function ChoicePresenter() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const L = useLabels();
  const { t } = L;
  const buttons = useApp((s) => s.buttons);
  const options = useApp((s) => s.settings.choiceSet).filter((id) => buttons[id]);
  const [chosen, setChosen] = useState<string | null>(null);
  const cols = options.length <= 2 ? 2 : theme.isTablet ? options.length : 2;
  const avail = Math.min(theme.width, 900) - 48;
  const tileW = Math.min(theme.isTablet ? 260 : 200, (avail - 16 * (cols - 1)) / cols);

  const pick = (id: string) => {
    setChosen(id);
    successHaptic();
    speakButton(buttons[id]);
  };

  const chosenBtn = chosen && chosen !== 'none' && chosen !== 'else' ? buttons[chosen] : undefined;
  const chosenLabel = chosenBtn ? L.buttonLabel(chosenBtn) : chosen === 'none' ? t('choices.noneOfThese') : chosen === 'else' ? t('choices.somethingElse') : '';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}>
      <View style={styles.top}>
        <IconButton icon="close" label={t('common.close')} onPress={() => router.back()} size={48} />
      </View>
      {chosen ? (
        <Animated.View entering={theme.reducedMotion ? FadeIn : ZoomIn.duration(240).withInitialValues({ transform: [{ scale: 0.92 }] })} style={styles.center}>
          {chosenBtn ? <SymbolImage symbol={chosenBtn.symbol} photo={chosenBtn.photo} size={Math.min(260, theme.width * 0.6)} /> : <SymbolImage emoji={chosen === 'none' ? '🙅' : '💭'} size={180} />}
          <AppText size={40} weight="black" center>
            {chosenLabel}
          </AppText>
          <AppText variant="body" muted center>
            {t('choices.chosen', { label: chosenLabel })}
          </AppText>
          <PushButton title={t('choices.chooseAgain')} icon="refresh" onPress={() => setChosen(null)} style={{ marginTop: 20 }} />
        </Animated.View>
      ) : (
        <View style={styles.center}>
          <AppText variant="display" center accessibilityRole="header" style={{ marginBottom: 20 }}>
            {t('choices.presentTitle')}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 900 }}>
            {options.map((id) => {
              const b = buttons[id];
              return <Tile key={id} label={L.buttonLabel(b)} symbol={b.symbol} photo={b.photo} type={b.type} width={tileW} display="imageText" onPress={() => pick(id)} />;
            })}
          </View>
          <View style={styles.escape}>
            <PushButton
              title={t('choices.noneOfThese')}
              variant="surface"
              icon="close-circle-outline"
              onPress={() => {
                setChosen('none');
                speakText(t('choices.noneOfThese'));
              }}
            />
            <PushButton
              title={t('choices.somethingElse')}
              variant="surface"
              icon="chatbubble-ellipses-outline"
              onPress={() => {
                setChosen('else');
                speakText(t('choices.somethingElse'));
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', paddingHorizontal: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 10 },
  escape: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 28, padding: 12, borderRadius: RADIUS.xl },
});
