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

/**
 * Kept visually distinct from one another (CIEDE2000 ΔE ≥ ~20 between any pair)
 * and dark enough for the white category icon drawn on top.
 */
export const CATEGORY_COLORS: string[] = [
  '#5e35b1', // violet
  '#1565c0', // bleu
  '#00838f', // bleu canard
  '#2e7d32', // vert
  '#ef6c00', // orange
  '#d32f2f', // rouge
  '#ad1457', // framboise
  '#6d4c41', // marron
];

export const DEFAULT_CATEGORY_ICON = CATEGORY_ICONS[0];
export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS[0];

/** Deterministic fallback color for categories created before icon/color existed. */
export function fallbackColorForIndex(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}
