import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse } from './api.service';
import { 
  ImageResponse, 
  CreateImageRequest, 
  UpdateImageRequest 
} from '@estoque-mestre/models';

export interface ImageFilters {
  query?: string;
  entityType?: string;
  entityId?: string;
  isPrimary?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ImageUploadResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  size: number;
  mimeType: string;
}

export interface ImageVariant {
  name: string;
  url: string;
  width: number;
  height: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private imagesSubject = new BehaviorSubject<ImageResponse[]>([]);
  public images$ = this.imagesSubject.asObservable();

  private currentImageSubject = new BehaviorSubject<ImageResponse | null>(null);
  public currentImage$ = this.currentImageSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get all images with pagination and filters
   */
  getImages(filters: ImageFilters = {}): Observable<PaginatedResponse<ImageResponse>> {
    return this.apiService.getPaginated<ImageResponse>('images', filters)
      .pipe(
        tap(response => {
          this.imagesSubject.next(response.data);
        })
      );
  }

  /**
   * Get image by ID
   */
  getImage(id: string): Observable<ImageResponse> {
    return this.apiService.get<ImageResponse>(`images/${id}`)
      .pipe(
        tap(image => {
          this.currentImageSubject.next(image);
        })
      );
  }

  /**
   * Upload single image
   */
  uploadImage(file: File, entityType: string, entityId: string, options?: {
    alt?: string;
    isPrimary?: boolean;
    order?: number;
  }): Observable<ImageUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    
    if (options?.alt) formData.append('alt', options.alt);
    if (options?.isPrimary !== undefined) formData.append('isPrimary', options.isPrimary.toString());
    if (options?.order !== undefined) formData.append('order', options.order.toString());

