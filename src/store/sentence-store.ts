/**
 * The sentence being built. Lives outside any screen so it survives navigation,
 * and is persisted so it survives the app being closed or interrupted.
 * Items are snapshots: editing a button later never silently rewrites a sentence.
 */
import { create } from 'zustand';

import * as repo from '@/db/repo';
import { asQuestion, joinWords } from '@/i18n/join';
import { newId } from '@/services/ids';

export interface SentenceItem {
  key: string;
  buttonId: string | null;
  label: string;
  spoken: string;
  lang: string | null;
  symbol: string | null;
  photo: string | null;
  audio: string | null;
}

interface SentenceState {
  items: SentenceItem[];
  selected: string | null;
  question: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (item: Omit<SentenceItem, 'key'>) => SentenceItem;
  removeLast: () => void;
  remove: (key: string) => void;
  move: (key: string, delta: number) => void;
  select: (key: string | null) => void;
  clear: () => void;
  toggleQuestion: () => void;
}

const KEY = 'sentence';
let timer: ReturnType<typeof setTimeout> | null = null;

export const useSentence = create<SentenceState>((set, get) => {
  const persist = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const { items, question } = get();
      repo.setKV(KEY, { items, question }).catch(() => {});
    }, 200);
  };

  return {
    items: [],
    selected: null,
    question: false,
    hydrated: false,

    hydrate: async () => {
      const saved = await repo.getKV<{ items: SentenceItem[]; question: boolean }>(KEY).catch(() => null);
      set({
        items: Array.isArray(saved?.items) ? saved!.items : [],
        question: !!saved?.question,
        hydrated: true,
      });
    },

    add: (item) => {
      const full: SentenceItem = { ...item, key: newId('sent') };
      set({ items: [...get().items, full], selected: null });
      persist();
      return full;
    },

    removeLast: () => {
      set({ items: get().items.slice(0, -1), selected: null });
      persist();
    },

    remove: (key) => {
      set({ items: get().items.filter((i) => i.key !== key), selected: null });
      persist();
    },

    move: (key, delta) => {
      const list = [...get().items];
      const from = list.findIndex((i) => i.key === key);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= list.length) return;
      const [x] = list.splice(from, 1);
      list.splice(to, 0, x);
      set({ items: list });
      persist();
    },

    select: (key) => set({ selected: get().selected === key ? null : key }),

    clear: () => {
      set({ items: [], selected: null, question: false });
      persist();
    },

    toggleQuestion: () => {
      set({ question: !get().question });
      persist();
    },
  };
});

/** The text of a sentence, as shown and spoken. Never rewritten beyond joining. */
export function sentenceText(items: SentenceItem[], question = false) {
  const text = joinWords(items.map((i) => i.label));
  return question ? asQuestion(text) : text;
}
