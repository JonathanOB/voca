import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccessibilityInfo, useColorScheme, useWindowDimensions } from 'react-native';

import type { FontChoice, Settings } from '@/store/settings';
import { buildColors, type ColorMode, type PaletteName, type ThemeColors } from './colors';

export * from './colors';

export interface FontSet {
  regular: string;
  medium: string;
  bold: string;
  heavy: string;
  black: string;
  logo: string;
}

const FONTS: Record<FontChoice, FontSet> = {
  rounded: {
    regular: 'Nunito_400Regular',
    medium: 'Nunito_600SemiBold',
    bold: 'Nunito_700Bold',
    heavy: 'Nunito_800ExtraBold',
    black: 'Nunito_900Black',
    logo: 'Fredoka_700Bold',
  },
  legible: {
    regular: 'AtkinsonHyperlegible_400Regular',
    medium: 'AtkinsonHyperlegible_400Regular',
    bold: 'AtkinsonHyperlegible_700Bold',
    heavy: 'AtkinsonHyperlegible_700Bold',
    black: 'AtkinsonHyperlegible_700Bold',
    logo: 'Fredoka_700Bold',
  },
};

export const SPACE = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 44 } as const;
export const RADIUS = { sm: 12, md: 18, lg: 24, xl: 30, pill: 999 } as const;

export interface Theme {
  mode: ColorMode;
  palette: PaletteName;
  highContrast: boolean;
  colors: ThemeColors;
  fonts: FontSet;
  textScale: number;
  reducedMotion: boolean;
  colorCoded: boolean;
  isTablet: boolean;
  width: number;
  height: number;
  space: typeof SPACE;
  radius: typeof RADIUS;
}

const ThemeContext = createContext<Theme | null>(null);

type ThemeSettings = Pick<
  Settings,
  'themeMode' | 'palette' | 'highContrast' | 'font' | 'textScale' | 'motion' | 'colorCoded'
>;

export function ThemeProvider({ settings, children }: { settings: ThemeSettings; children: ReactNode }) {
  const system = useColorScheme();
  const { width, height } = useWindowDimensions();
  const systemReduced = useSystemReducedMotion();

  const theme = useMemo<Theme>(() => {
    const mode: ColorMode =
      settings.themeMode === 'system' ? (system === 'dark' ? 'dark' : 'light') : settings.themeMode;
    const reducedMotion =
      settings.motion === 'reduced' ? true : settings.motion === 'full' ? false : systemReduced;
    return {
      mode,
      palette: settings.palette,
      highContrast: settings.highContrast,
      colors: buildColors(mode, settings.palette, settings.highContrast),
      fonts: FONTS[settings.font] ?? FONTS.rounded,
      textScale: settings.textScale,
      reducedMotion,
      colorCoded: settings.colorCoded,
      isTablet: Math.min(width, height) >= 600,
      width,
      height,
      space: SPACE,
      radius: RADIUS,
    };
  }, [
    settings.themeMode,
    settings.palette,
    settings.highContrast,
    settings.font,
    settings.textScale,
    settings.motion,
    settings.colorCoded,
    system,
    systemReduced,
    width,
    height,
  ]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme must be used inside ThemeProvider');
  return t;
}

function useSystemReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => mounted && setReduced(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setReduced(v));
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

/** Soft, low-contrast drop shadow used on cards. Elevation on Android. */
export function softShadow(theme: Theme, level: 1 | 2 | 3 = 1) {
  if (theme.mode === 'dark' || theme.highContrast) return {};
  const o = level === 1 ? 0.08 : level === 2 ? 0.12 : 0.18;
  return {
    shadowColor: theme.colors.shadow,
    shadowOpacity: o,
    shadowRadius: 6 + level * 6,
    shadowOffset: { width: 0, height: 3 + level * 3 },
    elevation: level * 2,
  };
}
