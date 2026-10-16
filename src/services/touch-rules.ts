/** Pure rules behind the touch settings and drag-to-reorder (kept free of native modules for tests). */

export function isRepeatTap(now: number, last: number, ignoreMs: number) {
  return ignoreMs > 0 && now - last < ignoreMs;
}

/** Long press opens menus. With hold-to-select it comes well after the selection point. */
export function longPressDelay(holdMs: number) {
  return holdMs > 0 ? holdMs + 1200 : 450;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Index of the rectangle whose centre is closest to a point. */
export function nearestIndex(layouts: (Rect | undefined)[], x: number, y: number) {
  let best = -1;
  let bestD = Infinity;
  layouts.forEach((l, i) => {
    if (!l) return;
    const d = Math.hypot(x - (l.x + l.width / 2), y - (l.y + l.height / 2));
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}
