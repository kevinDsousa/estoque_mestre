import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse } from './api.service';
import { 
  ProductResponse, 
  ProductListResponse, 
  ProductSummaryResponse,
  InventoryStatusResponse,
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductSearchRequest,
  InventoryAdjustmentRequest
} from '@estoque-mestre/models';

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

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
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
    const searchParams: ProductSearchRequest = {
      query: filters.query,
      categoryId: filters.categoryId,
      supplierId: filters.supplierId,
      status: filters.status as any,
      type: filters.type as any,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.inStock,
      lowStock: filters.lowStock,
      page: filters.page || 1,
      limit: filters.limit || 20,
      sortBy: (filters.sortBy as any) || 'name',
      sortOrder: filters.sortOrder || 'asc'
    };

    return this.apiService.getPaginated<ProductListResponse>('products', searchParams)
      .pipe(
        tap(response => {
          this.productsSubject.next(response.data);
        })
      );
  }

  /**
   * Get product by ID
   */
  getProduct(id: string): Observable<ProductResponse> {
    return this.apiService.get<ProductResponse>(`products/${id}`)
      .pipe(
        tap(product => {
          this.currentProductSubject.next(product);
        })
      );
  }

  /**
   * Create new product
   */
  createProduct(productData: CreateProductRequest): Observable<ProductResponse> {
    return this.apiService.post<ProductResponse>('products', productData)
      .pipe(
        tap(product => {
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next([product as any, ...currentProducts]);
        })
      );
  }

  /**
   * Update product
   */
  updateProduct(id: string, productData: UpdateProductRequest): Observable<ProductResponse> {
    return this.apiService.put<ProductResponse>(`products/${id}`, productData)
      .pipe(
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
  getProductSummary(id: string): Observable<ProductSummaryResponse> {
    return this.apiService.get<ProductSummaryResponse>(`products/${id}/summary`);
  }

  /**
   * Get product summaries with search
   */
  getProductSummaries(query?: string, limit: number = 10): Observable<ProductSummaryResponse[]> {
    const params = query ? { query, limit } : { limit };
    return this.apiService.get<ProductSummaryResponse[]>('products/summaries', params);
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
