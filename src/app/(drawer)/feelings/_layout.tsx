import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SectionTabBar } from '@/components/section-tab-bar';
import { SECTION_TAB_OPTIONS, tab } from '@/navigation/tab-options';

export default function FeelingsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs tabBar={(p) => <SectionTabBar {...p} />} screenOptions={SECTION_TAB_OPTIONS}>
      <Tabs.Screen name="index" options={tab(t('tabs.feelings'), '😊')} />
      <Tabs.Screen name="sensory" options={tab(t('tabs.sensory'), '🎧')} />
      <Tabs.Screen name="body" options={tab(t('tabs.body'), '🩹')} />
    </Tabs>
  );
}
