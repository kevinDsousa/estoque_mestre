export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Estoque Mestre',
  appVersion: '1.0.0',
  enableLogging: true,
  enableAnalytics: false,
  enableErrorReporting: true,
  features: {
    darkMode: true,
    multiLanguage: true,
    notifications: true,
    offlineMode: false,
    experimentalFeatures: false
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  storage: {
    prefix: 'estoque_mestre_',
    encryption: false
  },
  theme: {
    defaultMode: 'auto',
    defaultColorScheme: 'blue',
    enableCustomColors: true
  },
  language: {
    default: 'pt-BR',
    fallback: 'pt-BR',
    supported: ['pt-BR', 'en-US', 'es-ES']
  },
  notifications: {
    position: 'top-right',
    duration: 5000,
    maxVisible: 5
  },
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 5
  },
  security: {
    sessionTimeout: 60, // minutes
    enableTwoFactor: false,
    passwordMinLength: 8
  }
};