export const environment = {
  production: true,
  apiUrl: 'https://api.estoquemestre.com/api',
  appName: 'Estoque Mestre',
  appVersion: '1.0.0',
  features: {
    enableNotifications: true,
    enableAnalytics: true,
    enableReports: true,
    enablePayments: true,
    enableImageUpload: true,
    enableRealTimeUpdates: true
  },
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  cache: {
    defaultTTL: 300000, // 5 minutes
    maxSize: 100
  },
  notifications: {
    defaultDuration: 5000,
    maxNotifications: 5
  }
};
