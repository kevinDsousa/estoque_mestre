/**
 * Catalog entity for standard records
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { 
  CatalogType, 
  CatalogStatus,
  ICurrency,
  ISector,
  IBrand,
  IUnitOfMeasure,
  IPaymentTerm,
  IDocumentType,
  IVehicleMake,
  IVehicleModel,
  IVehicleYear,
  IEngineType,
  CatalogItem
} from '../interfaces/catalog.interface';

export class Catalog implements IBaseEntityWithCompany {
  id!: string;
  type!: CatalogType;
  name!: string;
  code!: string;
  description?: string;
  companyId!: string;
  status!: CatalogStatus;
  
  // Metadata for specific types
  metadata?: Record<string, any>;
  
  // Hierarchy support (for sectors, etc.)
  parentId?: string;
  level: number = 0;
  path: string[] = [];
  fullPath: string = '';
  
  // Ordering and defaults
  sortOrder: number = 0;
  isDefault: boolean = false;
  
  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;

  // Relations
  parent?: Catalog;
  children?: Catalog[];

  constructor(data: Partial<Catalog>) {
    Object.assign(this, data);
  }

  // Helper methods
  isActive(): boolean {
    return this.status === CatalogStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this.status === CatalogStatus.INACTIVE;
  }

  isRoot(): boolean {
    return !this.parentId;
  }

  hasChildren(): boolean {
    return !!(this.children && this.children.length > 0);
  }

  getLevel(): number {
    return this.level;
  }

  getFullPath(): string {
    return this.fullPath;
  }

  isDefaultItem(): boolean {
    return this.isDefault;
  }

  // Type-specific methods
  isCurrency(): boolean {
    return this.type === CatalogType.CURRENCY;
  }

  isSector(): boolean {
    return this.type === CatalogType.SECTOR;
  }

  isBrand(): boolean {
    return this.type === CatalogType.BRAND;
  }

  isUnitOfMeasure(): boolean {
    return this.type === CatalogType.UNIT_OF_MEASURE;
  }

  isPaymentTerm(): boolean {
    return this.type === CatalogType.PAYMENT_TERM;
  }

  isDocumentType(): boolean {
    return this.type === CatalogType.DOCUMENT_TYPE;
  }

  isVehicleMake(): boolean {
    return this.type === CatalogType.VEHICLE_MAKE;
  }

  isVehicleModel(): boolean {
    return this.type === CatalogType.VEHICLE_MODEL;
  }

  isVehicleYear(): boolean {
    return this.type === CatalogType.VEHICLE_YEAR;
  }

  isEngineType(): boolean {
    return this.type === CatalogType.ENGINE_TYPE;
  }

  // ICurrency specific methods
  getCurrencyCode(): string | undefined {
    return this.isCurrency() ? this.code : undefined;
  }

  getCurrencySymbol(): string | undefined {
    return this.isCurrency() ? this.metadata?.symbol : undefined;
  }

  getExchangeRate(): number | undefined {
    return this.isCurrency() ? this.metadata?.exchangeRate : undefined;
  }

  // ISector specific methods
  getSectorCode(): string | undefined {
    return this.isSector() ? this.code : undefined;
  }

  // IBrand specific methods
  getBrandCode(): string | undefined {
    return this.isBrand() ? this.code : undefined;
  }

  getBrandLogo(): string | undefined {
    return this.isBrand() ? this.metadata?.logo : undefined;
  }

  getBrandWebsite(): string | undefined {
    return this.isBrand() ? this.metadata?.website : undefined;
  }

  // Unit of measure specific methods
  getUnitSymbol(): string | undefined {
    return this.isUnitOfMeasure() ? this.metadata?.symbol : undefined;
  }

  getUnitType(): string | undefined {
    return this.isUnitOfMeasure() ? this.metadata?.type : undefined;
  }

  getConversionFactor(): number | undefined {
    return this.isUnitOfMeasure() ? this.metadata?.conversionFactor : undefined;
  }

  // Payment term specific methods
  getPaymentDays(): number | undefined {
    return this.isPaymentTerm() ? this.metadata?.days : undefined;
  }

  // Document type specific methods
  getDocumentFormat(): string | undefined {
    return this.isDocumentType() ? this.metadata?.format : undefined;
  }

  getDocumentMask(): string | undefined {
    return this.isDocumentType() ? this.metadata?.mask : undefined;
  }

  isDocumentRequired(): boolean | undefined {
    return this.isDocumentType() ? this.metadata?.isRequired : undefined;
  }

  // Vehicle specific methods
  getVehicleMakeCode(): string | undefined {
    return this.isVehicleMake() ? this.code : undefined;
  }

  getVehicleModelCode(): string | undefined {
    return this.isVehicleModel() ? this.code : undefined;
  }

  getVehicleYear(): number | undefined {
    return this.isVehicleYear() ? parseInt(this.code) : undefined;
  }

  getEngineTypeCode(): string | undefined {
    return this.isEngineType() ? this.code : undefined;
  }

  getEngineDisplacement(): number | undefined {
    return this.isEngineType() ? this.metadata?.displacement : undefined;
  }

  getEngineCylinders(): number | undefined {
    return this.isEngineType() ? this.metadata?.cylinders : undefined;
  }

  getEngineFuelType(): string | undefined {
    return this.isEngineType() ? this.metadata?.fuelType : undefined;
  }
}


