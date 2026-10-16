import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SectionTabBar } from '@/components/section-tab-bar';
import { SECTION_TAB_OPTIONS, tab } from '@/navigation/tab-options';

export default function ChoicesLayout() {
  const { t } = useTranslation();
  return (
    <Tabs tabBar={(p) => <SectionTabBar {...p} />} screenOptions={SECTION_TAB_OPTIONS}>
      <Tabs.Screen name="index" options={tab(t('tabs.board'), '👆')} />
      <Tabs.Screen name="maker" options={tab(t('tabs.maker'), '🤔')} />
    </Tabs>
  );
}
