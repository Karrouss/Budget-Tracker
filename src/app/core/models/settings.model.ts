export type ThemeMode = 'system' | 'light' | 'dark';

export interface Settings {
  currency: string;
  theme: ThemeMode;
  firstDayOfMonth: number;
  /** Daily "did you log your expenses?" local notification. */
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm
  /** In-app alert when a category crosses 80% / 100% of its budget. */
  budgetAlertsEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  currency: 'EUR',
  theme: 'system',
  firstDayOfMonth: 1,
  reminderEnabled: false,
  reminderTime: '20:00',
  budgetAlertsEnabled: true,
};
