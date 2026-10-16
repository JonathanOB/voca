import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './app-text';
import { SymbolImage } from './symbol-image';
import { selectionHaptic } from '@/services/haptics';
import { RADIUS, softShadow, useTheme } from '@/theme';

/** Section tabs (inside a drawer section). Each tab's icon is a 3D symbol passed as `tabBarAccessibilityLabel`-style option. */
export function SectionTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          paddingBottom: Math.max(insets.bottom, 10),
          borderColor: theme.highContrast ? theme.colors.text : theme.colors.border,
        },
        softShadow(theme, 2),
      ]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = typeof options.title === 'string' ? options.title : route.name;
        const emoji = (options as { emoji?: string }).emoji;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            selectionHaptic();
            navigation.navigate(route.name, route.params);
          }
        };
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            style={styles.item}
          >
            <View
              style={[
                styles.pill,
                focused && { backgroundColor: theme.colors.primarySoft, borderColor: theme.highContrast ? theme.colors.text : 'transparent' },
              ]}
            >
              {emoji ? <SymbolImage emoji={emoji} size={focused ? 30 : 26} style={{ opacity: focused ? 1 : 0.75 }} /> : null}
            </View>
            <AppText
              variant="tiny"
              color={focused ? theme.colors.primary : theme.colors.textMuted}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
              style={{ fontSize: 12.5 * theme.textScale }}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  item: { flex: 1, alignItems: 'center', gap: 2, minHeight: 56 },
  pill: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: RADIUS.pill, borderWidth: 2, borderColor: 'transparent' },
});
