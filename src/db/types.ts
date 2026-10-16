import type { CardColor, WordType } from '@/theme/colors';
import type { TapAction } from '@/store/settings';
import type { SectionKey } from '@/data/standard-content';

/** A communication button. Text fields are null when the standard (translated) wording applies. */
export interface Button {
  id: string;
  stdKey: string | null;
  label: string | null;
  spoken: string | null;
  /** BCP-47 language for speech, or null to use the user's speech language. */
  lang: string | null;
  symbol: string | null;
  /** Filename inside the app media folder. */
  photo: string | null;
  /** Filename of an optional recorded clip inside the app media folder. */
  audio: string | null;
  type: WordType;
  /** Other forms of the word offered on long press (plural, past…). Null = automatic. */
  forms?: string[] | null;
  isStandard: boolean;
  createdAt: number;
  updatedAt: number;
}

export type BoardSection = SectionKey | 'custom';

export interface Board {
  id: string;
  stdKey: string | null;
  name: string | null;
  description: string | null;
  section: BoardSection;
  symbol: string | null;
  photo: string | null;
  color: CardColor;
  isStandard: boolean;
  hidden: boolean;
  sort: number;
  tapAction: TapAction | null;
  tone: 'urgent' | null;
  createdAt: number;
  updatedAt: number;
}

export interface BoardItem {
  id: string;
  boardId: string;
  buttonId: string;
  position: number;
  hidden: boolean;
}

export type RoutineKind = 'routine' | 'schedule';

export interface Routine {
  id: string;
  stdKey: string | null;
  name: string | null;
  description: string | null;
  kind: RoutineKind;
  symbol: string | null;
  photo: string | null;
  color: CardColor;
  isStandard: boolean;
  hidden: boolean;
  sort: number;
  createdAt: number;
  updatedAt: number;
}

export interface RoutineStep {
  id: string;
  routineId: string;
  position: number;
  /** Optional link to a communication button (schedules use this). */
  buttonId: string | null;
  stdKey: string | null;
  label: string | null;
  spoken: string | null;
  symbol: string | null;
  photo: string | null;
  audio: string | null;
  done: boolean;
  /** Time of day as HH:MM (schedules), or null. */
  time?: string | null;
  /** Minutes before `time` to remind (0 = at the time), or null for no reminder. */
  remindBefore?: number | null;
}

export interface LibraryData {
  buttons: Button[];
  boards: Board[];
  items: BoardItem[];
  routines: Routine[];
  steps: RoutineStep[];
}
