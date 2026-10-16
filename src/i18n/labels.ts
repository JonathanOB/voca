/**
 * Resolves the visible and spoken text for content. Standard content uses the
 * current language unless the user has edited it; user text is never translated.
 */
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Board, Button, Routine, RoutineStep } from '@/db/types';
import { i18n } from './index';

const dyn = (key: string): string => (i18n.t as (k: string) => string)(key);

export function vocabLabel(stdKey: string): string {
  return dyn(`vocab:${stdKey}`);
}

export function buttonLabel(btn: Pick<Button, 'label' | 'stdKey'> | undefined | null): string {
  if (!btn) return '';
  if (btn.label) return btn.label;
  if (btn.stdKey) return vocabLabel(btn.stdKey);
  return '';
}

export function buttonSpoken(btn: Pick<Button, 'label' | 'stdKey' | 'spoken'> | undefined | null): string {
  if (!btn) return '';
  return btn.spoken?.trim() || buttonLabel(btn);
}

export function boardName(board: Pick<Board, 'name' | 'stdKey'> | undefined | null): string {
  if (!board) return '';
  if (board.name) return board.name;
  if (board.stdKey) return dyn(`boards:${board.stdKey}.name`);
  return '';
}

export function boardPurpose(board: Pick<Board, 'description' | 'stdKey'> | undefined | null): string {
  if (!board) return '';
  if (board.description) return board.description;
  if (board.stdKey) return dyn(`boards:${board.stdKey}.purpose`);
  return '';
}

export function routineName(r: Pick<Routine, 'name' | 'stdKey'> | undefined | null): string {
  if (!r) return '';
  if (r.name) return r.name;
  if (r.stdKey) return dyn(`routines:${r.stdKey}`);
  return '';
}

export function stepLabel(step: RoutineStep, buttons: Record<string, Button>): string {
  if (step.label) return step.label;
  if (step.buttonId && buttons[step.buttonId]) return buttonLabel(buttons[step.buttonId]);
  if (step.stdKey) return vocabLabel(step.stdKey);
  return '';
}

export function stepSpoken(step: RoutineStep, buttons: Record<string, Button>): string {
  if (step.spoken?.trim()) return step.spoken;
  if (!step.label && step.buttonId && buttons[step.buttonId]) return buttonSpoken(buttons[step.buttonId]);
  return stepLabel(step, buttons);
}

export function stepSymbol(step: RoutineStep, buttons: Record<string, Button>) {
  const btn = step.buttonId ? buttons[step.buttonId] : undefined;
  return {
    symbol: step.symbol ?? btn?.symbol ?? null,
    photo: step.photo ?? (step.symbol ? null : btn?.photo) ?? null,
  };
}

/** Hook version: re-renders the caller when the language changes. */
export function useLabels() {
  const { t, i18n: inst } = useTranslation();
  const lang = inst.language;
  // `lang` is a dependency so memoised consumers refresh on language change.
  const tv = useCallback((k: string) => vocabLabel(k), [lang]); // eslint-disable-line react-hooks/exhaustive-deps
  return useMemo(
    () => ({ t, lang, tv, buttonLabel, buttonSpoken, boardName, boardPurpose, routineName, stepLabel, stepSpoken }),
    [t, lang, tv],
  );
}
