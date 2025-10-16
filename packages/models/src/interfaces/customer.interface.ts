/**
 * Customer related interfaces
 */

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED'
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  WHOLESALE = 'WHOLESALE'
}

export interface ICustomerContact {
  name: string;
  email: string;
  phone: string;
  position?: string;
  isPrimary: boolean;
}

export interface ICustomerAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isMainAddress: boolean;
  type: 'BILLING' | 'SHIPPING' | 'BOTH';
}

export interface CustomerPaymentInfo {
  preferredPaymentMethod: 'CASH' | 'CREDIT' | 'PIX' | 'CARD';
  creditLimit?: number;
  paymentTerms?: number; // days
  hasOutstandingBalance: boolean;
  outstandingAmount?: number;
}

export interface CustomerPreferences {
  preferredContactMethod: 'EMAIL' | 'PHONE' | 'SMS';
  receivePromotions: boolean;
  receiveNewsletter: boolean;
  language: string;
  timezone: string;
}





