/**
 * Image Request DTOs with Zod validation
 */

import { z } from 'zod';
import { ImageType, ImageFormat } from '../../interfaces/image.interface';

// Base schemas
const imageMetadataSchema = z.object({
  originalName: z.string().min(1, 'Nome original é obrigatório').max(255),
  mimeType: z.string().min(1, 'Tipo MIME é obrigatório'),
  size: z.number().min(1, 'Tamanho deve ser maior que zero'),
  width: z.number().min(1).optional(),
  height: z.number().min(1).optional(),
  format: z.nativeEnum(ImageFormat),
  quality: z.number().min(1).max(100).optional(),
  compression: z.number().min(1).max(100).optional(),
  checksum: z.string().min(1, 'Checksum é obrigatório'),
});

const imageVariantSchema = z.object({
  url: z.string().url('URL inválida'),
  width: z.number().min(1),
  height: z.number().min(1),
  size: z.number().min(1),
  format: z.nativeEnum(ImageFormat),
  quality: z.number().min(1).max(100),
});

const imageVariantsSchema = z.object({
  original: imageVariantSchema,
  thumbnail: imageVariantSchema.optional(),
  small: imageVariantSchema.optional(),
  medium: imageVariantSchema.optional(),
  large: imageVariantSchema.optional(),
  xlarge: imageVariantSchema.optional(),
});

// Upload Image DTO
export const UploadImageRequestSchema = z.object({
  type: z.nativeEnum(ImageType),
  entityId: z.string().uuid('ID da entidade inválido'),
  entityType: z.string().min(1, 'Tipo da entidade é obrigatório'),
  metadata: imageMetadataSchema,
  variants: imageVariantsSchema,
  tags: z.array(z.string().max(50)).optional(),
  isPublic: z.boolean().default(false),
});

export type UploadImageRequest = z.infer<typeof UploadImageRequestSchema>;

// Update Image DTO
export const UpdateImageRequestSchema = z.object({
  metadata: imageMetadataSchema.partial().optional(),
  tags: z.array(z.string().max(50)).optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateImageRequest = z.infer<typeof UpdateImageRequestSchema>;

// Image Search DTO
export const ImageSearchRequestSchema = z.object({
  entityId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  type: z.nativeEnum(ImageType).optional(),
  status: z.enum(['UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'DELETED']).optional(),
  format: z.nativeEnum(ImageFormat).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['uploadedAt', 'size', 'type', 'status']).default('uploadedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ImageSearchRequest = z.infer<typeof ImageSearchRequestSchema>;

// Delete Image DTO
export const DeleteImageRequestSchema = z.object({
  imageId: z.string().uuid('ID da imagem inválido'),
  deleteVariants: z.boolean().default(true),
  deleteFromStorage: z.boolean().default(true),
});

export type DeleteImageRequest = z.infer<typeof DeleteImageRequestSchema>;

// Bulk Upload DTO
export const BulkUploadImagesRequestSchema = z.object({
  images: z.array(UploadImageRequestSchema).min(1, 'Pelo menos uma imagem é obrigatória').max(10, 'Máximo 10 imagens por vez'),
});

export type BulkUploadImagesRequest = z.infer<typeof BulkUploadImagesRequestSchema>;

// Image Processing DTO
export const ProcessImageRequestSchema = z.object({
  imageId: z.string().uuid('ID da imagem inválido'),
  variants: z.array(z.enum(['thumbnail', 'small', 'medium', 'large', 'xlarge'])).min(1, 'Pelo menos uma variante é obrigatória'),
  resizeConfig: z.object({
    width: z.number().min(1).optional(),
    height: z.number().min(1).optional(),
    quality: z.number().min(1).max(100).default(85),
    format: z.nativeEnum(ImageFormat).optional(),
    maintainAspectRatio: z.boolean().default(true),
    cropToFit: z.boolean().default(false),
  }).optional(),
});

export type ProcessImageRequest = z.infer<typeof ProcessImageRequestSchema>;

// User Avatar Upload DTO
export const UploadUserAvatarRequestSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  metadata: imageMetadataSchema,
  variants: imageVariantsSchema,
});

export type UploadUserAvatarRequest = z.infer<typeof UploadUserAvatarRequestSchema>;

// Product Image Upload DTO
export const UploadProductImageRequestSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  type: z.enum(['MAIN', 'DETAIL', 'THUMBNAIL', 'GALLERY']).default('GALLERY'),
  isPrimary: z.boolean().default(false),
  order: z.number().min(0).default(0),
  alt: z.string().max(200).optional(),
  metadata: imageMetadataSchema,
  variants: imageVariantsSchema,
});

export type UploadProductImageRequest = z.infer<typeof UploadProductImageRequestSchema>;

// Company Logo Upload DTO
export const UploadCompanyLogoRequestSchema = z.object({
  companyId: z.string().uuid('ID da empresa inválido'),
  metadata: imageMetadataSchema,
  variants: imageVariantsSchema,
});

export type UploadCompanyLogoRequest = z.infer<typeof UploadCompanyLogoRequestSchema>;

// Brand Logo Upload DTO
export const UploadBrandLogoRequestSchema = z.object({
  brandId: z.string().uuid('ID da marca inválido'),
  metadata: imageMetadataSchema,
  variants: imageVariantsSchema,
});

export type UploadBrandLogoRequest = z.infer<typeof UploadBrandLogoRequestSchema>;

// Image Validation DTO
export const ValidateImageRequestSchema = z.object({
  file: z.any(), // File object
  maxFileSize: z.number().min(1).default(10 * 1024 * 1024), // 10MB default
  allowedFormats: z.array(z.nativeEnum(ImageFormat)).default([ImageFormat.JPEG, ImageFormat.PNG, ImageFormat.WEBP]),
  maxWidth: z.number().min(1).optional(),
  maxHeight: z.number().min(1).optional(),
  minWidth: z.number().min(1).optional(),
  minHeight: z.number().min(1).optional(),
  aspectRatio: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
});

export type ValidateImageRequest = z.infer<typeof ValidateImageRequestSchema>;





