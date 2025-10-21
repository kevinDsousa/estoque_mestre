import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse } from './api.service';
// Interfaces locais
export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  type: 'PRODUCT' | 'SERVICE';
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  categoryId: string;
  supplierId: string;
  trackExpiration: boolean;
  expirationDate?: Date;
  tags?: string[];
  notes?: string;
  isTaxable: boolean;
  taxRate?: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
  images?: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  type?: 'PRODUCT' | 'SERVICE';
  costPrice: number;
  sellingPrice: number;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  categoryId: string;
  supplierId: string;
  trackExpiration?: boolean;
  expirationDate?: Date;
  tags?: string[];
  notes?: string;
  isTaxable?: boolean;
  taxRate?: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  type?: 'PRODUCT' | 'SERVICE';
  costPrice?: number;
  sellingPrice?: number;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  categoryId?: string;
  supplierId?: string;
  trackExpiration?: boolean;
  expirationDate?: Date;
  tags?: string[];
  notes?: string;
  isTaxable?: boolean;
  taxRate?: number;
}

export interface ProductFilters {
  query?: string;
  categoryId?: string;
  supplierId?: string;
  status?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  id: string;
  name: string;
  sku: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  type: 'PRODUCT' | 'SERVICE';
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  categoryId: string;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
  images?: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  averagePrice: number;
}

export interface InventoryStatusResponse {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  status: 'NORMAL' | 'LOW' | 'OUT';
  lastMovement?: string;
}

export interface ProductSearchRequest {
  query: string;
  categoryId?: string;
  supplierId?: string;
  status?: string;
  type?: string;
  limit?: number;
}

