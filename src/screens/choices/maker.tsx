import { router } from 'expo-router';
import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

import { AppText } from '@/components/app-text';
import { ButtonPicker } from '@/components/button-picker';
import { IconButton } from '@/components/icon-button';
import { InfoBanner, Screen } from '@/components/layout';
import { PushButton } from '@/components/push-button';
import { AddTile, Tile } from '@/components/tile';
import { stdBoardId } from '@/data/standard-content';
import { useLabels } from '@/i18n/labels';
import { useApp } from '@/store/app-store';
import { toast } from '@/store/ui-store';
import { useTheme } from '@/theme';

export function ChoiceMakerScreen() {
  const theme = useTheme();
  const L = useLabels();
  const { t } = L;
  const choiceSet = useApp((s) => s.settings.choiceSet);
  const buttons = useApp((s) => s.buttons);
  const [picker, setPicker] = useState(false);
  const [width, setWidth] = useState(0);
  const options = choiceSet.filter((id) => buttons[id]);
  const set = (ids: string[]) => useApp.getState().updateSettings({ choiceSet: ids.slice(0, 4) });
  const cols = theme.isTablet ? 4 : 2;
  const gap = 12;
  const tileW = width ? (width - gap * (cols - 1)) / cols : 0;

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('choices.makerTitle')}
      </AppText>
      <AppText muted style={{ marginTop: 4, marginBottom: 16 }}>
        {t('choices.makerSub')}
      </AppText>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }} onLayout={(e: LayoutChangeEvent) => setWidth(Math.floor(e.nativeEvent.layout.width))}>
        {tileW > 0 &&
          options.map((id) => {
            const b = buttons[id];
            return (
              <View key={id}>
                <Tile label={L.buttonLabel(b)} symbol={b.symbol} photo={b.photo} type={b.type} width={tileW} display="imageText" />
                <View style={{ position: 'absolute', top: -8, right: -8 }}>
                  <IconButton icon="close" label={`${t('common.remove')} ${L.buttonLabel(b)}`} size={34} variant="ink" onPress={() => set(options.filter((x) => x !== id))} />
                </View>
              </View>
            );
          })}
        {tileW > 0 && options.length < 4 ? (
          <AddTile width={tileW} display="imageText" label={t('choices.addOptions')} a11yLabel={t('choices.addOptions')} onPress={() => setPicker(true)} />
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        <PushButton
          title={t('choices.present')}
          icon="eye"
          onPress={() => {
            if (options.length < 2) return toast(t('choices.needTwo'), { tone: 'warning' });
            router.push('/choice');
          }}
        />
        <PushButton title={t('choices.clear')} icon="close" variant="surface" disabled={!options.length} onPress={() => set([])} />
      </View>
      <View style={{ marginTop: 16 }}>
        <InfoBanner text={t('choices.limit')} />
      </View>

      <ButtonPicker
        visible={picker}
        onClose={() => setPicker(false)}
        multiple
        max={4}
        initial={options}
        onDone={set}
        preferBoards={[stdBoardId('food'), stdBoardId('drinks'), stdBoardId('play'), stdBoardId('places')]}
      />
    </Screen>
  );
}
