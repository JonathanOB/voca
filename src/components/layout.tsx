import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode, Ref } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './app-text';
import { Mascot } from './mascot';
import { RADIUS, softShadow, useTheme } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Scrollable page with the themed background and a readable max width on tablets. */
export function Screen({
  children,
  padded = true,
  scroll = true,
  bottomInset = true,
  style,
  contentStyle,
  scrollRef,
  ...rest
}: {
  children: ReactNode;
  scrollRef?: Ref<ScrollView>;
  padded?: boolean;
  scroll?: boolean;
  bottomInset?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
} & ScrollViewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const inner: StyleProp<ViewStyle> = [
    {
      padding: padded ? (theme.isTablet ? 28 : 16) : 0,
      paddingBottom: (bottomInset ? insets.bottom : 0) + 32,
      width: '100%',
      maxWidth: theme.isTablet ? 1100 : undefined,
      alignSelf: 'center',
    },
    contentStyle,
  ];
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: theme.colors.bg }, style]}><View style={[inner, { flex: 1 }]}>{children}</View></View>;
  return (
    <ScrollView
      ref={scrollRef}
      style={[{ flex: 1, backgroundColor: theme.colors.bg }, style]}
      contentContainerStyle={inner}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  const theme = useTheme();
  const base: StyleProp<ViewStyle> = [
    styles.card,
    { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : 'transparent' },
    softShadow(theme, 1),
    style,
  ];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [base, pressed && { transform: [{ scale: 0.985 }] }]}>
      {children}
    </Pressable>
  );
}

export function SectionHeader({ title, action, onAction, style }: { title: string; action?: string; onAction?: () => void; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View style={[styles.section, style]}>
      <AppText variant="heading" accessibilityRole="header" style={{ flex: 1 }}>
        {title}
      </AppText>
      {action && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={12} style={{ paddingVertical: 6, paddingLeft: 12 }}>
          <AppText variant="label" color={theme.colors.primary}>
            {action}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({ title, body, children }: { title: string; body?: string; children?: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, gap: 8 }}>
      <Mascot size={110} sparkle={false} />
      <AppText variant="heading" center>
        {title}
      </AppText>
      {body ? (
        <AppText muted center>
          {body}
        </AppText>
      ) : null}
      {children ? <View style={{ marginTop: 12 }}>{children}</View> : null}
    </View>
  );
}

export function InfoBanner({ text, icon = 'information-circle', tone = 'info' }: { text: string; icon?: IconName; tone?: 'info' | 'warning' | 'danger' }) {
  const theme = useTheme();
  const bg = tone === 'danger' ? theme.colors.dangerSoft : tone === 'warning' ? (theme.mode === 'dark' ? '#3D3214' : '#FFF4D6') : theme.colors.primarySoft;
  const fg = tone === 'danger' ? theme.colors.danger : tone === 'warning' ? (theme.mode === 'dark' ? '#FFD36B' : '#8A5A00') : theme.colors.primary;
  return (
    <View style={[styles.banner, { backgroundColor: bg, borderColor: theme.highContrast ? theme.colors.text : 'transparent' }]}>
      <Ionicons name={icon} size={22} color={fg} />
      <AppText variant="caption" style={{ flex: 1 }} color={theme.colors.text}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.lg, padding: 16, borderWidth: 2 },
  section: { flexDirection: 'row', alignItems: 'center', marginTop: 26, marginBottom: 12 },
  banner: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 2 },
});
