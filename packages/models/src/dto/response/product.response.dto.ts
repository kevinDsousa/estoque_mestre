/**
 * Product Response DTOs
 */

import { z } from 'zod';
import { ProductStatus, ProductType, InventoryStatus } from '../../interfaces/product.interface';

// Base schemas
const productSpecificationResponseSchema = z.object({
  key: z.string(),
  value: z.string(),
  unit: z.string().optional(),
});

const productImageResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  alt: z.string().optional(),
  isPrimary: z.boolean(),
  order: z.number(),
});

const productAttachmentResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string().url(),
  type: z.enum(['PDF', 'DOC', 'XLS', 'TXT', 'OTHER']),
  size: z.number(),
  description: z.string().optional(),
  uploadedAt: z.date(),
});

const productSubItemResponseSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  subProductId: z.string().uuid(),
  subProductName: z.string(),
  quantity: z.number(),
  isRequired: z.boolean(),
  notes: z.string().optional(),
  createdAt: z.date(),
});

const productKitResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  subItems: z.array(productSubItemResponseSchema),
  totalCost: z.number(),
  totalSellingPrice: z.number(),
  isActive: z.boolean(),
});

const productPricingResponseSchema = z.object({
  costPrice: z.number(),
  sellingPrice: z.number(),
  margin: z.number(),
  discountPrice: z.number().optional(),
  bulkPricing: z.array(z.object({
    minQuantity: z.number(),
    price: z.number(),
  })).optional(),
});

const productInventoryResponseSchema = z.object({
  currentStock: z.number(),
  minStock: z.number(),
  maxStock: z.number().optional(),
  reservedStock: z.number(),
  availableStock: z.number(),
  lastRestockedAt: z.date().optional(),
  nextRestockDate: z.date().optional(),
});

const productCompatibilityResponseSchema = z.object({
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  engineType: z.string().optional(),
  partNumber: z.string().optional(),
  oemNumber: z.string().optional(),
});

const productDimensionsResponseSchema = z.object({
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Product Response DTO
export const ProductResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  sku: z.string(),
  barcode: z.string().optional(),
  status: z.nativeEnum(ProductStatus),
  type: z.nativeEnum(ProductType),
  companyId: z.string().uuid(),
  categoryId: z.string().uuid(),
  supplierId: z.string().uuid().optional(),
  
  // Product details
  specifications: z.array(productSpecificationResponseSchema),
  images: z.array(productImageResponseSchema),
  attachments: z.array(productAttachmentResponseSchema),
  pricing: productPricingResponseSchema,
  inventory: productInventoryResponseSchema,
  compatibility: productCompatibilityResponseSchema.optional(),
  
  // Kit/SubItems
  isKit: z.boolean(),
  subItems: z.array(productSubItemResponseSchema),
  kitDetails: productKitResponseSchema.optional(),
  
  // Additional fields
  weight: z.number().optional(),
  dimensions: productDimensionsResponseSchema.optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  warranty: z.number().optional(),
  expirationDate: z.date().optional(),
  notes: z.string().optional(),
  
  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  slug: z.string(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;

// Product List Response DTO
export const ProductListResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sku: z.string(),
  barcode: z.string().optional(),
  status: z.nativeEnum(ProductStatus),
  type: z.nativeEnum(ProductType),
  categoryId: z.string().uuid(),
  supplierId: z.string().uuid().optional(),
  
  // Product details
  images: z.array(productImageResponseSchema),
  pricing: productPricingResponseSchema,
  inventory: productInventoryResponseSchema,
  compatibility: productCompatibilityResponseSchema.optional(),
  
  // Additional fields
  brand: z.string().optional(),
  model: z.string().optional(),
  slug: z.string(),
  
  createdAt: z.date(),
});

export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

// Product Summary Response DTO
export const ProductSummaryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sku: z.string(),
  status: z.nativeEnum(ProductStatus),
  type: z.nativeEnum(ProductType),
  inventoryStatus: z.nativeEnum(InventoryStatus),
  currentStock: z.number(),
  sellingPrice: z.number(),
  primaryImage: productImageResponseSchema.optional(),
  createdAt: z.date(),
});

export type ProductSummaryResponse = z.infer<typeof ProductSummaryResponseSchema>;

// Inventory Status Response DTO
export const InventoryStatusResponseSchema = z.object({
  productId: z.string().uuid(),
  currentStock: z.number(),
  minStock: z.number(),
  maxStock: z.number().optional(),
  reservedStock: z.number(),
  availableStock: z.number(),
  status: z.nativeEnum(InventoryStatus),
  isLowStock: z.boolean(),
  isOutOfStock: z.boolean(),
  lastRestockedAt: z.date().optional(),
  nextRestockDate: z.date().optional(),
});

export type InventoryStatusResponse = z.infer<typeof InventoryStatusResponseSchema>;
