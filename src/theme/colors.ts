export interface ThemeColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  danger: string;
  warmupBackground: string;
  border: string;
  cardBackground: string;
}

export const LightColors: ThemeColors = {
  primary: '#2E7D52',
  primaryLight: '#4CAF80',
  secondary: '#1A6B8A',
  secondaryLight: '#3A8FA8',
  background: '#F7FAF8',
  surface: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7C6E',
  accent: '#A8D5BA',
  danger: '#C0392B',
  warmupBackground: '#0A0F0B',
  border: '#D8E8DC',
  cardBackground: '#FFFFFF',
};

export const DarkColors: ThemeColors = {
  primary: '#4CAF80',
  primaryLight: '#6EC99A',
  secondary: '#3A8FA8',
  secondaryLight: '#5AAFC8',
  background: '#121A15',
  surface: '#1E2B23',
  textPrimary: '#E8F5EE',
  textSecondary: '#6B7C6E',
  accent: '#A8D5BA',
  danger: '#E05446',
  warmupBackground: '#0A0F0B',
  border: '#2A3D2E',
  cardBackground: '#1E2B23',
};

export function getColors(isDark: boolean): ThemeColors {
  return isDark ? DarkColors : LightColors;
}
