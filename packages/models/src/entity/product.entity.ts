/**
 * Product entity
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { 
  ProductStatus, 
  ProductType, 
  InventoryStatus,
  IProductSpecification,
  IProductImage,
  IProductAttachment,
  IProductPricing,
  IProductInventory,
  IProductCompatibility,
  IProductSubItem,
  IProductKit
} from '../interfaces/product.interface';

export class Product implements IBaseEntityWithCompany {
  id!: string;
  name!: string;
  description?: string;
  sku!: string;
  barcode?: string;
  status!: ProductStatus;
  type!: ProductType;
  companyId!: string;
  categoryId!: string;
  supplierId?: string;
  
  // Product details
  specifications!: IProductSpecification[];
  images!: IProductImage[];
  attachments!: IProductAttachment[];
  pricing!: IProductPricing;
  inventory!: IProductInventory;
  compatibility!: IProductCompatibility;
  
  // Kit/SubItems
  isKit: boolean = false;
  subItems!: IProductSubItem[];
  kitDetails?: IProductKit;
  
  // Additional fields
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  brand?: string;
  model?: string;
  warranty?: number; // months
  expirationDate?: Date;
  notes?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slug!: string;
  
  createdAt!: Date;
  updatedAt!: Date;

  // Relations
  category?: any; // Will be typed when Category entity is imported
  supplier?: any; // Will be typed when Supplier entity is imported

  constructor(data: Partial<Product>) {
    Object.assign(this, data);
  }

  // Helper methods
  isActive(): boolean {
    return this.status === ProductStatus.ACTIVE;
  }

  isInStock(): boolean {
    return this.inventory.currentStock > 0;
  }

  isLowStock(): boolean {
    return this.inventory.currentStock <= this.inventory.minStock;
  }

  isOutOfStock(): boolean {
    return this.inventory.currentStock === 0;
  }

  getInventoryStatus(): InventoryStatus {
    if (this.inventory.currentStock === 0) return InventoryStatus.OUT_OF_STOCK;
    if (this.isLowStock()) return InventoryStatus.LOW_STOCK;
    return InventoryStatus.IN_STOCK;
  }

  getMargin(): number {
    if (this.pricing.costPrice === 0) return 0;
    return ((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.costPrice) * 100;
  }

  getPrimaryImage(): IProductImage | undefined {
    return this.images.find(img => img.isPrimary) || this.images[0];
  }

  isAutoPart(): boolean {
    return this.type === ProductType.AUTO_PART;
  }

  getCompatibilityString(): string {
    const parts = [];
    if (this.compatibility.vehicleMake) parts.push(this.compatibility.vehicleMake);
    if (this.compatibility.vehicleModel) parts.push(this.compatibility.vehicleModel);
    if (this.compatibility.vehicleYear) parts.push(this.compatibility.vehicleYear);
    return parts.join(' ');
  }

  // Attachment methods
  getAttachments(): IProductAttachment[] {
    return this.attachments || [];
  }

  getAttachmentsByType(type: string): IProductAttachment[] {
    return this.attachments.filter(att => att.type === type);
  }

  hasAttachments(): boolean {
    return this.attachments && this.attachments.length > 0;
  }

  // Kit/SubItems methods
  isProductKit(): boolean {
    return this.isKit;
  }

  getSubItems(): IProductSubItem[] {
    return this.subItems || [];
  }

  getRequiredSubItems(): IProductSubItem[] {
    return this.subItems.filter(item => item.isRequired);
  }

  getOptionalSubItems(): IProductSubItem[] {
    return this.subItems.filter(item => !item.isRequired);
  }

  hasSubItems(): boolean {
    return this.subItems && this.subItems.length > 0;
  }

  getKitTotalCost(): number {
    if (!this.isKit || !this.kitDetails) return 0;
    return this.kitDetails.totalCost;
  }

  getKitTotalSellingPrice(): number {
    if (!this.isKit || !this.kitDetails) return 0;
    return this.kitDetails.totalSellingPrice;
  }

  getKitMargin(): number {
    if (!this.isKit || !this.kitDetails || this.kitDetails.totalCost === 0) return 0;
    return ((this.kitDetails.totalSellingPrice - this.kitDetails.totalCost) / this.kitDetails.totalCost) * 100;
  }

  // Enhanced image methods
  getImagesByType(type: 'MAIN' | 'DETAIL' | 'THUMBNAIL' | 'GALLERY'): IProductImage[] {
    return this.images.filter(img => img.type === type);
  }

  getMainImages(): IProductImage[] {
    return this.getImagesByType('MAIN');
  }

  getDetailImages(): IProductImage[] {
    return this.getImagesByType('DETAIL');
  }

  getGalleryImages(): IProductImage[] {
    return this.getImagesByType('GALLERY');
  }

  getThumbnailImages(): IProductImage[] {
    return this.getImagesByType('THUMBNAIL');
  }

  getImageVariants(imageId: string): IProductImage['variants'] | undefined {
    const image = this.images.find(img => img.id === imageId);
    return image?.variants;
  }

  getImageThumbnail(imageId: string): string | undefined {
    const variants = this.getImageVariants(imageId);
    return variants?.thumbnail;
  }

  getImageSmall(imageId: string): string | undefined {
    const variants = this.getImageVariants(imageId);
    return variants?.small;
  }

  getImageMedium(imageId: string): string | undefined {
    const variants = this.getImageVariants(imageId);
    return variants?.medium;
  }

  getImageLarge(imageId: string): string | undefined {
    const variants = this.getImageVariants(imageId);
    return variants?.large;
  }

  getImageMetadata(imageId: string): IProductImage['metadata'] | undefined {
    const image = this.images.find(img => img.id === imageId);
    return image?.metadata;
  }

  getImageDimensions(imageId: string): { width?: number; height?: number } | undefined {
    const metadata = this.getImageMetadata(imageId);
    if (!metadata) return undefined;
    return {
      width: metadata.width,
      height: metadata.height
    };
  }

  getImageSize(imageId: string): number | undefined {
    const metadata = this.getImageMetadata(imageId);
    return metadata?.size;
  }

  getImageFormat(imageId: string): string | undefined {
    const metadata = this.getImageMetadata(imageId);
    return metadata?.format;
  }
}
