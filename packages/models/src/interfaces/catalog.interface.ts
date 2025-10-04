/**
 * Catalog/Standard Records interfaces
 */

export enum CatalogType {
  CURRENCY = 'CURRENCY',
  SECTOR = 'SECTOR',
  BRAND = 'BRAND',
  UNIT_OF_MEASURE = 'UNIT_OF_MEASURE',
  PAYMENT_TERM = 'PAYMENT_TERM',
  DOCUMENT_TYPE = 'DOCUMENT_TYPE',
  VEHICLE_MAKE = 'VEHICLE_MAKE',
  VEHICLE_MODEL = 'VEHICLE_MODEL',
  VEHICLE_YEAR = 'VEHICLE_YEAR',
  ENGINE_TYPE = 'ENGINE_TYPE'
}

export enum CatalogStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface ICurrency {
  id: string;
  code: string; // USD, BRL, EUR, etc.
  name: string;
  symbol: string;
  decimalPlaces: number;
  isDefault: boolean;
  exchangeRate?: number; // against default currency
  lastUpdated?: Date;
}

export interface ISector {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string[];
  fullPath: string;
  isActive: boolean;
}

export interface IBrand {
  id: string;
  name: string;
  code: string;
  description?: string;
  logo?: IBrandLogo;
  website?: string;
  country?: string;
  isActive: boolean;
}

export interface IBrandLogo {
  id: string;
  url: string;
  variants?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
  };
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
  };
  uploadedAt: Date;
}

export interface IUnitOfMeasure {
  id: string;
  name: string;
  code: string;
  symbol: string;
  type: 'WEIGHT' | 'VOLUME' | 'LENGTH' | 'AREA' | 'QUANTITY' | 'TIME' | 'OTHER';
  baseUnit?: string; // for conversions
  conversionFactor?: number; // to base unit
  isActive: boolean;
}

export interface IPaymentTerm {
  id: string;
  name: string;
  code: string;
  days: number;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface IDocumentType {
  id: string;
  name: string;
  code: string;
  format: string; // regex pattern
  mask: string; // display mask
  description?: string;
  isRequired: boolean;
  isActive: boolean;
}

export interface IVehicleMake {
  id: string;
  name: string;
  code: string;
  country?: string;
  logo?: string;
  isActive: boolean;
}

export interface IVehicleModel {
  id: string;
  makeId: string;
  name: string;
  code: string;
  yearFrom?: number;
  yearTo?: number;
  isActive: boolean;
}

export interface IVehicleYear {
  id: string;
  modelId: string;
  year: number;
  isActive: boolean;
}

export interface IEngineType {
  id: string;
  name: string;
  code: string;
  displacement?: number; // in cc
  cylinders?: number;
  fuelType?: 'GASOLINE' | 'DIESEL' | 'ETHANOL' | 'FLEX' | 'ELECTRIC' | 'HYBRID';
  description?: string;
  isActive: boolean;
}

export interface CatalogItem {
  id: string;
  type: CatalogType;
  name: string;
  code: string;
  description?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
