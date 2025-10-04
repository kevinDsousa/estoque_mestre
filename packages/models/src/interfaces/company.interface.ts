/**
 * Company related interfaces
 */

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_APPROVAL = 'PENDING_APPROVAL'
}

export enum CompanyType {
  AUTO_PARTS = 'AUTO_PARTS',
  GENERAL_RETAIL = 'GENERAL_RETAIL',
  WHOLESALE = 'WHOLESALE',
  MANUFACTURING = 'MANUFACTURING'
}

export interface ICompanyAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ICompanyContact {
  email: string;
  phone: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface ICompanySettings {
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  inventorySettings: {
    lowStockThreshold: number;
    autoReorderEnabled: boolean;
    trackExpiration: boolean;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    lowStockAlerts: boolean;
    expirationAlerts: boolean;
  };
}

export interface ICompanyLogo {
  id: string;
  url: string;
  variants?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
  };
  uploadedAt: Date;
}
