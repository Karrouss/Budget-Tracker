/** Curated pickable icons (ionicons names) and accent colors for the category form. */

export const CATEGORY_ICONS: string[] = [
  'wallet',
  'car',
  'home',
  'cart',
  'restaurant',
  'heart',
  'medkit',
  'school',
  'gift',
  'airplane',
  'game-controller',
  'paw',
  'fitness',
  'book',
  'musical-notes',
  'ellipsis-horizontal',
];

export const CATEGORY_COLORS: string[] = [
  '#5e35b1',
  '#d32f2f',
  '#2e7d32',
  '#1565c0',
  '#ef6c00',
  '#ad1457',
  '#00796b',
  '#4527a0',
];

export const DEFAULT_CATEGORY_ICON = CATEGORY_ICONS[0];
export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS[0];

/** Deterministic fallback color for categories created before icon/color existed. */
export function fallbackColorForIndex(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}
