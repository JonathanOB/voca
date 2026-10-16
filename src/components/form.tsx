import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './app-text';
import { SymbolImage } from './symbol-image';
import { selectionHaptic } from '@/services/haptics';
import { RADIUS, softShadow, useTheme, withAlpha } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <View style={{ marginBottom: 8, marginTop: 18 }}>
      <AppText variant="subheading">{children}</AppText>
      {hint ? (
        <AppText variant="caption" muted style={{ marginTop: 2 }}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

export function TextField(props: TextInputProps & { large?: boolean }) {
  const theme = useTheme();
  const { large, style, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={theme.colors.textSoft}
      {...rest}
      style={[
        styles.input,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.highContrast ? theme.colors.text : theme.colors.border,
          color: theme.colors.text,
          fontFamily: theme.fonts.bold,
          fontSize: (large ? 22 : 17) * theme.textScale,
          minHeight: large ? 64 : 54,
        },
        style,
      ]}
    />
  );
}

/** Segmented control with big targets. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  accessibilityLabel,
}: {
  value: T;
  options: { value: T; label: string; icon?: IconName }[];
  onChange: (v: T) => void;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  return (
    <View
      style={[styles.segment, { backgroundColor: theme.colors.bgAlt, borderColor: theme.highContrast ? theme.colors.text : 'transparent' }]}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              selectionHaptic();
              onChange(o.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={o.label}
            style={[
              styles.segmentItem,
              active && [{ backgroundColor: theme.colors.surface }, softShadow(theme, 1)],
              active && theme.highContrast && { borderWidth: 2, borderColor: theme.colors.text },
            ]}
          >
            {o.icon ? <Ionicons name={o.icon} size={18} color={active ? theme.colors.primary : theme.colors.textMuted} /> : null}
            <AppText variant="label" color={active ? theme.colors.text : theme.colors.textMuted} numberOfLines={1} adjustsFontSizeToFit>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ToggleRow({
  label,
  sub,
  value,
  onChange,
  icon,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: IconName;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      accessibilityHint={sub}
      style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : theme.colors.border }]}
    >
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: theme.colors.primarySoft }]}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong">{label}</AppText>
        {sub ? (
          <AppText variant="caption" muted>
            {sub}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
        thumbColor="#FFFFFF"
        importantForAccessibility="no"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

export function NavRow({ label, sub, icon, onPress, danger, right }: { label: string; sub?: string; icon?: IconName; onPress: () => void; danger?: boolean; right?: ReactNode }) {
  const theme = useTheme();
  const tint = danger ? theme.colors.danger : theme.colors.primary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={sub}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface,
          borderColor: theme.highContrast ? theme.colors.text : theme.colors.border,
        },
      ]}
    >
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: danger ? theme.colors.dangerSoft : theme.colors.primarySoft }]}>
          <Ionicons name={icon} size={20} color={tint} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong" color={danger ? theme.colors.danger : undefined}>
          {label}
        </AppText>
        {sub ? (
          <AppText variant="caption" muted>
            {sub}
          </AppText>
        ) : null}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={20} color={theme.colors.textSoft} />}
    </Pressable>
  );
}

/** − value + control with large targets (easier than a slider for many users). */
export function Stepper({
  label,
  value,
  display,
  onChange,
  step,
  min,
  max,
  lessLabel,
  moreLabel,
}: {
  label: string;
  value: number;
  display: string;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
  lessLabel: string;
  moreLabel: string;
}) {
  const theme = useTheme();
  const set = (v: number) => {
    const next = Math.round(Math.min(max, Math.max(min, v)) * 100) / 100;
    if (next !== value) {
      selectionHaptic();
      onChange(next);
    }
  };
  const pct = (value - min) / (max - min);
  return (
    <View
      style={[styles.stepper, { backgroundColor: theme.colors.surface, borderColor: theme.highContrast ? theme.colors.text : theme.colors.border }]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: display }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => set(value + (e.nativeEvent.actionName === 'increment' ? step : -step))}
    >
      <Pressable
        onPress={() => set(value - step)}
        style={[styles.stepBtn, { backgroundColor: theme.colors.primarySoft }]}
        accessibilityLabel={lessLabel}
        hitSlop={6}
      >
        <Ionicons name="remove" size={24} color={theme.colors.primary} />
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
        <AppText variant="bodyStrong">
          {label}: {display}
        </AppText>
        <View style={[styles.track, { backgroundColor: theme.colors.bgAlt }]}>
          <View style={[styles.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: theme.colors.primary }]} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' }}>
          <AppText variant="tiny" muted>
            {lessLabel}
          </AppText>
          <AppText variant="tiny" muted>
            {moreLabel}
          </AppText>
        </View>
      </View>
      <Pressable
        onPress={() => set(value + step)}
        style={[styles.stepBtn, { backgroundColor: theme.colors.primarySoft }]}
        accessibilityLabel={moreLabel}
        hitSlop={6}
      >
        <Ionicons name="add" size={24} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

/** Selectable card with a 3D symbol, used in onboarding and settings. */
export function OptionCard({
  title,
  sub,
  emoji,
  symbol,
  selected,
  onPress,
  right,
  compact,
}: {
  title: string;
  sub?: string;
  emoji?: string;
  symbol?: string | null;
  selected: boolean;
  onPress: () => void;
  right?: ReactNode;
  compact?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => {
        selectionHaptic();
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={sub ? `${title}. ${sub}` : title}
      style={({ pressed }) => [
        styles.option,
        {
          padding: compact ? 12 : 16,
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.highContrast ? theme.colors.text : theme.colors.border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {emoji || symbol ? <SymbolImage emoji={emoji} symbol={symbol} size={compact ? 36 : 44} /> : null}
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong">{title}</AppText>
        {sub ? (
          <AppText variant="caption" muted>
            {sub}
          </AppText>
        ) : null}
      </View>
      {right}
      <View
        style={[
          styles.radio,
          { borderColor: selected ? theme.colors.primary : theme.colors.border, backgroundColor: selected ? theme.colors.primary : 'transparent' },
        ]}
      >
        {selected ? <Ionicons name="checkmark" size={16} color={theme.colors.onPrimary} /> : null}
      </View>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress: () => void; icon?: IconName }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.highContrast ? theme.colors.text : theme.colors.border,
        },
      ]}
    >
      {icon ? <Ionicons name={icon} size={16} color={selected ? theme.colors.onPrimary : theme.colors.textMuted} /> : null}
      <AppText variant="label" color={selected ? theme.colors.onPrimary : theme.colors.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function ColorDot({ color, selected, onPress, label, size = 44 }: { color: string; selected: boolean; onPress: () => void; label: string; size?: number }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={{
        width: size + 10,
        height: size + 10,
        borderRadius: size,
        borderWidth: 3,
        borderColor: selected ? theme.colors.text : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: size, height: size, borderRadius: size, backgroundColor: color, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: withAlpha('#000000', 0.08) }}>
        {selected ? <Ionicons name="checkmark" size={22} color="#1F1B4D" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 2, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 10 },
  segment: { flexDirection: 'row', padding: 5, borderRadius: RADIUS.lg, gap: 4, borderWidth: 2 },
  segmentItem: {
    flex: 1,
    minHeight: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: RADIUS.lg, borderWidth: 2, minHeight: 64 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: RADIUS.lg, borderWidth: 2 },
  stepBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  track: { height: 8, borderRadius: 4, alignSelf: 'stretch', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: RADIUS.lg, borderWidth: 2.5 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: RADIUS.pill, borderWidth: 2, minHeight: 42 },
});
