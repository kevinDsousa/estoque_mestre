import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, PaginatedResponse } from './api.service';
import { 
  CategoryResponse, 
  CreateCategoryRequest, 
  UpdateCategoryRequest 
} from '@estoque-mestre/models';

export interface CategoryFilters {
  query?: string;
  parentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryTree {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  children: CategoryTree[];
  productCount: number;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<CategoryResponse[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  private categoryTreeSubject = new BehaviorSubject<CategoryTree[]>([]);
  public categoryTree$ = this.categoryTreeSubject.asObservable();

  private currentCategorySubject = new BehaviorSubject<CategoryResponse | null>(null);
  public currentCategory$ = this.currentCategorySubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Get all categories with pagination and filters
   */
  getCategories(filters: CategoryFilters = {}): Observable<PaginatedResponse<CategoryResponse>> {
    return this.apiService.getPaginated<CategoryResponse>('categories', filters)
      .pipe(
        tap(response => {
          this.categoriesSubject.next(response.data);
        })
      );
  }

  /**
   * Get category by ID
   */
  getCategory(id: string): Observable<CategoryResponse> {
    return this.apiService.get<CategoryResponse>(`categories/${id}`)
      .pipe(
        tap(category => {
          this.currentCategorySubject.next(category);
        })
      );
  }

  /**
   * Create new category
   */
  createCategory(categoryData: CreateCategoryRequest): Observable<CategoryResponse> {
    return this.apiService.post<CategoryResponse>('categories', categoryData)
      .pipe(
        tap(category => {
          const currentCategories = this.categoriesSubject.value;
          this.categoriesSubject.next([category, ...currentCategories]);
          this.refreshCategoryTree();
        })
      );
  }

  /**
   * Update category
   */
  updateCategory(id: string, categoryData: UpdateCategoryRequest): Observable<CategoryResponse> {
    return this.apiService.put<CategoryResponse>(`categories/${id}`, categoryData)
      .pipe(
        tap(category => {
          this.currentCategorySubject.next(category);
          
          const currentCategories = this.categoriesSubject.value;
          const updatedCategories = currentCategories.map(c => 
            c.id === id ? { ...c, ...category } : c
          );
          this.categoriesSubject.next(updatedCategories);
          this.refreshCategoryTree();
        })
      );
  }

  /**
   * Delete category
   */
  deleteCategory(id: string): Observable<void> {
    return this.apiService.delete<void>(`categories/${id}`)
      .pipe(
        tap(() => {
          const currentCategories = this.categoriesSubject.value;
          const filteredCategories = currentCategories.filter(c => c.id !== id);
          this.categoriesSubject.next(filteredCategories);
          
          if (this.currentCategorySubject.value?.id === id) {
            this.currentCategorySubject.next(null);
          }
          this.refreshCategoryTree();
        })
      );
  }

  /**
   * Get category tree
   */
  getCategoryTree(): Observable<CategoryTree[]> {
    return this.apiService.get<CategoryTree[]>('categories/tree')
      .pipe(
        tap(tree => {
          this.categoryTreeSubject.next(tree);
        })
      );
  }

  /**
   * Get root categories (categories without parent)
   */
  getRootCategories(): Observable<CategoryResponse[]> {
    return this.apiService.get<CategoryResponse[]>('categories/root');
  }

  /**
   * Get category children
   */
  getCategoryChildren(parentId: string): Observable<CategoryResponse[]> {
    return this.apiService.get<CategoryResponse[]>(`categories/${parentId}/children`);
  }

  /**
   * Get category path (breadcrumb)
   */
  getCategoryPath(categoryId: string): Observable<CategoryResponse[]> {
    return this.apiService.get<CategoryResponse[]>(`categories/${categoryId}/path`);
  }

  /**
   * Search categories
   */
  searchCategories(query: string, filters: Partial<CategoryFilters> = {}): Observable<PaginatedResponse<CategoryResponse>> {
    return this.getCategories({ ...filters, query });
  }

  /**
   * Get active categories
   */
  getActiveCategories(filters: Partial<CategoryFilters> = {}): Observable<PaginatedResponse<CategoryResponse>> {
    return this.getCategories({ ...filters, isActive: true });
  }

  /**
   * Get inactive categories
   */
  getInactiveCategories(filters: Partial<CategoryFilters> = {}): Observable<PaginatedResponse<CategoryResponse>> {
    return this.getCategories({ ...filters, isActive: false });
  }

  /**
   * Activate category
   */
  activateCategory(id: string): Observable<CategoryResponse> {
    return this.apiService.patch<CategoryResponse>(`categories/${id}/activate`, {})
      .pipe(
        tap(category => {
          const currentCategories = this.categoriesSubject.value;
          const updatedCategories = currentCategories.map(c => 
            c.id === id ? { ...c, ...category } : c
          );
          this.categoriesSubject.next(updatedCategories);
          this.refreshCategoryTree();
        })
      );
  }

  /**
   * Deactivate category
   */
  deactivateCategory(id: string): Observable<CategoryResponse> {
    return this.apiService.patch<CategoryResponse>(`categories/${id}/deactivate`, {})
      .pipe(
        tap(category => {
          const currentCategories = this.categoriesSubject.value;
          const updatedCategories = currentCategories.map(c => 
            c.id === id ? { ...c, ...category } : c
          );
          this.categoriesSubject.next(updatedCategories);
          this.refreshCategoryTree();
        })
      );
  }

  /**
   * Move category to different parent
   */
  moveCategory(id: string, newParentId: string | null): Observable<CategoryResponse> {
    return this.apiService.patch<CategoryResponse>(`categories/${id}/move`, { parentId: newParentId })
      .pipe(
        tap(category => {
          const currentCategories = this.categoriesSubject.value;
          const updatedCategories = currentCategories.map(c => 
            c.id === id ? { ...c, ...category } : c
          );
          this.categoriesSubject.next(updatedCategories);
          this.refreshCategoryTree();
        })
      );
  }

  /**
   * Reorder categories
   */
  reorderCategories(categoryIds: string[]): Observable<void> {
    return this.apiService.post<void>('categories/reorder', { categoryIds })
      .pipe(
        tap(() => {
          this.refreshCategoryTree();
        })
      );
  }

  /**
   * Get category statistics
   */
  getCategoryStats(): Observable<any> {
    return this.apiService.get<any>('categories/stats');
  }

  /**
   * Get category product count
   */
  getCategoryProductCount(id: string): Observable<number> {
    return this.apiService.get<{ count: number }>(`categories/${id}/product-count`)
      .pipe(map(response => response.count));
  }

  /**
   * Bulk update categories
   */
  bulkUpdateCategories(updates: Array<{ id: string; data: UpdateCategoryRequest }>): Observable<CategoryResponse[]> {
    return this.apiService.post<CategoryResponse[]>('categories/bulk-update', { updates })
      .pipe(
        tap(() => {
          this.refreshCategoryTree();
        })
      );
  }

  /**
   * Bulk delete categories
   */
  bulkDeleteCategories(categoryIds: string[]): Observable<void> {
    return this.apiService.post<void>('categories/bulk-delete', { categoryIds })
      .pipe(
        tap(() => {
          this.refreshCategoryTree();
        })
      );
  }

  /**
   * Export categories
   */
  exportCategories(filters: CategoryFilters = {}): Observable<Blob> {
    return this.apiService.downloadFile('categories/export', 'categories.xlsx');
  }

  /**
   * Import categories
   */
  importCategories(file: File): Observable<{ success: number; errors: any[] }> {
    return this.apiService.uploadFile<{ success: number; errors: any[] }>('categories/import', file)
      .pipe(
        tap(() => {
          this.refreshCategoryTree();
        })
      );
  }

  /**
   * Get current categories
   */
  getCurrentCategories(): CategoryResponse[] {
    return this.categoriesSubject.value;
  }

  /**
   * Get current category tree
   */
  getCurrentCategoryTree(): CategoryTree[] {
    return this.categoryTreeSubject.value;
  }

  /**
   * Get current category
   */
  getCurrentCategory(): CategoryResponse | null {
    return this.currentCategorySubject.value;
  }

  /**
   * Clear current category
   */
  clearCurrentCategory(): void {
    this.currentCategorySubject.next(null);
  }

  /**
   * Refresh categories list
   */
  refreshCategories(filters: CategoryFilters = {}): void {
    this.getCategories(filters).subscribe();
  }

  /**
   * Refresh category tree
   */
  refreshCategoryTree(): void {
    this.getCategoryTree().subscribe();
  }

  /**
   * Refresh current category
   */
  refreshCurrentCategory(): void {
    const currentCategory = this.currentCategorySubject.value;
    if (currentCategory) {
      this.getCategory(currentCategory.id).subscribe();
    }
  }

  /**
   * Find category by name in tree
   */
  findCategoryInTree(tree: CategoryTree[], name: string): CategoryTree | null {
    for (const category of tree) {
      if (category.name.toLowerCase() === name.toLowerCase()) {
        return category;
      }
      if (category.children.length > 0) {
        const found = this.findCategoryInTree(category.children, name);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Get category breadcrumb
   */
  getCategoryBreadcrumb(tree: CategoryTree[], categoryId: string): CategoryTree[] {
    const breadcrumb: CategoryTree[] = [];
    
    const findPath = (categories: CategoryTree[], targetId: string, path: CategoryTree[]): boolean => {
      for (const category of categories) {
        const currentPath = [...path, category];
        if (category.id === targetId) {
          breadcrumb.push(...currentPath);
          return true;
        }
        if (category.children.length > 0 && findPath(category.children, targetId, currentPath)) {
          return true;
        }
      }
      return false;
    };

    findPath(tree, categoryId, []);
    return breadcrumb;
  }
}
