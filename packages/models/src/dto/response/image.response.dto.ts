/**
 * Image Response DTOs
 */

import { z } from 'zod';
import { ImageType, ImageStatus, ImageFormat } from '../../interfaces/image.interface';

// Base schemas
const imageMetadataResponseSchema = z.object({
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.nativeEnum(ImageFormat),
  quality: z.number().optional(),
  compression: z.number().optional(),
  checksum: z.string(),
  exif: z.record(z.any()).optional(),
});

const imageVariantResponseSchema = z.object({
  url: z.string().url(),
  width: z.number(),
  height: z.number(),
  size: z.number(),
  format: z.nativeEnum(ImageFormat),
  quality: z.number(),
});

const imageVariantsResponseSchema = z.object({
  original: imageVariantResponseSchema,
  thumbnail: imageVariantResponseSchema.optional(),
  small: imageVariantResponseSchema.optional(),
  medium: imageVariantResponseSchema.optional(),
  large: imageVariantResponseSchema.optional(),
  xlarge: imageVariantResponseSchema.optional(),
});

// Image Response DTO
export const ImageResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  type: z.nativeEnum(ImageType),
  status: z.nativeEnum(ImageStatus),
  companyId: z.string().uuid(),
  
  // Entity relationship
  entityId: z.string().uuid(),
  entityType: z.string(),
  
  // Image metadata
  metadata: imageMetadataResponseSchema,
  variants: imageVariantsResponseSchema,
  
  // Additional information
  tags: z.array(z.string()),
  isPublic: z.boolean(),
  uploadedBy: z.string().uuid(),
  
  // Processing information
  processingJobId: z.string().optional(),
  errorMessage: z.string().optional(),
  
  // Timestamps
  uploadedAt: z.date(),
  processedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ImageResponse = z.infer<typeof ImageResponseSchema>;

// Image List Response DTO
export const ImageListResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  type: z.nativeEnum(ImageType),
  status: z.nativeEnum(ImageStatus),
  companyId: z.string().uuid(),
  entityId: z.string().uuid(),
  entityType: z.string(),
  metadata: imageMetadataResponseSchema,
  variants: imageVariantsResponseSchema,
  tags: z.array(z.string()),
  isPublic: z.boolean(),
  uploadedBy: z.string().uuid(),
  uploadedAt: z.date(),
  processedAt: z.date().optional(),
});

export type ImageListResponse = z.infer<typeof ImageListResponseSchema>;

// Image Summary Response DTO
export const ImageSummaryResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  type: z.nativeEnum(ImageType),
  status: z.nativeEnum(ImageStatus),
  entityId: z.string().uuid(),
  entityType: z.string(),
  thumbnailUrl: z.string().url().optional(),
  fileSize: z.number(),
  dimensions: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  format: z.nativeEnum(ImageFormat),
  uploadedAt: z.date(),
});

export type ImageSummaryResponse = z.infer<typeof ImageSummaryResponseSchema>;

// Image Upload Response DTO
export const ImageUploadResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  variants: imageVariantsResponseSchema,
  metadata: imageMetadataResponseSchema,
  status: z.nativeEnum(ImageStatus),
  processingJobId: z.string().optional(),
  uploadedAt: z.date(),
});

export type ImageUploadResponse = z.infer<typeof ImageUploadResponseSchema>;

// Image Processing Status Response DTO
export const ImageProcessingStatusResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(ImageStatus),
  progress: z.number().min(0).max(100),
  variants: z.array(z.string()),
  errorMessage: z.string().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type ImageProcessingStatusResponse = z.infer<typeof ImageProcessingStatusResponseSchema>;

// User Avatar Response DTO
export const UserAvatarResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  variants: z.object({
    thumbnail: z.string().url().optional(),
    small: z.string().url().optional(),
    medium: z.string().url().optional(),
  }),
  metadata: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    size: z.number(),
    format: z.nativeEnum(ImageFormat),
  }),
  uploadedAt: z.date(),
});

export type UserAvatarResponse = z.infer<typeof UserAvatarResponseSchema>;

// Product Image Response DTO
export const ProductImageResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  alt: z.string().optional(),
  isPrimary: z.boolean(),
  order: z.number(),
  type: z.enum(['MAIN', 'DETAIL', 'THUMBNAIL', 'GALLERY']),
  variants: z.object({
    thumbnail: z.string().url().optional(),
    small: z.string().url().optional(),
    medium: z.string().url().optional(),
    large: z.string().url().optional(),
  }),
  metadata: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    size: z.number(),
    format: z.string(),
  }),
});

export type ProductImageResponse = z.infer<typeof ProductImageResponseSchema>;

// Company Logo Response DTO
export const CompanyLogoResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  variants: z.object({
    thumbnail: z.string().url().optional(),
    small: z.string().url().optional(),
    medium: z.string().url().optional(),
    large: z.string().url().optional(),
  }),
  metadata: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    size: z.number(),
    format: z.nativeEnum(ImageFormat),
  }),
  uploadedAt: z.date(),
});

export type CompanyLogoResponse = z.infer<typeof CompanyLogoResponseSchema>;

// Brand Logo Response DTO
export const BrandLogoResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  variants: z.object({
    thumbnail: z.string().url().optional(),
    small: z.string().url().optional(),
    medium: z.string().url().optional(),
  }),
  metadata: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    size: z.number(),
    format: z.nativeEnum(ImageFormat),
  }),
  uploadedAt: z.date(),
});

export type BrandLogoResponse = z.infer<typeof BrandLogoResponseSchema>;

// Image Statistics Response DTO
export const ImageStatisticsResponseSchema = z.object({
  totalImages: z.number(),
  byType: z.record(z.number()),
  byStatus: z.record(z.number()),
  byFormat: z.record(z.number()),
  totalSize: z.number(),
  averageSize: z.number(),
  publicImages: z.number(),
  privateImages: z.number(),
  processingJobs: z.object({
    pending: z.number(),
    processing: z.number(),
    completed: z.number(),
    failed: z.number(),
  }),
});

export type ImageStatisticsResponse = z.infer<typeof ImageStatisticsResponseSchema>;

// Image Search Response DTO
export const ImageSearchResponseSchema = z.object({
  images: z.array(ImageListResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export type ImageSearchResponse = z.infer<typeof ImageSearchResponseSchema>;




