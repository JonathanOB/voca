import { Drawer } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/app-header';
import { DrawerContent } from '@/components/drawer-content';
import { useTheme } from '@/theme';

export default function DrawerLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  // Wide tablets keep the menu open beside the content.
  const permanent = theme.width >= 1100;

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerType: permanent ? 'permanent' : 'front',
        drawerStyle: {
          width: permanent ? 290 : Math.min(330, theme.width * 0.84),
          backgroundColor: theme.colors.surface,
          borderRightWidth: permanent ? 1 : 0,
          borderRightColor: theme.colors.border,
        },
        overlayColor: theme.colors.overlay,
        sceneStyle: { backgroundColor: theme.colors.bg },
        swipeEdgeWidth: 32,
        header: ({ options }) => (
          <AppHeader
            title={typeof options.title === 'string' ? options.title : ''}
            onMenu={permanent ? undefined : () => navigation.openDrawer()}
          />
        ),
      })}
    >
      <Drawer.Screen name="index" options={{ title: t('nav.home'), headerShown: false }} />
      <Drawer.Screen name="communicate" options={{ title: t('nav.communicate') }} />
      <Drawer.Screen name="my-day" options={{ title: t('nav.myDay') }} />
      <Drawer.Screen name="choices" options={{ title: t('nav.choices') }} />
      <Drawer.Screen name="feelings" options={{ title: t('nav.feelings') }} />
      <Drawer.Screen name="library" options={{ title: t('nav.library') }} />
      <Drawer.Screen name="my-boards" options={{ title: t('nav.myBoards') }} />
      <Drawer.Screen name="settings" options={{ title: t('nav.settings') }} />
      <Drawer.Screen name="about" options={{ title: t('nav.about') }} />
    </Drawer>
  );
}
