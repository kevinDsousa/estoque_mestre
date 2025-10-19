import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { APP_CONSTANTS } from '../utils/constants';
import { ThemeMode, ColorScheme, ThemeConfig, ThemeColors } from '../interfaces/theme.interface';

// Re-export interfaces for external use
export { ThemeMode, ColorScheme, ThemeConfig, ThemeColors } from '../interfaces/theme.interface';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeConfig>(this.getDefaultTheme());
  public theme$ = this.themeSubject.asObservable();

  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  private readonly STORAGE_KEY = APP_CONSTANTS.STORAGE_KEYS.THEME;

  constructor(private storageService: StorageService) {
    this.initializeTheme();
    this.setupSystemThemeListener();
  }

  /**
   * Get current theme configuration
   */
  getCurrentTheme(): ThemeConfig {
    return this.themeSubject.value;
  }

  /**
   * Get current theme as observable
   */
  getTheme(): Observable<ThemeConfig> {
    return this.theme$;
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  /**
   * Get dark mode state as observable
   */
  getDarkModeState(): Observable<boolean> {
    return this.isDarkMode$;
  }

  /**
   * Set theme mode
   */
  setThemeMode(mode: ThemeMode): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = { ...currentTheme, mode };
    
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
  }

  /**
   * Set color scheme
   */
  setColorScheme(colorScheme: ColorScheme): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = { 
      ...currentTheme, 
      colorScheme,
      primaryColor: this.getColorSchemeColors(colorScheme).primary,
      accentColor: this.getColorSchemeColors(colorScheme).accent
    };
    
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
  }

  /**
   * Set custom colors
   */
  setCustomColors(colors: { [key: string]: string }): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = { 
      ...currentTheme, 
      customColors: { ...currentTheme.customColors, ...colors }
    };
    
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode(): void {
    const currentTheme = this.getCurrentTheme();
    const newMode = currentTheme.mode === 'dark' ? 'light' : 'dark';
    this.setThemeMode(newMode);
  }

  /**
   * Reset theme to default
   */
  resetTheme(): void {
    const defaultTheme = this.getDefaultTheme();
    this.applyTheme(defaultTheme);
    this.saveTheme(defaultTheme);
  }

  /**
   * Get theme colors for current configuration
   */
  getThemeColors(): ThemeColors {
    const theme = this.getCurrentTheme();
    const isDark = this.isDarkMode();
    const colorScheme = this.getColorSchemeColors(theme.colorScheme);

    if (isDark) {
      return {
        primary: colorScheme.primary,
        secondary: colorScheme.secondary,
        accent: colorScheme.accent,
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff',
        textSecondary: '#b3b3b3',
        border: '#333333',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3'
      };
    } else {
      return {
        primary: colorScheme.primary,
        secondary: colorScheme.secondary,
        accent: colorScheme.accent,
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#212121',
        textSecondary: '#757575',
        border: '#e0e0e0',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3'
      };
    }
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: ThemeConfig): void {
    const isDark = this.shouldUseDarkMode(theme);
    const colors = this.getThemeColors();
    
    // Update theme subject
    this.themeSubject.next(theme);
    this.isDarkModeSubject.next(isDark);

    // Apply CSS custom properties
    const root = document.documentElement;
    
    // Set color scheme
    root.setAttribute('data-theme', theme.colorScheme);
    root.setAttribute('data-mode', isDark ? 'dark' : 'light');

    // Set CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set primary and accent colors
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-accent', theme.accentColor);

    // Apply custom colors if any
    if (theme.customColors) {
      Object.entries(theme.customColors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }

    // Update meta theme-color
    this.updateMetaThemeColor(theme.primaryColor);
  }

  /**
   * Initialize theme from storage or system preference
   */
  private initializeTheme(): void {
    const savedTheme = this.storageService.getItemAsObject<ThemeConfig>(this.STORAGE_KEY);
    
    if (savedTheme) {
      this.applyTheme(savedTheme);
    } else {
      const defaultTheme = this.getDefaultTheme();
      this.applyTheme(defaultTheme);
    }
  }

  /**
   * Setup system theme change listener
   */
  private setupSystemThemeListener(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        const currentTheme = this.getCurrentTheme();
        if (currentTheme.mode === 'auto') {
          this.applyTheme(currentTheme);
        }
      });
    }
  }

  /**
   * Check if should use dark mode based on theme configuration
   */
  private shouldUseDarkMode(theme: ThemeConfig): boolean {
    switch (theme.mode) {
      case 'dark':
        return true;
      case 'light':
        return false;
      case 'auto':
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      default:
        return false;
    }
  }

  /**
   * Get default theme configuration
   */
  private getDefaultTheme(): ThemeConfig {
    return {
      mode: 'auto',
      colorScheme: 'blue',
      primaryColor: '#1976d2',
      accentColor: '#ff4081',
      fontSize: 'medium',
      borderRadius: 'medium',
      density: 'comfortable'
    };
  }

  /**
   * Get color scheme colors
   */
  private getColorSchemeColors(scheme: ColorScheme): { primary: string; secondary: string; accent: string } {
    const schemes = {
      blue: {
        primary: '#1976d2',
        secondary: '#424242',
        accent: '#ff4081'
      },
      green: {
        primary: '#388e3c',
        secondary: '#424242',
        accent: '#ff4081'
      },
      purple: {
        primary: '#7b1fa2',
        secondary: '#424242',
        accent: '#ff4081'
      },
      orange: {
        primary: '#f57c00',
        secondary: '#424242',
        accent: '#ff4081'
      },
      red: {
        primary: '#d32f2f',
        secondary: '#424242',
        accent: '#ff4081'
      }
    };

    return schemes[scheme];
  }

  /**
   * Save theme to storage
   */
  private saveTheme(theme: ThemeConfig): void {
    this.storageService.setItem(this.STORAGE_KEY, theme);
  }

  /**
   * Update meta theme-color
   */
  private updateMetaThemeColor(color: string): void {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.setAttribute('content', color);
  }

  /**
   * Get available color schemes
   */
  getAvailableColorSchemes(): Array<{ value: ColorScheme; label: string; primary: string }> {
    return [
      { value: 'blue', label: 'Azul', primary: '#1976d2' },
      { value: 'green', label: 'Verde', primary: '#388e3c' },
      { value: 'purple', label: 'Roxo', primary: '#7b1fa2' },
      { value: 'orange', label: 'Laranja', primary: '#f57c00' },
      { value: 'red', label: 'Vermelho', primary: '#d32f2f' }
    ];
  }

  /**
   * Get available theme modes
   */
  getAvailableThemeModes(): Array<{ value: ThemeMode; label: string }> {
    return [
      { value: 'light', label: 'Claro' },
      { value: 'dark', label: 'Escuro' },
      { value: 'auto', label: 'Automático' }
    ];
  }
}
