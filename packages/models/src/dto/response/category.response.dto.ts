/**
 * Category Response DTOs
 */

import { z } from 'zod';
import { CategoryStatus } from '../../interfaces/category.interface';

// Base schemas
const categoryHierarchyResponseSchema = z.object({
  level: z.number(),
  path: z.array(z.string()),
  fullPath: z.string(),
});

const categorySettingsResponseSchema = z.object({
  allowSubcategories: z.boolean(),
  requireSpecifications: z.boolean(),
  customFields: z.array(z.object({
    name: z.string(),
    type: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  })).optional(),
});

const categorySEOResponseSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  slug: z.string(),
});

// Category Response DTO
export const CategoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  status: z.nativeEnum(CategoryStatus),
  companyId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  hierarchy: categoryHierarchyResponseSchema,
  settings: categorySettingsResponseSchema,
  seo: categorySEOResponseSchema,
  image: z.string().url().optional(),
  icon: z.string().optional(),
  sortOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

// Category List Response DTO
export const CategoryListResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  status: z.nativeEnum(CategoryStatus),
  companyId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  hierarchy: categoryHierarchyResponseSchema,
  image: z.string().url().optional(),
  icon: z.string().optional(),
  sortOrder: z.number(),
  createdAt: z.date(),
});

export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;

// Category Tree Response DTO
export const CategoryTreeResponseSchema: z.ZodType<any> = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  status: z.nativeEnum(CategoryStatus),
  parentId: z.string().uuid().optional(),
  hierarchy: categoryHierarchyResponseSchema,
  image: z.string().url().optional(),
  icon: z.string().optional(),
  sortOrder: z.number(),
  children: z.array(z.lazy((): z.ZodType<any> => CategoryTreeResponseSchema)).optional(),
  productCount: z.number().optional(),
});

export type CategoryTreeResponse = z.infer<typeof CategoryTreeResponseSchema>;

// Category Summary Response DTO
export const CategorySummaryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  status: z.nativeEnum(CategoryStatus),
  level: z.number(),
  productCount: z.number(),
  hasChildren: z.boolean(),
  image: z.string().url().optional(),
  icon: z.string().optional(),
});

export type CategorySummaryResponse = z.infer<typeof CategorySummaryResponseSchema>;