    return this.apiService.uploadFile<ImageUploadResult>('images/upload', file, {
      entityType,
      entityId,
      alt: options?.alt,
      isPrimary: options?.isPrimary,
      order: options?.order
    });
  }

  /**
   * Upload multiple images
   */
  uploadImages(files: File[], entityType: string, entityId: string, options?: {
    alt?: string;
    isPrimary?: boolean;
  }): Observable<ImageUploadResult[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadImage(file, entityType, entityId, {
        ...options,
        isPrimary: options?.isPrimary && index === 0,
        order: index
      })
    );

    return new Observable(observer => {
      Promise.all(uploadPromises).then(results => {
        observer.next(results);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  /**
   * Update image
   */
  updateImage(id: string, imageData: UpdateImageRequest): Observable<ImageResponse> {
    return this.apiService.put<ImageResponse>(`images/${id}`, imageData)
      .pipe(
        tap(image => {
          this.currentImageSubject.next(image);
          
          const currentImages = this.imagesSubject.value;
          const updatedImages = currentImages.map(i => 
            i.id === id ? { ...i, ...image } : i
          );
          this.imagesSubject.next(updatedImages);
        })
      );
  }

  /**
   * Delete image
   */
  deleteImage(id: string): Observable<void> {
    return this.apiService.delete<void>(`images/${id}`)
      .pipe(
        tap(() => {
          const currentImages = this.imagesSubject.value;
          const filteredImages = currentImages.filter(i => i.id !== id);
          this.imagesSubject.next(filteredImages);
          
          if (this.currentImageSubject.value?.id === id) {
            this.currentImageSubject.next(null);
          }
        })
      );
  }

  /**
   * Get images by entity
   */
  getImagesByEntity(entityType: string, entityId: string): Observable<ImageResponse[]> {
    return this.apiService.get<ImageResponse[]>(`images/entity/${entityType}/${entityId}`);
  }

  /**
   * Get product images
   */
  getProductImages(productId: string): Observable<ImageResponse[]> {
    return this.getImagesByEntity('product', productId);
  }

  /**
   * Get company images
   */
  getCompanyImages(companyId: string): Observable<ImageResponse[]> {
    return this.getImagesByEntity('company', companyId);
  }

  /**
   * Get user images
   */
  getUserImages(userId: string): Observable<ImageResponse[]> {
    return this.getImagesByEntity('user', userId);
  }

  /**
   * Set primary image
   */
  setPrimaryImage(id: string): Observable<ImageResponse> {
    return this.apiService.patch<ImageResponse>(`images/${id}/set-primary`, {})
      .pipe(
        tap(image => {
          const currentImages = this.imagesSubject.value;
          const updatedImages = currentImages.map(i => 
            i.id === id ? { ...i, ...image } : { ...i, isPrimary: false }
          );
          this.imagesSubject.next(updatedImages);
        })
      );
  }

  /**
   * Reorder images
   */
  reorderImages(imageIds: string[]): Observable<void> {
    return this.apiService.post<void>('images/reorder', { imageIds })
      .pipe(
        tap(() => {
          // Refresh images to get updated order
          this.refreshImages();
        })
      );
  }

  /**
   * Get image variants
   */
  getImageVariants(id: string): Observable<ImageVariant[]> {
    return this.apiService.get<ImageVariant[]>(`images/${id}/variants`);
  }

  /**
   * Generate image variants
   */
  generateImageVariants(id: string): Observable<ImageVariant[]> {
    return this.apiService.post<ImageVariant[]>(`images/${id}/generate-variants`, {});
  }

  /**
   * Resize image
   */
  resizeImage(id: string, width: number, height: number): Observable<ImageVariant> {
    return this.apiService.post<ImageVariant>(`images/${id}/resize`, { width, height });
  }

  /**
   * Crop image
   */
  cropImage(id: string, x: number, y: number, width: number, height: number): Observable<ImageVariant> {
    return this.apiService.post<ImageVariant>(`images/${id}/crop`, { x, y, width, height });
  }

  /**
   * Apply image filter
   */
  applyImageFilter(id: string, filter: string, intensity?: number): Observable<ImageVariant> {
    return this.apiService.post<ImageVariant>(`images/${id}/filter`, { filter, intensity });
  }

  /**
   * Get image statistics
   */
  getImageStats(): Observable<any> {
    return this.apiService.get<any>('images/stats');
  }

  /**
   * Get storage usage
   */
  getStorageUsage(): Observable<any> {
    return this.apiService.get<any>('images/storage-usage');
  }

  /**
   * Clean up unused images
   */
  cleanupUnusedImages(): Observable<{ deleted: number; freedSpace: number }> {
    return this.apiService.post<{ deleted: number; freedSpace: number }>('images/cleanup', {});
  }

  /**
   * Bulk delete images
   */
  bulkDeleteImages(imageIds: string[]): Observable<void> {
    return this.apiService.post<void>('images/bulk-delete', { imageIds })
      .pipe(
        tap(() => {
          const currentImages = this.imagesSubject.value;
          const filteredImages = currentImages.filter(i => !imageIds.includes(i.id));
          this.imagesSubject.next(filteredImages);
        })
      );
  }

  /**
   * Export images
   */
  exportImages(filters: ImageFilters = {}): Observable<Blob> {
    return this.apiService.downloadFile('images/export', 'images.zip');
  }

  /**
   * Get image URL with size
   */
  getImageUrl(imageId: string, size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original'): string {
    const baseUrl = this.apiService['baseUrl'];
    const sizeParam = size ? `?size=${size}` : '';
    return `${baseUrl}/images/${imageId}/file${sizeParam}`;
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(imageId: string): string {
    return this.getImageUrl(imageId, 'thumbnail');
  }

  /**
   * Get current images
   */
  getCurrentImages(): ImageResponse[] {
    return this.imagesSubject.value;
  }

  /**
   * Get current image
   */
  getCurrentImage(): ImageResponse | null {
    return this.currentImageSubject.value;
  }

  /**
   * Clear current image
   */
  clearCurrentImage(): void {
    this.currentImageSubject.next(null);
  }

  /**
   * Refresh images list
   */
  refreshImages(filters: ImageFilters = {}): void {
    this.getImages(filters).subscribe();
  }

  /**
   * Refresh current image
   */
  refreshCurrentImage(): void {
    const currentImage = this.currentImageSubject.value;
    if (currentImage) {
      this.getImage(currentImage.id).subscribe();
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Máximo 10MB.' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.' };
    }
    
    return { valid: true };
  }

  /**
   * Get image dimensions
   */
  getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
}
