/**
 * Theme Interfaces
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  primaryColor: string;
  accentColor: string;
  customColors?: Partial<ThemeColors>;
  fontSize?: 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  density?: 'compact' | 'comfortable' | 'spacious';
}

export interface ThemeState {
  currentTheme: ThemeConfig;
  isDarkMode: boolean;
  systemPreference: 'light' | 'dark';
}
