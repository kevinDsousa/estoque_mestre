/**
 * Supplier entity
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { 
  SupplierStatus, 
  SupplierType, 
  ISupplierContact, 
  ISupplierAddress, 
  SupplierPaymentTerms, 
  ISupplierRating 
} from '../interfaces/supplier.interface';

export class Supplier implements IBaseEntityWithCompany {
  id!: string;
  name!: string;
  legalName?: string;
  document!: string; // CNPJ or CPF
  type!: SupplierType;
  status!: SupplierStatus;
  companyId!: string;
  
  // Contact information
  contacts!: ISupplierContact[];
  addresses!: ISupplierAddress[];
  
  // Business information
  website?: string;
  description?: string;
  paymentTerms!: SupplierPaymentTerms;
  rating!: ISupplierRating;
  
  // Additional fields
  notes?: string;
  tags?: string[];
  isPreferred!: boolean;
  
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<Supplier>) {
    Object.assign(this, data);
  }

  // Helper methods
  isActive(): boolean {
    return this.status === SupplierStatus.ACTIVE;
  }

  isManufacturer(): boolean {
    return this.type === SupplierType.MANUFACTURER;
  }

  isDistributor(): boolean {
    return this.type === SupplierType.DISTRIBUTOR;
  }

  getPrimaryContact(): ISupplierContact | undefined {
    return this.contacts.find(contact => contact.isPrimary) || this.contacts[0];
  }

  getMainAddress(): ISupplierAddress | undefined {
    return this.addresses.find(address => address.isMainAddress) || this.addresses[0];
  }

  getFullAddress(): string {
    const address = this.getMainAddress();
    if (!address) return '';
    
    const { street, number, complement, neighborhood, city, state, zipCode } = address;
    const parts = [street, number, complement, neighborhood, city, state, zipCode].filter(Boolean);
    return parts.join(', ');
  }

  getDisplayName(): string {
    return this.legalName || this.name;
  }

  getOverallRating(): number {
    return this.rating.overall;
  }

  hasGoodRating(): boolean {
    return this.rating.overall >= 4;
  }

  canReceiveCredit(): boolean {
    return this.paymentTerms.paymentMethod === 'CREDIT' && 
           !!(this.paymentTerms.creditLimit && 
           this.paymentTerms.creditLimit > 0);
  }
}
