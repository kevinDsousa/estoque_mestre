/**
 * Customer entity
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { 
  CustomerStatus, 
  CustomerType, 
  ICustomerContact, 
  ICustomerAddress, 
  CustomerPaymentInfo, 
  CustomerPreferences 
} from '../interfaces/customer.interface';

export class Customer implements IBaseEntityWithCompany {
  id!: string;
  name!: string;
  legalName?: string;
  document!: string; // CPF or CNPJ
  type!: CustomerType;
  status!: CustomerStatus;
  companyId!: string;
  
  // Contact information
  contacts!: ICustomerContact[];
  addresses!: ICustomerAddress[];
  
  // Business information
  website?: string;
  description?: string;
  paymentInfo!: CustomerPaymentInfo;
  preferences!: CustomerPreferences;
  
  // Additional fields
  notes?: string;
  tags?: string[];
  birthDate?: Date; // for individuals
  isVip!: boolean;
  totalPurchases!: number;
  lastPurchaseAt?: Date;
  
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<Customer>) {
    Object.assign(this, data);
  }

  // Helper methods
  isActive(): boolean {
    return this.status === CustomerStatus.ACTIVE;
  }

  isIndividual(): boolean {
    return this.type === CustomerType.INDIVIDUAL;
  }

  isBusiness(): boolean {
    return this.type === CustomerType.BUSINESS;
  }

  isWholesale(): boolean {
    return this.type === CustomerType.WHOLESALE;
  }

  getPrimaryContact(): ICustomerContact | undefined {
    return this.contacts.find(contact => contact.isPrimary) || this.contacts[0];
  }

  getBillingAddress(): ICustomerAddress | undefined {
    return this.addresses.find(address => 
      address.type === 'BILLING' || address.type === 'BOTH'
    );
  }

  getShippingAddress(): ICustomerAddress | undefined {
    return this.addresses.find(address => 
      address.type === 'SHIPPING' || address.type === 'BOTH'
    );
  }

  getDisplayName(): string {
    return this.legalName || this.name;
  }

  hasOutstandingBalance(): boolean {
    return !!this.paymentInfo.hasOutstandingBalance;
  }

  getOutstandingAmount(): number {
    return this.paymentInfo.outstandingAmount || 0;
  }

  canReceiveCredit(): boolean {
    return !!(this.paymentInfo.creditLimit && this.paymentInfo.creditLimit > 0);
  }

  getAge(): number | null {
    if (!this.birthDate) return null;
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}
