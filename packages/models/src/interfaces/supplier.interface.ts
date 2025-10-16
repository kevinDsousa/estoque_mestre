/**
 * Supplier related interfaces
 */

export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED'
}

export enum SupplierType {
  MANUFACTURER = 'MANUFACTURER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  WHOLESALER = 'WHOLESALER',
  RETAILER = 'RETAILER'
}

export interface ISupplierContact {
  name: string;
  email: string;
  phone: string;
  position?: string;
  isPrimary: boolean;
}

export interface ISupplierAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isMainAddress: boolean;
}

export interface SupplierPaymentTerms {
  paymentMethod: 'CASH' | 'CREDIT' | 'INSTALLMENTS';
  creditLimit?: number;
  paymentDays: number;
  discountPercentage?: number;
  discountDays?: number;
}

export interface ISupplierRating {
  quality: number; // 1-5
  delivery: number; // 1-5
  communication: number; // 1-5
  price: number; // 1-5
  overall: number; // 1-5
  lastUpdated: Date;
}





