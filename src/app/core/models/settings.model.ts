export type ThemeMode = 'system' | 'light' | 'dark';

export interface Settings {
  currency: string;
  theme: ThemeMode;
  firstDayOfMonth: number;
}

export const DEFAULT_SETTINGS: Settings = {
  currency: 'EUR',
  theme: 'system',
  firstDayOfMonth: 1,
};
