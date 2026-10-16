import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SectionTabBar } from '@/components/section-tab-bar';
import { SECTION_TAB_OPTIONS, tab } from '@/navigation/tab-options';

export default function LibraryLayout() {
  const { t } = useTranslation();
  return (
    <Tabs tabBar={(p) => <SectionTabBar {...p} />} screenOptions={SECTION_TAB_OPTIONS}>
      <Tabs.Screen name="index" options={tab(t('tabs.categories'), '📚')} />
      <Tabs.Screen name="favourites" options={tab(t('tabs.favourites'), '⭐')} />
      <Tabs.Screen name="search" options={tab(t('tabs.search'), '🔍')} />
    </Tabs>
  );
}
