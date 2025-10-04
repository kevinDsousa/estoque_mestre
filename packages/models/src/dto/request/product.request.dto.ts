/**
 * Product Request DTOs with Zod validation
 */

import { z } from 'zod';
import { ProductStatus, ProductType } from '../../interfaces/product.interface';

// Base schemas
const productSpecificationSchema = z.object({
  key: z.string().min(1, 'Chave é obrigatória').max(100),
  value: z.string().min(1, 'Valor é obrigatório').max(500),
  unit: z.string().max(20).optional(),
});

const productImageSchema = z.object({
  url: z.string().url('URL inválida'),
  alt: z.string().max(200).optional(),
  isPrimary: z.boolean().default(false),
  order: z.number().min(0).default(0),
});

const productAttachmentSchema = z.object({
  name: z.string().min(1, 'Nome do anexo é obrigatório').max(200),
  url: z.string().url('URL inválida'),
  type: z.enum(['PDF', 'DOC', 'XLS', 'TXT', 'OTHER']),
  size: z.number().min(0, 'Tamanho deve ser positivo'),
  description: z.string().max(500).optional(),
});

const productSubItemSchema = z.object({
  subProductId: z.string().uuid('ID do subproduto inválido'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
  isRequired: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

const productKitSchema = z.object({
  name: z.string().min(1, 'Nome do kit é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  subItems: z.array(productSubItemSchema).min(1, 'Kit deve ter pelo menos um item'),
  totalCost: z.number().min(0, 'Custo total deve ser positivo'),
  totalSellingPrice: z.number().min(0, 'Preço de venda total deve ser positivo'),
});

const productPricingSchema = z.object({
  costPrice: z.number().min(0, 'Preço de custo deve ser positivo'),
  sellingPrice: z.number().min(0, 'Preço de venda deve ser positivo'),
  discountPrice: z.number().min(0).optional(),
  bulkPricing: z.array(z.object({
    minQuantity: z.number().min(1),
    price: z.number().min(0),
  })).optional(),
});

const productInventorySchema = z.object({
  currentStock: z.number().min(0).default(0),
  minStock: z.number().min(0).default(0),
  maxStock: z.number().min(0).optional(),
  reservedStock: z.number().min(0).default(0),
});

const productCompatibilitySchema = z.object({
  vehicleMake: z.string().max(100).optional(),
  vehicleModel: z.string().max(100).optional(),
  vehicleYear: z.string().max(10).optional(),
  engineType: z.string().max(100).optional(),
  partNumber: z.string().max(100).optional(),
  oemNumber: z.string().max(100).optional(),
});

const productDimensionsSchema = z.object({
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
});

// Create Product DTO
export const CreateProductRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  description: z.string().max(2000).optional(),
  sku: z.string().min(1, 'SKU é obrigatório').max(100),
  barcode: z.string().max(100).optional(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  type: z.nativeEnum(ProductType),
  categoryId: z.string().uuid('ID da categoria inválido'),
  supplierId: z.string().uuid('ID do fornecedor inválido').optional(),
  
  // Product details
  specifications: z.array(productSpecificationSchema).optional(),
  images: z.array(productImageSchema).optional(),
  attachments: z.array(productAttachmentSchema).optional(),
  pricing: productPricingSchema,
  inventory: productInventorySchema,
  compatibility: productCompatibilitySchema.optional(),
  
  // Kit/SubItems
  isKit: z.boolean().default(false),
  subItems: z.array(productSubItemSchema).optional(),
  kitDetails: productKitSchema.optional(),
  
  // Additional fields
  weight: z.number().min(0).optional(),
  dimensions: productDimensionsSchema.optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  warranty: z.number().min(0).optional(),
  expirationDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  
  // SEO
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  keywords: z.array(z.string().max(50)).optional(),
});

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

// Update Product DTO
export const UpdateProductRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200).optional(),
  description: z.string().max(2000).optional(),
  sku: z.string().min(1, 'SKU é obrigatório').max(100).optional(),
  barcode: z.string().max(100).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  type: z.nativeEnum(ProductType).optional(),
  categoryId: z.string().uuid('ID da categoria inválido').optional(),
  supplierId: z.string().uuid('ID do fornecedor inválido').optional(),
  
  // Product details
  specifications: z.array(productSpecificationSchema).optional(),
  images: z.array(productImageSchema).optional(),
  attachments: z.array(productAttachmentSchema).optional(),
  pricing: productPricingSchema.partial().optional(),
  inventory: productInventorySchema.partial().optional(),
  compatibility: productCompatibilitySchema.partial().optional(),
  
  // Kit/SubItems
  isKit: z.boolean().optional(),
  subItems: z.array(productSubItemSchema).optional(),
  kitDetails: productKitSchema.partial().optional(),
  
  // Additional fields
  weight: z.number().min(0).optional(),
  dimensions: productDimensionsSchema.partial().optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  warranty: z.number().min(0).optional(),
  expirationDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  
  // SEO
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  keywords: z.array(z.string().max(50)).optional(),
});

export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;

// Product Search DTO
export const ProductSearchRequestSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  type: z.nativeEnum(ProductType).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  lowStock: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'sku', 'price', 'stock', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ProductSearchRequest = z.infer<typeof ProductSearchRequestSchema>;

// Inventory Adjustment DTO
export const InventoryAdjustmentRequestSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z.number().int('Quantidade deve ser um número inteiro'),
  reason: z.string().min(1, 'Motivo é obrigatório').max(200),
  notes: z.string().max(500).optional(),
});

export type InventoryAdjustmentRequest = z.infer<typeof InventoryAdjustmentRequestSchema>;
