/**
 * Image entity for MinIO integration
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { 
  ImageType, 
  ImageStatus, 
  ImageFormat,
  IImageMetadata,
  IImageVariants
} from '../interfaces/image.interface';

export class Image implements IBaseEntityWithCompany {
  id!: string;
  url!: string;
  type!: ImageType;
  status!: ImageStatus;
  companyId!: string;
  
  // Entity relationship
  entityId!: string;
  entityType!: string;
  
  // Image metadata
  metadata!: IImageMetadata;
  variants!: IImageVariants;
  
  // Additional information
  tags!: string[];
  isPublic: boolean = false;
  uploadedBy!: string; // userId
  
  // Processing information
  processingJobId?: string;
  errorMessage?: string;
  
  // Timestamps
  uploadedAt!: Date;
  processedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  // Relations
  uploadedByUser?: any; // Will be typed when User entity is imported

  constructor(data: Partial<Image>) {
    Object.assign(this, data);
  }

  // Helper methods
  isReady(): boolean {
    return this.status === ImageStatus.READY;
  }

  isUploading(): boolean {
    return this.status === ImageStatus.UPLOADING;
  }

  isProcessing(): boolean {
    return this.status === ImageStatus.PROCESSING;
  }

  isFailed(): boolean {
    return this.status === ImageStatus.FAILED;
  }

  isDeleted(): boolean {
    return this.status === ImageStatus.DELETED;
  }

  hasError(): boolean {
    return !!(this.errorMessage && this.errorMessage.length > 0);
  }

  getErrorMessage(): string | undefined {
    return this.errorMessage;
  }

  // Variant methods
  hasVariants(): boolean {
    return !!(this.variants && Object.keys(this.variants).length > 1);
  }

  getOriginalUrl(): string {
    return this.variants.original.url;
  }

  getThumbnailUrl(): string | undefined {
    return this.variants.thumbnail?.url;
  }

  getSmallUrl(): string | undefined {
    return this.variants.small?.url;
  }

  getMediumUrl(): string | undefined {
    return this.variants.medium?.url;
  }

  getLargeUrl(): string | undefined {
    return this.variants.large?.url;
  }

  getXLargeUrl(): string | undefined {
    return this.variants.xlarge?.url;
  }

  // Metadata methods
  getOriginalName(): string {
    return this.metadata.originalName;
  }

  getMimeType(): string {
    return this.metadata.mimeType;
  }

  getFileSize(): number {
    return this.metadata.size;
  }

  getFileSizeFormatted(): string {
    const bytes = this.metadata.size;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getDimensions(): { width?: number; height?: number } {
    return {
      width: this.metadata.width,
      height: this.metadata.height
    };
  }

  getFormat(): ImageFormat {
    return this.metadata.format;
  }

  getQuality(): number | undefined {
    return this.metadata.quality;
  }

  getCompression(): number | undefined {
    return this.metadata.compression;
  }

  getChecksum(): string {
    return this.metadata.checksum;
  }

  getExifData(): Record<string, any> | undefined {
    return this.metadata.exif;
  }

  // Type-specific methods
  isUserAvatar(): boolean {
    return this.type === ImageType.USER_AVATAR;
  }

  isProductImage(): boolean {
    return this.type === ImageType.PRODUCT_IMAGE;
  }

  isProductAttachment(): boolean {
    return this.type === ImageType.PRODUCT_ATTACHMENT;
  }

  isCompanyLogo(): boolean {
    return this.type === ImageType.COMPANY_LOGO;
  }

  isBrandLogo(): boolean {
    return this.type === ImageType.BRAND_LOGO;
  }

  isCategoryImage(): boolean {
    return this.type === ImageType.CATEGORY_IMAGE;
  }

  isVehicleImage(): boolean {
    return this.type === ImageType.VEHICLE_IMAGE;
  }

  // Tag methods
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  addTag(tag: string): void {
    if (!this.hasTag(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
    }
  }

  // Public/Private methods
  isPublicImage(): boolean {
    return this.isPublic;
  }

  setPublic(isPublic: boolean): void {
    this.isPublic = isPublic;
  }

  // Processing methods
  isProcessingComplete(): boolean {
    return this.isReady() && !this.isProcessing();
  }

  getProcessingProgress(): number {
    if (this.isReady()) return 100;
    if (this.isFailed()) return 0;
    if (this.isProcessing()) return 50; // Default progress
    return 0;
  }

  // URL methods for different use cases
  getDisplayUrl(size: 'thumbnail' | 'small' | 'medium' | 'large' | 'original' = 'medium'): string {
    switch (size) {
      case 'thumbnail':
        return this.getThumbnailUrl() || this.getOriginalUrl();
      case 'small':
        return this.getSmallUrl() || this.getOriginalUrl();
      case 'medium':
        return this.getMediumUrl() || this.getOriginalUrl();
      case 'large':
        return this.getLargeUrl() || this.getOriginalUrl();
      case 'original':
      default:
        return this.getOriginalUrl();
    }
  }

  // Validation methods
  isValidFormat(): boolean {
    const validFormats = [ImageFormat.JPEG, ImageFormat.PNG, ImageFormat.WEBP, ImageFormat.GIF, ImageFormat.SVG];
    return validFormats.includes(this.metadata.format);
  }

  isImageFile(): boolean {
    return this.metadata.mimeType.startsWith('image/');
  }

  // Utility methods
  getAspectRatio(): number | undefined {
    const { width, height } = this.getDimensions();
    if (!width || !height) return undefined;
    return width / height;
  }

  isLandscape(): boolean {
    const ratio = this.getAspectRatio();
    return ratio ? ratio > 1 : false;
  }

  isPortrait(): boolean {
    const ratio = this.getAspectRatio();
    return ratio ? ratio < 1 : false;
  }

  isSquare(): boolean {
    const ratio = this.getAspectRatio();
    return ratio ? Math.abs(ratio - 1) < 0.1 : false;
  }
}


