/**
 * Subscription Plan interfaces
 */

export enum PlanStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export enum PlanType {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export interface ISubscriptionFeatures {
  // Product limits
  maxProducts: number;
  maxCategories: number;
  maxSuppliers: number;
  maxCustomers: number;
  
  // Image limits
  maxImagesPerProduct: number;
  maxImageStorage: number; // in MB
  
  // User limits
  maxUsers: number;
  
  // Advanced features
  advancedReports: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  
  // Inventory features
  lowStockAlerts: boolean;
  barcodeScanning: boolean;
  inventoryTracking: boolean;
  multiLocation: boolean;
  
  // Integration features
  stripeIntegration: boolean;
  emailIntegration: boolean;
  exportData: boolean;
  backupData: boolean;
}

export interface IPlanPricing {
  monthly: number; // in cents
  yearly?: number; // in cents
  currency: string;
  
  // Setup fees
  setupFee?: number;
  
  // Overage pricing
  overagePrice?: number;
  overageUnit?: string;
}
