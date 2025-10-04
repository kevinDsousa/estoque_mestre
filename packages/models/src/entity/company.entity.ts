/**
 * Company entity
 */

import { IBaseEntity } from '../interfaces/base.interface';
import { 
  CompanyStatus, 
  CompanyType, 
  ICompanyAddress, 
  ICompanyContact, 
  ICompanySettings,
  ICompanyLogo
} from '../interfaces/company.interface';

export class Company implements IBaseEntity {
  id!: string;
  name!: string;
  legalName!: string;
  document!: string; // CNPJ
  type!: CompanyType;
  status!: CompanyStatus;
  address!: ICompanyAddress;
  contact!: ICompanyContact;
  settings!: ICompanySettings;
  logo?: ICompanyLogo;
  description?: string;
  website?: string;
  foundedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<Company>) {
    Object.assign(this, data);
  }

  // Helper methods
  isActive(): boolean {
    return this.status === CompanyStatus.ACTIVE;
  }

  isAutoPartsBusiness(): boolean {
    return this.type === CompanyType.AUTO_PARTS;
  }

  getFullAddress(): string {
    const { street, number, complement, neighborhood, city, state, zipCode } = this.address;
    const parts = [street, number, complement, neighborhood, city, state, zipCode].filter(Boolean);
    return parts.join(', ');
  }

  getDisplayName(): string {
    return this.legalName || this.name;
  }

  // Logo methods
  hasLogo(): boolean {
    return !!(this.logo && this.logo.url);
  }

  getLogoUrl(): string | undefined {
    return this.logo?.url;
  }

  getLogoThumbnail(): string | undefined {
    return this.logo?.variants?.thumbnail || this.logo?.url;
  }

  getLogoSmall(): string | undefined {
    return this.logo?.variants?.small || this.logo?.url;
  }

  getLogoMedium(): string | undefined {
    return this.logo?.variants?.medium || this.logo?.url;
  }

  getLogoLarge(): string | undefined {
    return this.logo?.variants?.large || this.logo?.url;
  }

  getLogoMetadata(): ICompanyLogo['metadata'] | undefined {
    return this.logo?.metadata;
  }

  getLogoSize(): number | undefined {
    return this.logo?.metadata?.size;
  }

  getLogoDimensions(): { width?: number; height?: number } | undefined {
    const metadata = this.getLogoMetadata();
    if (!metadata) return undefined;
    return {
      width: metadata.width,
      height: metadata.height
    };
  }
}
