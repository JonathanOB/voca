import type { Href } from 'expo-router';

import type { QuickActionId } from '@/store/settings';
import type { CardColor } from '@/theme/colors';

export const QUICK_ACTIONS: Record<QuickActionId, { emoji: string; color: CardColor; href: Href }> = {
  talk: { emoji: '💬', color: 'purple', href: '/communicate' },
  favourites: { emoji: '⭐', color: 'yellow', href: '/library/favourites' },
  myday: { emoji: '🗓️', color: 'green', href: '/my-day' },
  firstthen: { emoji: '1️⃣', color: 'sky', href: '/my-day/first-then' },
  routines: { emoji: '🧼', color: 'mint', href: '/my-day/routines' },
  choices: { emoji: '👆', color: 'coral', href: '/choices' },
  feelings: { emoji: '😊', color: 'yellow', href: '/feelings' },
  sensory: { emoji: '🎧', color: 'sky', href: '/feelings/sensory' },
  body: { emoji: '🩹', color: 'peach', href: '/feelings/body' },
  keyboard: { emoji: '⌨️', color: 'purple', href: '/communicate/keyboard' },
  waiting: { emoji: '⏳', color: 'peach', href: '/my-day/waiting' },
  library: { emoji: '📚', color: 'green', href: '/library' },
  myboards: { emoji: '🗂️', color: 'pink', href: '/my-boards' },
  safety: { emoji: '🆘', color: 'coral', href: '/safety' },
};

export const MAX_QUICK_ACTIONS = 6;
