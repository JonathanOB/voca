import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SectionTabBar } from '@/components/section-tab-bar';
import { SECTION_TAB_OPTIONS, tab } from '@/navigation/tab-options';

export default function AboutLayout() {
  const { t } = useTranslation();
  return (
    <Tabs tabBar={(p) => <SectionTabBar {...p} />} screenOptions={SECTION_TAB_OPTIONS}>
      <Tabs.Screen name="index" options={tab(t('tabs.about'), 'ℹ️')} />
      <Tabs.Screen name="guide" options={tab(t('tabs.guide'), '🌱')} />
      <Tabs.Screen name="privacy" options={tab(t('tabs.privacy'), '🔒')} />
      <Tabs.Screen name="legal" options={tab(t('tabs.legal'), '📜')} />
      <Tabs.Screen name="credits" options={tab(t('tabs.credits'), '🎨')} />
    </Tabs>
  );
}
