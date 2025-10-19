/**
 * Settings Interfaces
 */

export interface UserSettings {
  theme: {
    mode: 'light' | 'dark' | 'auto';
    colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    customColors?: Record<string, string>;
  };
  language: {
    code: string;
    name: string;
    dateFormat: string;
    timeFormat: string;
    currency: string;
    numberFormat: string;
  };
  layout: {
    sidebar: {
      collapsed: boolean;
      position: 'left' | 'right';
      width: number;
      overlay: boolean;
    };
    header: {
      height: number;
      fixed: boolean;
      showBreadcrumb: boolean;
      showSearch: boolean;
      showUserMenu: boolean;
    };
    footer: {
      height: number;
      show: boolean;
      fixed: boolean;
    };
    content: {
      padding: number;
      maxWidth: number;
      fluid: boolean;
    };
    sidebarCollapsed: boolean;
    sidebarPosition: 'left' | 'right';
    headerHeight: number;
    sidebarWidth: number;
  };
  notifications: {
    enabled: boolean;
    types: {
      success: boolean;
      error: boolean;
      warning: boolean;
      info: boolean;
      system: boolean;
      updates: boolean;
      alerts: boolean;
      reports: boolean;
    };
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
  dashboard: {
    widgets: string[];
    refreshInterval: number;
    autoRefresh: boolean;
    defaultView: 'overview' | 'analytics' | 'reports';
  };
  tables: {
    pageSize: number;
    defaultPageSize: number;
    showPagination: boolean;
    showFilters: boolean;
    showSorting: boolean;
    striped: boolean;
    hover: boolean;
    showRowNumbers: boolean;
    stripedRows: boolean;
    hoverRows: boolean;
  };
  forms: {
    autoSave: boolean;
    autoSaveInterval: number;
    validation: 'immediate' | 'onBlur' | 'onSubmit';
    showHelpText: boolean;
    showRequiredIndicator: boolean;
    showValidationMessages: boolean;
    confirmBeforeSubmit: boolean;
  };
  security: {
    sessionTimeout: number;
    twoFactorEnabled: boolean;
    twoFactorAuth: boolean;
    passwordExpiry: number;
    loginAttempts: number;
    requirePasswordChange: boolean;
    loginNotifications: boolean;
  };
  privacy: {
    analytics: boolean;
    errorReporting: boolean;
    crashReporting: boolean;
    telemetry: boolean;
    usageStatistics: boolean;
    personalizedAds: boolean;
  };
  advanced: {
    debugMode: boolean;
    experimentalFeatures: boolean;
    betaFeatures: boolean;
    developerMode: boolean;
    apiTimeout: number;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
}
