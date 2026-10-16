/**
 * Voca colour system.
 *
 * Soft lavender canvas, white rounded surfaces, deep navy ink and pastel accents.
 * Every pastel used behind text is paired with navy ink, which keeps contrast
 * above WCAG AA for body text in light mode.
 */

export type PaletteName = 'lavender' | 'ocean' | 'meadow' | 'sunset';
export type ColorMode = 'light' | 'dark';

export type CardColor =
  | 'purple'
  | 'green'
  | 'coral'
  | 'yellow'
  | 'sky'
  | 'peach'
  | 'pink'
  | 'mint';

export type WordType =
  | 'people'
  | 'action'
  | 'describe'
  | 'social'
  | 'question'
  | 'negation'
  | 'thing'
  | 'place'
  | 'time'
  | 'feeling'
  | 'body'
  | 'urgent'
  | 'misc';

export interface SwatchPair {
  bg: string;
  edge: string;
}

export interface ThemeColors {
  bg: string;
  bgAlt: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textSoft: string;
  ink: string;
  inkEdge: string;
  inkText: string;
  primary: string;
  primaryEdge: string;
  primarySoft: string;
  onPrimary: string;
  highlight: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerEdge: string;
  dangerSoft: string;
  overlay: string;
  shadow: string;
  focus: string;
}

interface PaletteSpec {
  primary: string;
  primaryEdge: string;
  primarySoftLight: string;
  primarySoftDark: string;
  bgLight: string;
  bgAltLight: string;
}

export const PALETTES: Record<PaletteName, PaletteSpec> = {
  lavender: {
    primary: '#6C5CE7',
    primaryEdge: '#4A3BC2',
    primarySoftLight: '#ECE8FF',
    primarySoftDark: '#2F2862',
    bgLight: '#EEF0FB',
    bgAltLight: '#E5E2FA',
  },
  ocean: {
    primary: '#2878D8',
    primaryEdge: '#1A57A6',
    primarySoftLight: '#E0EEFF',
    primarySoftDark: '#1D3355',
    bgLight: '#EAF2FC',
    bgAltLight: '#DCEAFA',
  },
  meadow: {
    primary: '#1E9A5E',
    primaryEdge: '#13724A',
    primarySoftLight: '#DDF5E8',
    primarySoftDark: '#1A3A2C',
    bgLight: '#ECF7F1',
    bgAltLight: '#DDF0E5',
  },
  sunset: {
    primary: '#E0632F',
    primaryEdge: '#B04620',
    primarySoftLight: '#FFE7DC',
    primarySoftDark: '#4A2A1E',
    bgLight: '#FCF1EB',
    bgAltLight: '#F8E3D7',
  },
};

export const PALETTE_ORDER: PaletteName[] = ['lavender', 'ocean', 'meadow', 'sunset'];

const NAVY = '#1F1B4D';

export function buildColors(mode: ColorMode, palette: PaletteName, highContrast: boolean): ThemeColors {
  const p = PALETTES[palette];
  if (mode === 'light') {
    const c: ThemeColors = {
      bg: p.bgLight,
      bgAlt: p.bgAltLight,
      surface: '#FFFFFF',
      surfaceAlt: '#F7F6FE',
      border: '#E2DFF3',
      text: NAVY,
      textMuted: '#5C5986',
      textSoft: '#8E8BB0',
      ink: '#261C63',
      inkEdge: '#120C3A',
      inkText: '#FFFFFF',
      primary: p.primary,
      primaryEdge: p.primaryEdge,
      primarySoft: p.primarySoftLight,
      onPrimary: '#FFFFFF',
      highlight: '#FFE58A',
      success: '#1E9A5E',
      successSoft: '#DDF5E8',
      danger: '#D93A3F',
      dangerEdge: '#A3242A',
      dangerSoft: '#FFE3E3',
      overlay: 'rgba(22, 17, 56, 0.45)',
      shadow: '#3B2F9E',
      focus: '#FFB020',
    };
    if (highContrast) {
      return {
        ...c,
        bg: '#FFFFFF',
        bgAlt: '#F2F2F2',
        surfaceAlt: '#FFFFFF',
        border: '#000000',
        text: '#000000',
        textMuted: '#1A1A1A',
        textSoft: '#333333',
        primary: p.primaryEdge,
        primaryEdge: '#000000',
        primarySoft: '#FFFFFF',
        inkEdge: '#000000',
      };
    }
    return c;
  }
  const c: ThemeColors = {
    bg: '#14112B',
    bgAlt: '#1A1636',
    surface: '#221D45',
    surfaceAlt: '#2A2452',
    border: '#3A3368',
    text: '#F4F2FF',
    textMuted: '#BDB8E3',
    textSoft: '#8F8AB8',
    ink: '#F4F2FF',
    inkEdge: '#B9B2EA',
    inkText: NAVY,
    primary: lighten(p.primary, 0.12),
    primaryEdge: p.primaryEdge,
    primarySoft: p.primarySoftDark,
    onPrimary: '#FFFFFF',
    highlight: '#8A6D12',
    success: '#3CC77F',
    successSoft: '#173A2A',
    danger: '#FF6B6F',
    dangerEdge: '#B3262B',
    dangerSoft: '#4A1D24',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
    focus: '#FFC44D',
  };
  if (highContrast) {
    return {
      ...c,
      bg: '#000000',
      bgAlt: '#0A0A0A',
      surface: '#000000',
      surfaceAlt: '#111111',
      border: '#FFFFFF',
      text: '#FFFFFF',
      textMuted: '#F0F0F0',
      textSoft: '#D0D0D0',
      primarySoft: '#000000',
    };
  }
  return c;
}

