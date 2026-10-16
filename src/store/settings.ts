import { DEFAULT_QUICK_WORDS } from '@/data/standard-content';
import type { SkinTone } from '@/data/symbols';
import type { PaletteName } from '@/theme/colors';

export type ThemeModeSetting = 'system' | 'light' | 'dark';
export type FontChoice = 'rounded' | 'legible';
export type ButtonDisplay = 'imageText' | 'text' | 'image';
export type GridSize = 'large' | 'medium' | 'small';
export type TapAction = 'speakAndAdd' | 'add' | 'speak';
export type MotionSetting = 'system' | 'reduced' | 'full';
export type VoiceStyle = 'natural' | 'bright' | 'calm' | 'deep' | 'custom';

export type QuickActionId =
  | 'talk'
  | 'favourites'
  | 'myday'
  | 'firstthen'
  | 'routines'
  | 'choices'
  | 'feelings'
  | 'sensory'
  | 'body'
  | 'keyboard'
  | 'waiting'
  | 'library'
  | 'myboards'
  | 'safety';

export interface FirstThenState {
  first: string | null;
  then: string | null;
  firstDone: boolean;
}

export interface Settings {
  /** Bumped when the settings shape changes in a way that needs migrating. */
  version: number;
  onboardingDone: boolean;
  onboardingStep: number;
  language: string;
  userName: string;

  themeMode: ThemeModeSetting;
  palette: PaletteName;
  highContrast: boolean;
  font: FontChoice;
  textScale: number;
  motion: MotionSetting;
  haptics: boolean;

  buttonDisplay: ButtonDisplay;
  gridSize: GridSize;
  colorCoded: boolean;
  stableLayout: boolean;
  fixedGrid: boolean;
  skinTone: SkinTone;
  showQuickWords: boolean;
  quickWords: string[];

  voiceId: string | null;
  voiceStyle: VoiceStyle;
  rate: number;
  pitch: number;
  speechEnabled: boolean;

  tapAction: TapAction;
  showSentenceBar: boolean;
  clearConfirmAt: number;

  quickActions: QuickActionId[];
  firstThen: FirstThenState;
  choiceSet: string[];
  timerMinutes: number;

  telemetryConsent: boolean;
  telemetryLastSent: string | null;

  /** Carer lock: SHA-256 of the PIN, or null when the lock is off. A helper, not security. */
  pinHash: string | null;
  showLanguageButton: boolean;

  /** Touch help for tremor or repeated taps. 0 turns each one off. */
  ignoreRepeatMs: number;
  holdMs: number;
  allowSlips: boolean;

  /** Typing: word and phrase suggestions, learned only on this device. */
  wordSuggestions: boolean;
  learnWords: boolean;
}

export const VOICE_STYLES: Record<Exclude<VoiceStyle, 'custom'>, { rate: number; pitch: number }> = {
  natural: { rate: 1.0, pitch: 1.0 },
  bright: { rate: 1.0, pitch: 1.25 },
  calm: { rate: 0.85, pitch: 1.0 },
  deep: { rate: 0.95, pitch: 0.8 },
};

export const MAX_QUICK_WORDS = 6;

export const ALL_QUICK_ACTIONS: QuickActionId[] = [
  'talk',
  'myday',
  'feelings',
  'choices',
  'favourites',
  'firstthen',
  'routines',
  'sensory',
  'body',
  'keyboard',
  'waiting',
  'library',
  'myboards',
  'safety',
];

export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  onboardingDone: false,
  onboardingStep: 0,
  language: 'en',
  userName: '',

  themeMode: 'system',
  palette: 'lavender',
  highContrast: false,
  font: 'rounded',
  textScale: 1,
  motion: 'system',
  haptics: true,

  buttonDisplay: 'imageText',
  gridSize: 'medium',
  colorCoded: true,
  // Motor planning: words keep their place (hidden words leave a gap; same grid on every screen).
  stableLayout: true,
  fixedGrid: true,
  skinTone: 'default',
  showQuickWords: true,
  quickWords: DEFAULT_QUICK_WORDS.map((k) => `std:button:${k}`),

  voiceId: null,
  voiceStyle: 'natural',
  rate: 1,
  pitch: 1,
  speechEnabled: true,

  tapAction: 'speakAndAdd',
  showSentenceBar: true,
  clearConfirmAt: 4,

  quickActions: ['talk', 'myday', 'feelings', 'choices'],
  firstThen: { first: 'std:button:homework', then: 'std:button:play', firstDone: false },
  choiceSet: [],
  timerMinutes: 5,

  telemetryConsent: false,
  telemetryLastSent: null,

  pinHash: null,
  showLanguageButton: true,

  ignoreRepeatMs: 0,
  holdMs: 0,
  allowSlips: false,

  wordSuggestions: true,
  learnWords: true,
};

/** Merge stored settings over defaults so new fields always have a value. */
export function normalizeSettings(raw: Partial<Settings> | null | undefined): Settings {
  const merged: Settings = { ...DEFAULT_SETTINGS, ...(raw ?? {}) };
  merged.firstThen = { ...DEFAULT_SETTINGS.firstThen, ...(raw?.firstThen ?? {}) };
  if (!Array.isArray(merged.quickActions)) merged.quickActions = DEFAULT_SETTINGS.quickActions;
  merged.quickActions = merged.quickActions.filter((q) => ALL_QUICK_ACTIONS.includes(q));
  if (!Array.isArray(merged.choiceSet)) merged.choiceSet = [];
  if (!Array.isArray(merged.quickWords)) merged.quickWords = DEFAULT_SETTINGS.quickWords;
  merged.quickWords = merged.quickWords.slice(0, MAX_QUICK_WORDS);
  merged.rate = clamp(Number(merged.rate) || 1, 0.5, 1.6);
  merged.pitch = clamp(Number(merged.pitch) || 1, 0.5, 1.8);
  merged.textScale = clamp(Number(merged.textScale) || 1, 0.9, 1.6);
  merged.timerMinutes = clamp(Math.round(Number(merged.timerMinutes) || 5), 1, 60);
  merged.ignoreRepeatMs = clamp(Math.round(Number(merged.ignoreRepeatMs) || 0), 0, 3000);
  merged.holdMs = clamp(Math.round(Number(merged.holdMs) || 0), 0, 3000);
  if (typeof merged.pinHash !== 'string' || !merged.pinHash) merged.pinHash = null;
  return merged;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
