import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { CategoryService } from '../../core/services/category.service';
import { ViewToggleComponent } from '../../core/components';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  parent?: {
    id: string;
    name: string;
  };
  children?: Category[];
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent, PaginationComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = false;
  searchTerm = '';
  showAddModal = false;
  editingCategory: Category | null = null;
  currentView: ViewMode = 'cards';
  
  // Paginação
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10
  };

  private destroy$ = new Subject<void>();

  constructor(
    private dialogService: DialogService,
    private viewPreferencesService: ViewPreferencesService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    // Carrega a preferência salva
    this.currentView = this.viewPreferencesService.getViewPreference('categories');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.loading = true;
    
    this.categoryService.getCategories()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.categories = response.data;
          this.paginationConfig.totalItems = response.pagination.total;
          this.filteredCategories = [...this.categories];
          this.updatePagination();
        },
        error: (error) => {
          console.error('Erro ao carregar categorias:', error);
          this.dialogService.showError('Erro ao carregar categorias. Tente novamente.');
        }
      });
  }

  filterCategories(): void {
    this.filteredCategories = this.categories.filter(category =>
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
    this.paginationConfig.totalItems = this.filteredCategories.length;
    this.updatePagination();
  }

  onSearchChange(): void {
    this.filterCategories();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterCategories();
  }

  updatePagination(): void {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    this.filteredCategories = this.categories.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.updatePagination();
  }

  onViewModeChange(mode: ViewMode): void {
    this.currentView = mode;
    this.viewPreferencesService.setViewPreference('categories', mode);
  }

  addCategory(): void {
    this.editingCategory = {
      id: '',
      name: '',
      description: '',
      isActive: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.showAddModal = true;
  }

  editCategory(category: Category): void {
    this.editingCategory = { ...category };
    this.showAddModal = true;
  }

  saveCategory(): void {
    if (!this.editingCategory) return;

    if (this.editingCategory.id) {
      // Update existing category
      this.categoryService.updateCategory(this.editingCategory.id, this.editingCategory)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogService.showSuccess('Categoria atualizada com sucesso!');
            this.loadCategories();
            this.showAddModal = false;
            this.editingCategory = null;
          },
          error: (error) => {
            console.error('Erro ao atualizar categoria:', error);
            this.dialogService.showError('Erro ao atualizar categoria. Tente novamente.');
          }
        });
    } else {
      // Create new category
      this.categoryService.createCategory(this.editingCategory)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogService.showSuccess('Categoria criada com sucesso!');
            this.loadCategories();
            this.showAddModal = false;
            this.editingCategory = null;
          },
          error: (error) => {
            console.error('Erro ao criar categoria:', error);
            this.dialogService.showError('Erro ao criar categoria. Tente novamente.');
          }
        });
    }
  }

  deleteCategory(category: Category): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja excluir a categoria "${category.name}"?`,
      'Confirmar exclusão'
    ).subscribe(result => {
      if (result.confirmed) {
        this.categoryService.deleteCategory(category.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialogService.showSuccess('Categoria excluída com sucesso!');
              this.loadCategories();
            },
            error: (error) => {
              console.error('Erro ao excluir categoria:', error);
              this.dialogService.showError('Erro ao excluir categoria. Tente novamente.');
            }
          });
      }
    });
  }

  toggleCategoryStatus(category: Category): void {
    const updatedCategory = { ...category, isActive: !category.isActive };
    
    this.categoryService.updateCategory(category.id, updatedCategory)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialogService.showSuccess(`Categoria ${updatedCategory.isActive ? 'ativada' : 'desativada'} com sucesso!`);
          this.loadCategories();
        },
        error: (error) => {
          console.error('Erro ao alterar status da categoria:', error);
          this.dialogService.showError('Erro ao alterar status da categoria. Tente novamente.');
        }
      });
  }

  cancelEdit(): void {
    this.showAddModal = false;
    this.editingCategory = null;
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Ativa' : 'Inativa';
  }

  getProductCount(category: Category): number {
    return category.productCount || 0;
  }

  getParentName(category: Category): string {
    return category.parent?.name || 'Categoria principal';
  }

  hasChildren(category: Category): boolean {
    return !!(category.children && category.children.length > 0);
  }

  getChildrenCount(category: Category): number {
    return category.children?.length || 0;
  }

  // Métodos faltando para templates
  getPaginatedCategories(): Category[] {
    return this.filteredCategories;
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Ativo' : 'Inativo';
  }

  onItemsPerPageChange(limit: number): void {
    this.paginationConfig.itemsPerPage = limit;
    this.paginationConfig.currentPage = 1;
    this.loadCategories();
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingCategory = null;
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    this.viewPreferencesService.setViewPreference('categories', view);
  }
}