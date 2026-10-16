import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';

export type TextVariant = 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'bodyStrong' | 'caption' | 'label' | 'tiny';

const SIZES: Record<TextVariant, { size: number; line: number; weight: 'regular' | 'medium' | 'bold' | 'heavy' | 'black' }> = {
  display: { size: 34, line: 40, weight: 'black' },
  title: { size: 26, line: 32, weight: 'black' },
  heading: { size: 20, line: 26, weight: 'heavy' },
  subheading: { size: 17, line: 23, weight: 'bold' },
  body: { size: 16, line: 23, weight: 'medium' },
  bodyStrong: { size: 16, line: 23, weight: 'bold' },
  caption: { size: 13.5, line: 19, weight: 'medium' },
  label: { size: 15, line: 19, weight: 'heavy' },
  tiny: { size: 11.5, line: 15, weight: 'bold' },
};

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  muted?: boolean;
  center?: boolean;
  /** Fixed size (still scales with the device's text setting). */
  size?: number;
  weight?: 'regular' | 'medium' | 'bold' | 'heavy' | 'black';
}

export function AppText({ variant = 'body', color, muted, center, size, weight, style, maxFontSizeMultiplier, ...rest }: AppTextProps) {
  const theme = useTheme();
  const spec = SIZES[variant];
  const fontSize = (size ?? spec.size) * theme.textScale;
  const lineHeight = size ? size * 1.3 * theme.textScale : spec.line * theme.textScale;
  const s: TextStyle = {
    fontFamily: theme.fonts[weight ?? spec.weight],
    fontSize,
    lineHeight,
    color: color ?? (muted ? theme.colors.textMuted : theme.colors.text),
    textAlign: center ? 'center' : undefined,
  };
  return <Text maxFontSizeMultiplier={maxFontSizeMultiplier ?? 2} {...rest} style={[s, style]} />;
}
