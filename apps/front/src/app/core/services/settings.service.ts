import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { APP_CONSTANTS } from '../utils/constants';
import { UserSettings } from '../interfaces/settings.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<UserSettings>(this.getDefaultSettings());
  public settings$ = this.settingsSubject.asObservable();

  private readonly STORAGE_KEY = APP_CONSTANTS.STORAGE_KEYS.SETTINGS;

  constructor(private storageService: StorageService) {
    this.initializeSettings();
  }

  /**
   * Get current settings
   */
  getCurrentSettings(): UserSettings {
    return this.settingsSubject.value;
  }

  /**
   * Get settings as observable
   */
  getSettings(): Observable<UserSettings> {
    return this.settings$;
  }

  /**
   * Update specific setting
   */
  updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): void {
    const currentSettings = this.getCurrentSettings();
    const newSettings = {
      ...currentSettings,
      [key]: value
    };
    
    this.settingsSubject.next(newSettings);
    this.saveSettings(newSettings);
  }

  /**
   * Update nested setting
   */
  updateNestedSetting<K extends keyof UserSettings, N extends keyof UserSettings[K]>(
    key: K,
    nestedKey: N,
    value: UserSettings[K][N]
  ): void {
    const currentSettings = this.getCurrentSettings();
    const newSettings = {
      ...currentSettings,
      [key]: {
        ...currentSettings[key],
        [nestedKey]: value
      }
    };
    
    this.settingsSubject.next(newSettings);
    this.saveSettings(newSettings);
  }

  /**
   * Reset settings to default
   */
  resetSettings(): void {
    const defaultSettings = this.getDefaultSettings();
    this.settingsSubject.next(defaultSettings);
    this.saveSettings(defaultSettings);
  }

  /**
   * Reset specific setting category
   */
  resetSettingCategory<K extends keyof UserSettings>(key: K): void {
    const currentSettings = this.getCurrentSettings();
    const defaultSettings = this.getDefaultSettings();
    
    const newSettings = {
      ...currentSettings,
      [key]: defaultSettings[key]
    };
    
    this.settingsSubject.next(newSettings);
    this.saveSettings(newSettings);
  }

  /**
   * Export settings
   */
  exportSettings(): string {
    const settings = this.getCurrentSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings
   */
  importSettings(settingsJson: string): boolean {
    try {
      const settings = JSON.parse(settingsJson) as UserSettings;
      
      // Validate settings structure
      if (this.validateSettings(settings)) {
        this.settingsSubject.next(settings);
        this.saveSettings(settings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Array<{ code: string; name: string; dateFormat: string; timeFormat: string; currency: string }> {
    return [
      { code: 'pt-BR', name: 'Português (Brasil)', dateFormat: 'dd/MM/yyyy', timeFormat: 'HH:mm', currency: 'BRL' },
      { code: 'en-US', name: 'English (US)', dateFormat: 'MM/dd/yyyy', timeFormat: 'h:mm a', currency: 'USD' },
      { code: 'es-ES', name: 'Español', dateFormat: 'dd/MM/yyyy', timeFormat: 'HH:mm', currency: 'EUR' }
    ];
  }

  /**
   * Get available page sizes
   */
  getAvailablePageSizes(): number[] {
    return [...APP_CONSTANTS.PAGE_SIZE_OPTIONS];
  }

  /**
   * Get available session timeouts
   */
  getAvailableSessionTimeouts(): Array<{ value: number; label: string }> {
    return [
      { value: 15, label: '15 minutos' },
      { value: 30, label: '30 minutos' },
      { value: 60, label: '1 hora' },
      { value: 120, label: '2 horas' },
      { value: 240, label: '4 horas' },
      { value: 480, label: '8 horas' }
    ];
  }

  /**
   * Get available refresh intervals
   */
  getAvailableRefreshIntervals(): Array<{ value: number; label: string }> {
    return [
      { value: 30, label: '30 segundos' },
      { value: 60, label: '1 minuto' },
      { value: 300, label: '5 minutos' },
      { value: 600, label: '10 minutos' },
      { value: 1800, label: '30 minutos' },
      { value: 3600, label: '1 hora' }
    ];
  }

  /**
   * Initialize settings from storage
   */
  private initializeSettings(): void {
    const savedSettings = this.storageService.getItemAsObject<UserSettings>(this.STORAGE_KEY);
    
    if (savedSettings && this.validateSettings(savedSettings)) {
      this.settingsSubject.next(savedSettings);
    } else {
      const defaultSettings = this.getDefaultSettings();
      this.settingsSubject.next(defaultSettings);
      this.saveSettings(defaultSettings);
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): UserSettings {
    return {
      theme: {
        mode: 'auto',
        colorScheme: 'blue'
      },
      language: {
        code: 'pt-BR',
        name: 'Português (Brasil)',
        dateFormat: 'dd/MM/yyyy',
        timeFormat: 'HH:mm',
        currency: 'BRL',
        numberFormat: 'pt-BR'
      },
      layout: {
        sidebar: {
          collapsed: false,
          position: 'left',
          width: 280,
          overlay: false
        },
        header: {
          height: 64,
          fixed: true,
          showBreadcrumb: true,
          showSearch: true,
          showUserMenu: true
        },
        footer: {
          height: 60,
          show: true,
          fixed: false
        },
        content: {
          padding: 24,
          maxWidth: 1200,
          fluid: false
        },
        sidebarCollapsed: false,
        sidebarPosition: 'left',
        headerHeight: 64,
        sidebarWidth: 280
      },
      notifications: {
        enabled: true,
        types: {
          success: true,
          error: true,
          warning: true,
          info: true,
          system: true,
          updates: true,
          alerts: true,
          reports: false
        },
        sound: true,
        desktop: true,
        email: true
      },
      dashboard: {
        defaultView: 'overview',
        widgets: ['sales', 'inventory', 'recent-transactions'],
        refreshInterval: 300,
        autoRefresh: true
      },
      tables: {
        pageSize: 20,
        defaultPageSize: 20,
        showPagination: true,
        showFilters: true,
        showSorting: true,
        striped: true,
        hover: true,
        showRowNumbers: false,
        stripedRows: true,
        hoverRows: true
      },
      forms: {
        autoSave: true,
        autoSaveInterval: 30,
        validation: 'onBlur',
        showHelpText: true,
        showRequiredIndicator: true,
        showValidationMessages: true,
        confirmBeforeSubmit: false
      },
      security: {
        sessionTimeout: 60,
        twoFactorEnabled: false,
        twoFactorAuth: false,
        passwordExpiry: 90,
        loginAttempts: 5,
        requirePasswordChange: false,
        loginNotifications: true
      },
      privacy: {
        analytics: true,
        errorReporting: true,
        crashReporting: true,
        telemetry: true,
        usageStatistics: true,
        personalizedAds: false
      },
      advanced: {
        debugMode: false,
        experimentalFeatures: false,
        betaFeatures: false,
        developerMode: false,
        apiTimeout: 30000,
        cacheEnabled: true,
        cacheTTL: 300
      }
    };
  }

  /**
   * Validate settings structure
   */
  private validateSettings(settings: any): settings is UserSettings {
    // Basic validation - check if required properties exist
    return (
      settings &&
      typeof settings === 'object' &&
      settings.theme &&
      settings.language &&
      settings.layout &&
      settings.notifications &&
      settings.dashboard &&
      settings.tables &&
      settings.forms &&
      settings.security &&
      settings.privacy &&
      settings.advanced
    );
  }

  /**
   * Save settings to storage
   */
  private saveSettings(settings: UserSettings): void {
    this.storageService.setItem(this.STORAGE_KEY, settings);
  }
}