/** Pastel cards used for home shortcuts and section headers (screenshot style). */
export const CARD_COLORS: Record<CardColor, SwatchPair> = {
  purple: { bg: '#A99CFA', edge: '#7C69EE' },
  green: { bg: '#82DCA9', edge: '#4DBD80' },
  coral: { bg: '#FBA7A4', edge: '#EB7C78' },
  yellow: { bg: '#FFD966', edge: '#EDBB33' },
  sky: { bg: '#93CFFA', edge: '#5AAEEB' },
  peach: { bg: '#FFC197', edge: '#F09A5E' },
  pink: { bg: '#F7AEDA', edge: '#E07FBA' },
  mint: { bg: '#90E4D5', edge: '#4FC9B3' },
};

/**
 * Colour coding for communication buttons by word type (light mode values),
 * following the Modified Fitzgerald Key used widely in AAC:
 *   yellow  people & pronouns        green  verbs (actions)
 *   blue    describing words         orange nouns (things, places, body)
 *   pink    social words             purple questions
 *   red     negation & important     brown  adverbs (time & place words)
 *   white   little joining words
 * Feelings are describing words, so they share the blue family (a lighter tint
 * keeps a large feelings board calm). Research on colour cues is mixed
 * (Thistle & Wilkinson, 2009), so colour is always paired with a label and a
 * picture and can be switched off.
 */
export const WORD_COLORS: Record<WordType, SwatchPair> = {
  people: { bg: '#FFF3C9', edge: '#EEC23F' },
  action: { bg: '#DCF6E7', edge: '#55C589' },
  describe: { bg: '#DFEDFF', edge: '#629FEF' },
  feeling: { bg: '#E6F1FF', edge: '#7AB0F2' },
  social: { bg: '#FFE2F0', edge: '#EC87BA' },
  question: { bg: '#ECE6FF', edge: '#9783F2' },
  negation: { bg: '#FFE1DE', edge: '#EE7D74' },
  thing: { bg: '#FFEAD8', edge: '#F2A15E' },
  place: { bg: '#FFEAD8', edge: '#F2A15E' },
  body: { bg: '#FFEAD8', edge: '#F2A15E' },
  time: { bg: '#F3E8DC', edge: '#B98B5F' },
  urgent: { bg: '#FFD9D9', edge: '#DC3E43' },
  misc: { bg: '#FFFFFF', edge: '#D3CFEA' },
};

/** Groups shown in the colour key (one entry per colour, in teaching order). */
export const COLOR_KEY: { types: WordType[]; sample: WordType }[] = [
  { types: ['people'], sample: 'people' },
  { types: ['action'], sample: 'action' },
  { types: ['describe', 'feeling'], sample: 'describe' },
  { types: ['thing', 'place', 'body'], sample: 'thing' },
  { types: ['social'], sample: 'social' },
  { types: ['question'], sample: 'question' },
  { types: ['negation', 'urgent'], sample: 'negation' },
  { types: ['time'], sample: 'time' },
  { types: ['misc'], sample: 'misc' },
];

export const WORD_TYPES = Object.keys(WORD_COLORS) as WordType[];
export const CARD_COLOR_NAMES = Object.keys(CARD_COLORS) as CardColor[];

export function tileSwatch(
  type: WordType,
  mode: ColorMode,
  opts: { colorCoded: boolean; highContrast: boolean; urgent?: boolean },
): SwatchPair & { text: string } {
  const key: WordType = opts.urgent ? 'urgent' : opts.colorCoded ? type : 'misc';
  const s = WORD_COLORS[key];
  if (opts.highContrast) {
    return mode === 'light'
      ? { bg: '#FFFFFF', edge: '#000000', text: '#000000' }
      : { bg: '#000000', edge: '#FFFFFF', text: '#FFFFFF' };
  }
  if (mode === 'light') return { ...s, text: NAVY };
  return { bg: mix(s.edge, '#221D45', 0.78), edge: mix(s.edge, '#221D45', 0.25), text: '#F4F2FF' };
}

export function cardSwatch(color: CardColor, mode: ColorMode): SwatchPair & { text: string } {
  const s = CARD_COLORS[color];
  if (mode === 'light') return { ...s, text: NAVY };
  return { bg: mix(s.edge, '#221D45', 0.55), edge: mix(s.edge, '#100C26', 0.45), text: '#FFFFFF' };
}

// ---------------------------------------------------------------------------
// Small colour helpers (no dependency needed)

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mix colour `a` towards `b` by amount `t` (0 = a, 1 = b). */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export function lighten(hex: string, t: number): string {
  return mix(hex, '#FFFFFF', t);
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
