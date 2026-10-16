import type { BottomTabNavigationOptions } from 'expo-router/tabs';

/** Tab options with a 3D symbol icon, read by SectionTabBar. */
export function tab(title: string, emoji: string): BottomTabNavigationOptions {
  return { title, emoji } as BottomTabNavigationOptions;
}

export const SECTION_TAB_OPTIONS: BottomTabNavigationOptions = {
  headerShown: false,
  // Tabs are peers: switching never slides.
  animation: 'none',
};
