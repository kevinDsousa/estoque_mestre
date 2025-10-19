/**
 * Application Constants
 */

export const APP_CONSTANTS = {
  // Application Info
  APP_NAME: 'Estoque Mestre',
  APP_VERSION: '1.0.0',
  
  // API Configuration
  API_TIMEOUT: 30000, // 30 seconds
  API_RETRY_ATTEMPTS: 3,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  
  // Cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  CACHE_MAX_SIZE: 100,
  
  // Notifications
  NOTIFICATION_DURATION: 5000, // 5 seconds
  MAX_NOTIFICATIONS: 5,
  
  // Validation
  PASSWORD_MIN_LENGTH: 8,
  SKU_MIN_LENGTH: 3,
  SKU_MAX_LENGTH: 50,
  
  // Date Formats
  DATE_FORMAT: 'dd/MM/yyyy',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  TIME_FORMAT: 'HH:mm',
  
  // Currency
  DEFAULT_CURRENCY: 'BRL',
  CURRENCY_SYMBOL: 'R$',
  
  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    COMPANY_DATA: 'company_data',
    THEME: 'theme',
    LANGUAGE: 'language',
    SETTINGS: 'settings'
  },
  
  // Routes
  ROUTES: {
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    SUPPLIERS: '/suppliers',
    CUSTOMERS: '/customers',
    TRANSACTIONS: '/transactions',
    REPORTS: '/reports',
    SETTINGS: '/settings',
    PROFILE: '/profile',
    UNAUTHORIZED: '/unauthorized',
    NOT_FOUND: '/404'
  },
  
  // User Roles
  USER_ROLES: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    EMPLOYEE: 'EMPLOYEE'
  },
  
  // User Permissions
  USER_PERMISSIONS: {
    CAN_CREATE_USERS: 'canCreateUsers',
    CAN_DELETE_USERS: 'canDeleteUsers',
    CAN_MANAGE_PRODUCTS: 'canManageProducts',
    CAN_MANAGE_CATEGORIES: 'canManageCategories',
    CAN_MANAGE_INVENTORY: 'canManageInventory',
    CAN_VIEW_REPORTS: 'canViewReports',
    CAN_MANAGE_COMPANY: 'canManageCompany',
    CAN_MANAGE_SUPPLIERS: 'canManageSuppliers',
    CAN_MANAGE_CUSTOMERS: 'canManageCustomers'
  },
  
  // Company Status
  COMPANY_STATUS: {
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    INACTIVE: 'INACTIVE'
  },
  
  // Product Status
  PRODUCT_STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    DISCONTINUED: 'DISCONTINUED'
  },
  
  // Transaction Status
  TRANSACTION_STATUS: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  },
  
  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
    REFUNDED: 'REFUNDED'
  },
  
  // Image Sizes
  IMAGE_SIZES: {
    THUMBNAIL: { width: 150, height: 150 },
    SMALL: { width: 300, height: 300 },
    MEDIUM: { width: 600, height: 600 },
    LARGE: { width: 1200, height: 1200 }
  },
  
  // Chart Colors
  CHART_COLORS: [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF'
  ],
  
  // Regex Patterns
  REGEX_PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/,
    CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    CEP: /^\d{5}-\d{3}$/,
    SKU: /^[A-Z0-9-_]+$/,
    URL: /^https?:\/\/.+/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    REQUIRED: 'Este campo é obrigatório',
    EMAIL_INVALID: 'Email inválido',
    PHONE_INVALID: 'Telefone inválido',
    CPF_INVALID: 'CPF inválido',
    CNPJ_INVALID: 'CNPJ inválido',
    CEP_INVALID: 'CEP inválido',
    PASSWORD_WEAK: 'Senha deve conter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial',
    SKU_INVALID: 'SKU deve conter apenas letras maiúsculas, números, hífens e underscores',
    FILE_TOO_LARGE: 'Arquivo muito grande. Máximo 10MB',
    FILE_TYPE_INVALID: 'Tipo de arquivo não permitido',
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
    SERVER_ERROR: 'Erro interno do servidor',
    UNAUTHORIZED: 'Não autorizado',
    FORBIDDEN: 'Acesso negado',
    NOT_FOUND: 'Recurso não encontrado'
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    SAVED: 'Salvo com sucesso',
    UPDATED: 'Atualizado com sucesso',
    DELETED: 'Excluído com sucesso',
    CREATED: 'Criado com sucesso',
    LOGIN: 'Login realizado com sucesso',
    LOGOUT: 'Logout realizado com sucesso',
    PASSWORD_CHANGED: 'Senha alterada com sucesso',
    PROFILE_UPDATED: 'Perfil atualizado com sucesso'
  }
} as const;

// Type definitions for better TypeScript support
export type UserRole = typeof APP_CONSTANTS.USER_ROLES[keyof typeof APP_CONSTANTS.USER_ROLES];
export type UserPermission = typeof APP_CONSTANTS.USER_PERMISSIONS[keyof typeof APP_CONSTANTS.USER_PERMISSIONS];
export type CompanyStatus = typeof APP_CONSTANTS.COMPANY_STATUS[keyof typeof APP_CONSTANTS.COMPANY_STATUS];
export type ProductStatus = typeof APP_CONSTANTS.PRODUCT_STATUS[keyof typeof APP_CONSTANTS.PRODUCT_STATUS];
export type TransactionStatus = typeof APP_CONSTANTS.TRANSACTION_STATUS[keyof typeof APP_CONSTANTS.TRANSACTION_STATUS];
export type PaymentStatus = typeof APP_CONSTANTS.PAYMENT_STATUS[keyof typeof APP_CONSTANTS.PAYMENT_STATUS];
