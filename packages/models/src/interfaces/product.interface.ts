/**
 * Product related interfaces
 */

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export enum ProductType {
  AUTO_PART = 'AUTO_PART',
  ACCESSORY = 'ACCESSORY',
  TOOL = 'TOOL',
  CONSUMABLE = 'CONSUMABLE',
  SERVICE = 'SERVICE'
}

export enum InventoryStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  RESERVED = 'RESERVED',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED'
}

export interface IProductSpecification {
  key: string;
  value: string;
  unit?: string;
}

export interface IProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
  type: 'MAIN' | 'DETAIL' | 'THUMBNAIL' | 'GALLERY';
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
}

export interface IProductAttachment {
  id: string;
  name: string;
  url: string;
  type: 'PDF' | 'DOC' | 'XLS' | 'TXT' | 'OTHER';
  size: number; // in bytes
  description?: string;
  uploadedAt: Date;
}

export interface IProductPricing {
  costPrice: number;
  sellingPrice: number;
  margin: number;
  discountPrice?: number;
  bulkPricing?: {
    minQuantity: number;
    price: number;
  }[];
}

export interface IProductInventory {
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  lastRestockedAt?: Date;
  nextRestockDate?: Date;
}

export interface IProductCompatibility {
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  engineType?: string;
  partNumber?: string;
  oemNumber?: string;
}

export interface IProductSubItem {
  id: string;
  productId: string;
  subProductId: string;
  quantity: number;
  isRequired: boolean;
  notes?: string;
  createdAt: Date;
}

export interface IProductKit {
  id: string;
  name: string;
  description?: string;
  subItems: IProductSubItem[];
  totalCost: number;
  totalSellingPrice: number;
  isActive: boolean;
}
