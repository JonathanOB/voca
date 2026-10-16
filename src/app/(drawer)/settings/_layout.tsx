import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CarerGate } from '@/components/carer-gate';
import { SectionTabBar } from '@/components/section-tab-bar';
import { SECTION_TAB_OPTIONS, tab } from '@/navigation/tab-options';

export default function SettingsLayout() {
  const { t } = useTranslation();
  return (
    <CarerGate showBack={false}>
      <Tabs tabBar={(p) => <SectionTabBar {...p} />} screenOptions={SECTION_TAB_OPTIONS}>
        <Tabs.Screen name="index" options={tab(t('tabs.general'), '⚙️')} />
        <Tabs.Screen name="voice" options={tab(t('tabs.voice'), '🎙️')} />
        <Tabs.Screen name="display" options={tab(t('tabs.display'), '🎨')} />
        <Tabs.Screen name="touch" options={tab(t('tabs.touch'), '👆')} />
        <Tabs.Screen name="data" options={tab(t('tabs.data'), '💾')} />
      </Tabs>
    </CarerGate>
  );
}
