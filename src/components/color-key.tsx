import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from './app-text';
import { InfoBanner } from './layout';
import { vocabLabel } from '@/i18n/labels';
import { COLOR_KEY, RADIUS, tileSwatch, useTheme, type WordType } from '@/theme';

const EXAMPLES: Record<WordType, string[]> = {
  people: ['i', 'you', 'mum'],
  action: ['want', 'go', 'eat'],
  describe: ['big', 'happy', 'more'],
  feeling: [],
  thing: ['ball', 'park', 'toilet'],
  place: [],
  body: [],
  social: ['hello', 'please', 'in'],
  question: ['what', 'where', 'why'],
  negation: ['no', 'not', 'stop'],
  urgent: [],
  time: ['now', 'later', 'here'],
  misc: ['and', 'all', 'some'],
};

/** Legend for the Modified Fitzgerald Key colours used on buttons. */
export function ColorKey() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ gap: 10 }}>
      {COLOR_KEY.map(({ types, sample }) => {
        const sw = tileSwatch(sample, theme.mode, { colorCoded: true, highContrast: false });
        const names = types.map((ty) => t(`buttonEditor.typeLabels.${ty}`)).join(' · ');
        const examples = EXAMPLES[sample].map(vocabLabel).join(', ');
        return (
          <View key={sample} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} accessible accessibilityLabel={`${names}: ${examples}`}>
            <View style={{ width: 52, height: 44, borderRadius: RADIUS.sm, backgroundColor: sw.bg, borderWidth: 2, borderColor: sw.edge, borderBottomWidth: 5 }} />
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">{names}</AppText>
              <AppText variant="caption" muted>
                {examples}
              </AppText>
            </View>
          </View>
        );
      })}
      <View style={{ marginTop: 6 }}>
        <InfoBanner text={t('settings.colorKeyNote')} />
      </View>
    </View>
  );
}
