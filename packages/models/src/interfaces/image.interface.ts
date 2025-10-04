/**
 * Image management interfaces for MinIO integration
 */

export enum ImageType {
  USER_AVATAR = 'USER_AVATAR',
  PRODUCT_IMAGE = 'PRODUCT_IMAGE',
  PRODUCT_ATTACHMENT = 'PRODUCT_ATTACHMENT',
  COMPANY_LOGO = 'COMPANY_LOGO',
  BRAND_LOGO = 'BRAND_LOGO',
  CATEGORY_IMAGE = 'CATEGORY_IMAGE',
  VEHICLE_IMAGE = 'VEHICLE_IMAGE'
}

export enum ImageStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  DELETED = 'DELETED'
}

export enum ImageFormat {
  JPEG = 'JPEG',
  PNG = 'PNG',
  WEBP = 'WEBP',
  GIF = 'GIF',
  SVG = 'SVG',
  BMP = 'BMP'
}

export interface IImageMetadata {
  originalName: string;
  mimeType: string;
  size: number; // in bytes
  width?: number;
  height?: number;
  format: ImageFormat;
  quality?: number;
  compression?: number;
  exif?: Record<string, any>;
  checksum: string; // MD5 or SHA256
}

export interface IImageVariants {
  original: IImageVariant;
  thumbnail?: IImageVariant;
  small?: IImageVariant;
  medium?: IImageVariant;
  large?: IImageVariant;
  xlarge?: IImageVariant;
}

export interface IImageVariant {
  url: string;
  width: number;
  height: number;
  size: number;
  format: ImageFormat;
  quality: number;
}

export interface IMinIOConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  region?: string;
}

export interface IImageUploadRequest {
  file: File | Buffer;
  type: ImageType;
  entityId: string;
  entityType: string;
  metadata?: Partial<IImageMetadata>;
  variants?: string[]; // ['thumbnail', 'small', 'medium', 'large']
  tags?: string[];
  isPublic?: boolean;
}

export interface IImageUploadResponse {
  id: string;
  url: string;
  variants: IImageVariants;
  metadata: IImageMetadata;
  status: ImageStatus;
  uploadedAt: Date;
}

export interface IImageUpdateRequest {
  id: string;
  metadata?: Partial<IImageMetadata>;
  tags?: string[];
  isPublic?: boolean;
  variants?: string[];
}

export interface IImageDeleteRequest {
  id: string;
  deleteVariants?: boolean;
  deleteFromStorage?: boolean;
}

export interface IImageSearchRequest {
  entityId?: string;
  entityType?: string;
  type?: ImageType;
  status?: ImageStatus;
  format?: ImageFormat;
  tags?: string[];
  isPublic?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface IImageSearchResponse {
  images: IImageInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IImageInfo {
  id: string;
  url: string;
  type: ImageType;
  entityId: string;
  entityType: string;
  status: ImageStatus;
  variants: IImageVariants;
  metadata: IImageMetadata;
  tags: string[];
  isPublic: boolean;
  uploadedAt: Date;
  updatedAt: Date;
}

export interface IImageProcessingJob {
  id: string;
  imageId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  variants: string[];
  progress: number; // 0-100
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface IImageResizeConfig {
  width: number;
  height: number;
  quality: number;
  format: ImageFormat;
  maintainAspectRatio: boolean;
  cropToFit: boolean;
  watermark?: {
    text?: string;
    image?: string;
    position: 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT' | 'CENTER';
    opacity: number;
  };
}

export interface IImageValidationRules {
  maxFileSize: number; // in bytes
  allowedFormats: ImageFormat[];
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: {
    min: number;
    max: number;
  };
}

export interface IImageServiceConfig {
  minio: IMinIOConfig;
  validation: IImageValidationRules;
  processing: {
    enableAutoResize: boolean;
    defaultVariants: string[];
    resizeConfigs: Record<string, IImageResizeConfig>;
  };
  storage: {
    retentionDays?: number;
    autoCleanup: boolean;
    backupEnabled: boolean;
  };
}

