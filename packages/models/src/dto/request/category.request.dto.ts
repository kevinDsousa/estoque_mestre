/**
 * Category Request DTOs with Zod validation
 */

import { z } from 'zod';
import { CategoryStatus } from '../../interfaces/category.interface';

// Base schemas
const categorySettingsSchema = z.object({
  allowSubcategories: z.boolean().default(true),
  requireSpecifications: z.boolean().default(false),
  customFields: z.array(z.object({
    name: z.string().min(1, 'Nome do campo é obrigatório').max(100),
    type: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT']),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
  })).optional(),
});

const categorySEOSchema = z.object({
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  keywords: z.array(z.string().max(50)).optional(),
  slug: z.string().min(1, 'Slug é obrigatório').max(200).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
});

// Create Category DTO
export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  slug: z.string().min(1, 'Slug é obrigatório').max(200).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  status: z.nativeEnum(CategoryStatus).default(CategoryStatus.ACTIVE),
  parentId: z.string().uuid('ID do pai inválido').optional(),
  settings: categorySettingsSchema.optional(),
  seo: categorySEOSchema.optional(),
  image: z.string().url('URL da imagem inválida').optional(),
  icon: z.string().max(100).optional(),
  sortOrder: z.number().min(0).default(0),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;

// Update Category DTO
export const UpdateCategoryRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200).optional(),
  description: z.string().max(1000).optional(),
  slug: z.string().min(1, 'Slug é obrigatório').max(200).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens').optional(),
  status: z.nativeEnum(CategoryStatus).optional(),
  parentId: z.string().uuid('ID do pai inválido').optional(),
  settings: categorySettingsSchema.partial().optional(),
  seo: categorySEOSchema.partial().optional(),
  image: z.string().url('URL da imagem inválida').optional(),
  icon: z.string().max(100).optional(),
  sortOrder: z.number().min(0).optional(),
});

export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;

// Category Search DTO
export const CategorySearchRequestSchema = z.object({
  query: z.string().optional(),
  status: z.nativeEnum(CategoryStatus).optional(),
  parentId: z.string().uuid().optional(),
  hasProducts: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'sortOrder', 'createdAt']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CategorySearchRequest = z.infer<typeof CategorySearchRequestSchema>;

// Category Hierarchy DTO
export const CategoryHierarchyRequestSchema = z.object({
  categoryId: z.string().uuid('ID da categoria inválido'),
  newParentId: z.string().uuid('ID do novo pai inválido').optional(),
  sortOrder: z.number().min(0).optional(),
});

export type CategoryHierarchyRequest = z.infer<typeof CategoryHierarchyRequestSchema>;

