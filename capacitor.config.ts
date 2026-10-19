import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budgettracker.app',
  appName: 'Budget Tracker',
  webDir: 'www',
  plugins: {
    LocalNotifications: {
      // Monochrome status-bar icon: android/app/src/main/res/drawable/ic_stat_wallet.xml
      smallIcon: 'ic_stat_wallet',
      iconColor: '#2E7D32',
    },
  },
};

export default config;
