/**
 * Subscription interfaces
 */

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID'
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  OVERDUE = 'OVERDUE'
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
  
  // Index signature for dynamic access
  [key: string]: boolean | number;
}

export interface ISubscriptionBilling {
  // Billing cycle
  interval: 'month' | 'year';
  intervalCount: number;
  
  // Amounts
  amount: number; // in cents
  currency: string;
  
  // Trial
  trialDays: number;
  trialEnd?: Date;
  
  // Next billing
  nextBillingDate?: Date;
  nextBillingAmount?: number;
  
  // Payment method
  paymentMethodId?: string;
  paymentMethodType?: string;
  
  // Tax information
  taxRate?: number;
  taxAmount?: number;
  
  // Discounts
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed';
  discountEndDate?: Date;
}
