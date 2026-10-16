import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SectionTabBar } from '@/components/section-tab-bar';
import { SECTION_TAB_OPTIONS, tab } from '@/navigation/tab-options';

export default function CommunicateLayout() {
  const { t } = useTranslation();
  return (
    <Tabs tabBar={(p) => <SectionTabBar {...p} />} screenOptions={SECTION_TAB_OPTIONS}>
      <Tabs.Screen name="index" options={tab(t('tabs.core'), '💬')} />
      <Tabs.Screen name="more" options={tab(t('tabs.moreCore'), '🧩')} />
      <Tabs.Screen name="requests" options={tab(t('tabs.requests'), '🤲')} />
      <Tabs.Screen name="social" options={tab(t('tabs.social'), '👋')} />
      <Tabs.Screen name="phrases" options={tab(t('tabs.phrases'), '🗨️')} />
      <Tabs.Screen name="keyboard" options={tab(t('tabs.keyboard'), '⌨️')} />
    </Tabs>
  );
}