export interface InventoryAdjustmentRequest {
  productId: string;
  quantity: number;
  reason: string;
  notes?: string;
}


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<ProductListResponse[]>([]);
  public products$ = this.productsSubject.asObservable();

  private currentProductSubject = new BehaviorSubject<ProductResponse | null>(null);
  public currentProduct$ = this.currentProductSubject.asObservable();

  private productStatsSubject = new BehaviorSubject<ProductStats | null>(null);
  public productStats$ = this.productStatsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get all products with pagination and filters
   */
  getProducts(filters: ProductFilters = {}): Observable<PaginatedResponse<ProductListResponse>> {
    const searchParams = {
      query: filters.query,
      categoryId: filters.categoryId,
      supplierId: filters.supplierId,
      status: filters.status,
      type: filters.type,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.inStock,
      lowStock: filters.lowStock,
      page: filters.page || 1,
      limit: filters.limit || 20,
      sortBy: filters.sortBy || 'name',
      sortOrder: filters.sortOrder || 'asc'
    };

    return this.apiService.getPaginated<any>('products', searchParams)
      .pipe(
        map(response => {
          // Transform backend response to frontend format
          const transformedData = response.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            sku: product.sku,
            barcode: product.barcode,
            status: product.status,
            type: product.type,
            costPrice: product.costPrice,
            sellingPrice: product.sellingPrice,
            currentStock: product.currentStock,
            minStock: product.minStock,
            maxStock: product.maxStock,
            weight: product.weight,
            dimensions: product.dimensions,
            brand: product.brand,
            model: product.model,
            categoryId: product.categoryId,
            supplierId: product.supplierId,
            trackExpiration: product.trackExpiration,
            expirationDate: product.expirationDate,
            tags: product.tags,
            notes: product.notes,
            isTaxable: product.isTaxable,
            taxRate: product.taxRate,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            category: product.category,
            supplier: product.supplier,
            images: product.images || []
          }));

          return {
            data: transformedData,
            pagination: response.pagination,
            success: response.success,
            timestamp: response.timestamp
          };
        }),
        tap(response => {
          this.productsSubject.next(response.data);
        })
      );
  }

  /**
   * Get product by ID
   */
  getProduct(id: string): Observable<ProductResponse> {
    return this.apiService.get<any>(`products/${id}`)
      .pipe(
        map(response => {
          // Transform backend response to frontend format
          const productResponse: ProductResponse = {
            id: response.id,
            name: response.name,
            description: response.description,
            sku: response.sku,
            barcode: response.barcode,
            status: response.status,
            type: response.type,
            costPrice: response.costPrice,
            sellingPrice: response.sellingPrice,
            currentStock: response.currentStock,
            minStock: response.minStock,
            maxStock: response.maxStock,
            weight: response.weight,
            dimensions: response.dimensions,
            brand: response.brand,
            model: response.model,
            categoryId: response.categoryId,
            supplierId: response.supplierId,
            trackExpiration: response.trackExpiration,
            expirationDate: response.expirationDate,
            tags: response.tags,
            notes: response.notes,
            isTaxable: response.isTaxable,
            taxRate: response.taxRate,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt,
            category: response.category,
            supplier: response.supplier,
            images: response.images || []
          };
          return productResponse;
        }),
        tap(product => {
          this.currentProductSubject.next(product);
        })
      );
  }

  /**
   * Create new product
   */
  createProduct(productData: any): Observable<ProductResponse> {
    // Transform frontend data to backend format
    const backendData = {
      name: productData.name,
      description: productData.description,
      sku: productData.sku,
      barcode: productData.barcode,
      type: productData.type || 'ACCESSORY',
      status: productData.status || 'ACTIVE',
      costPrice: productData.costPrice || productData.pricing?.costPrice,
      sellingPrice: productData.sellingPrice || productData.pricing?.sellingPrice,
      currentStock: productData.currentStock || productData.inventory?.currentStock || 0,
      minStock: productData.minStock || productData.inventory?.minStock || 0,
      maxStock: productData.maxStock || productData.inventory?.maxStock,
      weight: productData.weight,
      dimensions: productData.dimensions,
      brand: productData.brand,
      model: productData.model,
      categoryId: productData.categoryId,
      supplierId: productData.supplierId,
      trackExpiration: productData.trackExpiration || false,
      expirationDate: productData.expirationDate,
      tags: productData.tags,
      notes: productData.notes,
      isTaxable: productData.isTaxable !== false,
      taxRate: productData.taxRate
    };

    return this.apiService.post<any>('products', backendData)
      .pipe(
        map(response => {
          // Transform backend response to frontend format
          const productResponse: ProductResponse = {
            id: response.id,
            name: response.name,
            description: response.description,
            sku: response.sku,
            barcode: response.barcode,
            status: response.status,
            type: response.type,
            costPrice: response.costPrice,
            sellingPrice: response.sellingPrice,
            currentStock: response.currentStock,
            minStock: response.minStock,
            maxStock: response.maxStock,
            weight: response.weight,
            dimensions: response.dimensions,
            brand: response.brand,
            model: response.model,
            categoryId: response.categoryId,
            supplierId: response.supplierId,
            trackExpiration: response.trackExpiration,
            expirationDate: response.expirationDate,
            tags: response.tags,
            notes: response.notes,
            isTaxable: response.isTaxable,
            taxRate: response.taxRate,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt,
            category: response.category,
            supplier: response.supplier,
            images: response.images || []
          };
          return productResponse;
        }),
        tap(product => {
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next([product as any, ...currentProducts]);
        })
      );
  }

  /**
   * Update product
   */
  updateProduct(id: string, productData: any): Observable<ProductResponse> {
    // Transform frontend data to backend format
    const backendData = {
      name: productData.name,
      description: productData.description,
      sku: productData.sku,
      barcode: productData.barcode,
      type: productData.type,
      status: productData.status,
      costPrice: productData.costPrice || productData.pricing?.costPrice,
      sellingPrice: productData.sellingPrice || productData.pricing?.sellingPrice,
      currentStock: productData.currentStock || productData.inventory?.currentStock,
      minStock: productData.minStock || productData.inventory?.minStock,
      maxStock: productData.maxStock || productData.inventory?.maxStock,
      weight: productData.weight,
      dimensions: productData.dimensions,
      brand: productData.brand,
      model: productData.model,
      categoryId: productData.categoryId,
      supplierId: productData.supplierId,
      trackExpiration: productData.trackExpiration,
      expirationDate: productData.expirationDate,
      tags: productData.tags,
      notes: productData.notes,
      isTaxable: productData.isTaxable,
      taxRate: productData.taxRate
    };

    return this.apiService.patch<any>(`products/${id}`, backendData)
      .pipe(
        map(response => {
          // Transform backend response to frontend format
          const productResponse: ProductResponse = {
            id: response.id,
            name: response.name,
            description: response.description,
            sku: response.sku,
            barcode: response.barcode,
            status: response.status,
            type: response.type,
            costPrice: response.costPrice,
            sellingPrice: response.sellingPrice,
            currentStock: response.currentStock,
            minStock: response.minStock,
            maxStock: response.maxStock,
            weight: response.weight,
            dimensions: response.dimensions,
            brand: response.brand,
            model: response.model,
            categoryId: response.categoryId,
            supplierId: response.supplierId,
            trackExpiration: response.trackExpiration,
            expirationDate: response.expirationDate,
            tags: response.tags,
            notes: response.notes,
            isTaxable: response.isTaxable,
            taxRate: response.taxRate,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt,
            category: response.category,
            supplier: response.supplier,
            images: response.images || []
          };
          return productResponse;
        }),
        tap(product => {
          this.currentProductSubject.next(product);
          
          const currentProducts = this.productsSubject.value;
          const updatedProducts = currentProducts.map(p => 
            p.id === id ? { ...p, ...product } : p
          );
          this.productsSubject.next(updatedProducts);
        })
      );
  }

  /**
   * Delete product
   */
  deleteProduct(id: string): Observable<void> {
    return this.apiService.delete<void>(`products/${id}`)
      .pipe(
        tap(() => {
          const currentProducts = this.productsSubject.value;
          const filteredProducts = currentProducts.filter(p => p.id !== id);
          this.productsSubject.next(filteredProducts);
          
          if (this.currentProductSubject.value?.id === id) {
            this.currentProductSubject.next(null);
          }
        })
      );
  }

  /**
   * Search products
   */
  searchProducts(query: string, filters: Partial<ProductFilters> = {}): Observable<PaginatedResponse<ProductListResponse>> {
    return this.getProducts({ ...filters, query });
  }

  /**
   * Get products by category
   */
  getProductsByCategory(categoryId: string, filters: Partial<ProductFilters> = {}): Observable<PaginatedResponse<ProductListResponse>> {
    return this.getProducts({ ...filters, categoryId });
  }

  /**
   * Get products by supplier
   */
  getProductsBySupplier(supplierId: string, filters: Partial<ProductFilters> = {}): Observable<PaginatedResponse<ProductListResponse>> {
    return this.getProducts({ ...filters, supplierId });
  }

  /**
   * Get low stock products
   */
  getLowStockProducts(filters: Partial<ProductFilters> = {}): Observable<PaginatedResponse<ProductListResponse>> {
    return this.getProducts({ ...filters, lowStock: true });
  }

  /**
   * Get out of stock products
   */
  getOutOfStockProducts(filters: Partial<ProductFilters> = {}): Observable<PaginatedResponse<ProductListResponse>> {
    return this.getProducts({ ...filters, inStock: false });
  }

  /**
   * Get product inventory status
   */
  getInventoryStatus(productId: string): Observable<InventoryStatusResponse> {
    return this.apiService.get<InventoryStatusResponse>(`products/${productId}/inventory`);
  }

  /**
   * Adjust product inventory
   */
  adjustInventory(adjustment: InventoryAdjustmentRequest): Observable<InventoryStatusResponse> {
    return this.apiService.post<InventoryStatusResponse>('products/inventory/adjust', adjustment)
      .pipe(
        tap(() => {
          // Refresh current product if it's the same
          if (this.currentProductSubject.value?.id === adjustment.productId) {
            this.getProduct(adjustment.productId).subscribe();
          }
        })
      );
  }

  /**
   * Get product statistics
   */
  getProductStats(): Observable<ProductStats> {
    return this.apiService.get<ProductStats>('products/stats')
      .pipe(
        tap(stats => {
          this.productStatsSubject.next(stats);
        })
      );
  }

  /**
   * Get product summary (for dropdowns, autocomplete, etc.)
   */
  getProductSummary(id: string): Observable<ProductResponse> {
    return this.apiService.get<ProductResponse>(`products/${id}/summary`);
  }

  /**
   * Get product summaries with search
   */
  getProductSummaries(query?: string, limit: number = 10): Observable<ProductResponse[]> {
    const params = query ? { query, limit } : { limit };
    return this.apiService.get<ProductResponse[]>('products/summaries', params);
  }

  /**
   * Bulk update products
   */
  bulkUpdateProducts(updates: Array<{ id: string; data: UpdateProductRequest }>): Observable<ProductResponse[]> {
    return this.apiService.post<ProductResponse[]>('products/bulk-update', { updates });
  }

  /**
   * Bulk delete products
   */
  bulkDeleteProducts(productIds: string[]): Observable<void> {
    return this.apiService.post<void>('products/bulk-delete', { productIds });
  }

  /**
   * Export products
   */
  exportProducts(filters: ProductFilters = {}): Observable<Blob> {
    return this.apiService.downloadFile('products/export', 'products.xlsx');
  }

  /**
   * Import products
   */
  importProducts(file: File): Observable<{ success: number; errors: any[] }> {
    return this.apiService.uploadFile<{ success: number; errors: any[] }>('products/import', file);
  }

  /**
   * Get product history
   */
  getProductHistory(productId: string): Observable<any[]> {
    return this.apiService.get<any[]>(`products/${productId}/history`);
  }

  /**
   * Get product variants
   */
  getProductVariants(productId: string): Observable<ProductResponse[]> {
    return this.apiService.get<ProductResponse[]>(`products/${productId}/variants`);
  }

  /**
   * Create product variant
   */
  createProductVariant(productId: string, variantData: CreateProductRequest): Observable<ProductResponse> {
    return this.apiService.post<ProductResponse>(`products/${productId}/variants`, variantData);
  }

  /**
   * Get current products
   */
  getCurrentProducts(): ProductListResponse[] {
    return this.productsSubject.value;
  }

  /**
   * Get current product
   */
  getCurrentProduct(): ProductResponse | null {
    return this.currentProductSubject.value;
  }

  /**
   * Get current product stats
   */
  getCurrentProductStats(): ProductStats | null {
    return this.productStatsSubject.value;
  }

  /**
   * Clear current product
   */
  clearCurrentProduct(): void {
    this.currentProductSubject.next(null);
  }

  /**
   * Refresh products list
   */
  refreshProducts(filters: ProductFilters = {}): void {
    this.getProducts(filters).subscribe();
  }

  /**
   * Refresh current product
   */
  refreshCurrentProduct(): void {
    const currentProduct = this.currentProductSubject.value;
    if (currentProduct) {
      this.getProduct(currentProduct.id).subscribe();
    }
  }

  /**
   * Refresh product stats
   */
  refreshProductStats(): void {
    this.getProductStats().subscribe();
  }
}
