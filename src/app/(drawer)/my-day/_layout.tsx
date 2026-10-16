import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SectionTabBar } from '@/components/section-tab-bar';
import { SECTION_TAB_OPTIONS, tab } from '@/navigation/tab-options';

export default function MyDayLayout() {
  const { t } = useTranslation();
  return (
    <Tabs tabBar={(p) => <SectionTabBar {...p} />} screenOptions={SECTION_TAB_OPTIONS}>
      <Tabs.Screen name="index" options={tab(t('tabs.schedule'), '🗓️')} />
      <Tabs.Screen name="first-then" options={tab(t('tabs.firstThen'), '1️⃣')} />
      <Tabs.Screen name="routines" options={tab(t('tabs.routines'), '🧼')} />
      <Tabs.Screen name="waiting" options={tab(t('tabs.waiting'), '⏳')} />
    </Tabs>
  );
}
