import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../shared/services/toast.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ViewToggleComponent } from '../../core/components';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  status: 'ACTIVE' | 'INACTIVE';
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

interface Product {
  id: string;
  name: string;
  sku: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';
  stock?: number;
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
  
  // Modal de produtos
  showProductsModal = false;
  selectedCategory: Category | null = null;
  categoryProducts: Product[] = [];
  
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
    private categoryService: CategoryService,
    private toast: ToastService,
    private productService: ProductService
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
    
    const filters = {
      query: this.searchTerm || undefined,
      page: this.paginationConfig.currentPage,
      limit: this.paginationConfig.itemsPerPage
    };
    
    this.categoryService.getCategories(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.categories = response.data;
          // Aplica filtro local de busca e atualiza paginação
          this.applyCategoryFilter();
        },
        error: (error) => {
          console.error('Erro ao carregar categorias:', error);
          this.dialogService.showError('Erro ao carregar categorias. Tente novamente.')
            .subscribe();
        }
      });
  }

  filterCategories(): void {
    // Reset para primeira página ao filtrar
    this.paginationConfig.currentPage = 1;
    // Aplicar filtro localmente (backend não expõe busca)
    this.applyCategoryFilter();
  }

  onSearchChange(): void {
    this.filterCategories();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterCategories();
  }

  // Pagination is now handled by backend via loadCategories()

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    // Paginação local sobre a lista filtrada
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
      status: 'ACTIVE',
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
      // Update existing category - send only updatable fields
      const updateData = {
        name: this.editingCategory.name,
        description: this.editingCategory.description,
        status: this.editingCategory.status,
        sortOrder: this.editingCategory.sortOrder
      };
      
      this.categoryService.updateCategory(this.editingCategory.id, updateData)
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
            this.dialogService.showError('Erro ao atualizar categoria. Tente novamente.')
              .subscribe(() => {
                // Close modal when user closes error dialog
                this.showAddModal = false;
                this.editingCategory = null;
              });
          }
        });
    } else {
      // Create new category - send only required fields
      const categoryData = {
        name: this.editingCategory.name,
        description: this.editingCategory.description,
        status: this.editingCategory.status,
        sortOrder: this.editingCategory.sortOrder
      };
      
      this.categoryService.createCategory(categoryData)
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
            this.dialogService.showError('Erro ao criar categoria. Tente novamente.')
              .subscribe(() => {
                // Close modal when user closes error dialog
                this.showAddModal = false;
                this.editingCategory = null;
              });
          }
        });
    }
  }

  deleteCategory(category: Category): void {
    // Sempre verificar se há produtos na categoria primeiro
    this.selectedCategory = category;
    this.loadCategoryProducts(category.id);
    this.showProductsModal = true;
  }

  toggleCategoryStatus(category: Category): void {
    const updatedCategory = { 
      status: category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
    };
    
    this.categoryService.updateCategory(category.id, updatedCategory)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialogService.showSuccess(`Categoria ${updatedCategory.status === 'ACTIVE' ? 'ativada' : 'desativada'} com sucesso!`);
          this.loadCategories();
        },
        error: (error) => {
          console.error('Erro ao alterar status da categoria:', error);
          this.dialogService.showError('Erro ao alterar status da categoria. Tente novamente.')
            .subscribe();
        }
      });
  }

  cancelEdit(): void {
    this.showAddModal = false;
    this.editingCategory = null;
  }

  getStatusClass(status: 'ACTIVE' | 'INACTIVE'): string {
    return status === 'ACTIVE' ? 'status-active' : 'status-inactive';
  }

  getStatusLabel(status: 'ACTIVE' | 'INACTIVE'): string {
    return status === 'ACTIVE' ? 'Ativa' : 'Inativa';
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
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    return this.filteredCategories.slice(startIndex, endIndex);
  }

  getStatusText(status: 'ACTIVE' | 'INACTIVE'): string {
    return status === 'ACTIVE' ? 'Ativo' : 'Inativo';
  }

  onItemsPerPageChange(limit: number): void {
    this.paginationConfig.itemsPerPage = limit;
    this.paginationConfig.currentPage = 1;
    // Atualiza exibição localmente
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingCategory = null;
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    this.viewPreferencesService.setViewPreference('categories', view);
  }

  private applyCategoryFilter(): void {
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (!term) {
      this.filteredCategories = [...this.categories];
      this.paginationConfig.totalItems = this.filteredCategories.length;
      return;
    }
    this.filteredCategories = this.categories.filter(c => {
      const name = (c.name || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      return name.includes(term) || desc.includes(term);
    });
    this.paginationConfig.totalItems = this.filteredCategories.length;
  }

  // Métodos do modal de produtos
  loadCategoryProducts(categoryId: string): void {
    this.productService.getProducts({ categoryId, page: 1, limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categoryProducts = response.data || [];
        },
        error: (error) => {
          console.error('Erro ao carregar produtos da categoria:', error);
          this.toast.error('Erro', 'Não foi possível carregar os produtos da categoria.');
        }
      });
  }

  closeProductsModal(): void {
    this.showProductsModal = false;
    this.selectedCategory = null;
    this.categoryProducts = [];
  }

  confirmDeleteCategory(): void {
    if (!this.selectedCategory) return;

    this.dialogService.showConfirm(
      `Tem certeza que deseja excluir a categoria "${this.selectedCategory.name}"?`,
      'Confirmar exclusão'
    ).subscribe(result => {
      if (result.confirmed) {
        this.categoryService.deleteCategory(this.selectedCategory!.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialogService.showSuccess('Categoria excluída com sucesso!');
              this.closeProductsModal();
              this.loadCategories();
            },
            error: (error) => {
              console.error('Erro ao excluir categoria:', error);
              const message = (error?.error?.message || error?.message || '').toString();
              
              if (error?.status === 400) {
                if (message.includes('Cannot delete category with subcategories')) {
                  this.toast.error('Não é possível excluir', 'A categoria possui subcategorias. Remova as subcategorias primeiro.');
                } else if (message.includes('active products')) {
                  // Nova mensagem do backend com quantidade de produtos ativos
                  this.toast.error('Não é possível excluir', message.replace('Cannot delete category with ', 'A categoria possui ').replace(' active products. Please deactivate or delete the products first.', ' produtos ativos. Desative ou exclua os produtos primeiro.'));
                } else if (message.includes('Cannot delete category with products')) {
                  // Fallback para a mensagem antiga
                  this.toast.error('Não é possível excluir', 'A categoria possui produtos ativos. Desative ou exclua os produtos primeiro.');
                } else {
                  this.toast.error('Não é possível excluir', message);
                }
              } else {
                this.dialogService.showError('Erro ao excluir categoria. Tente novamente.')
                  .subscribe();
              }
            }
          });
      }
    });
  }

  getProductStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'INACTIVE': return 'status-inactive';
      case 'DISCONTINUED': return 'status-discontinued';
      case 'OUT_OF_STOCK': return 'status-out-of-stock';
      default: return 'status-unknown';
    }
  }

  getProductStatusText(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Ativo';
      case 'INACTIVE': return 'Inativo';
      case 'DISCONTINUED': return 'Descontinuado';
      case 'OUT_OF_STOCK': return 'Sem Estoque';
      default: return 'Desconhecido';
    }
  }

  deactivateProductFromCategory(product: Product): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja desativar o produto "${product.name}"?`,
      'Confirmar desativação'
    ).subscribe(result => {
      if (result.confirmed) {
        this.productService.updateProduct(product.id, { status: 'INACTIVE' })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toast.success('Produto desativado', 'O produto foi desativado com sucesso.');
              this.loadCategoryProducts(this.selectedCategory!.id);
            },
            error: (error) => {
              console.error('Erro ao desativar produto:', error);
              this.toast.error('Erro', 'Não foi possível desativar o produto.');
            }
          });
      }
    });
  }

  activateProductFromCategory(product: Product): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja ativar o produto "${product.name}"?`,
      'Confirmar ativação'
    ).subscribe(result => {
      if (result.confirmed) {
        this.productService.updateProduct(product.id, { status: 'ACTIVE' })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toast.success('Produto ativado', 'O produto foi ativado com sucesso.');
              this.loadCategoryProducts(this.selectedCategory!.id);
            },
            error: (error) => {
              console.error('Erro ao ativar produto:', error);
              this.toast.error('Erro', 'Não foi possível ativar o produto.');
            }
          });
      }
    });
  }

  deleteProductFromCategory(product: Product): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja excluir o produto "${product.name}"?`,
      'Confirmar exclusão'
    ).subscribe(result => {
      if (result.confirmed) {
        this.productService.deleteProduct(product.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toast.success('Produto excluído', 'O produto foi excluído com sucesso.');
              this.loadCategoryProducts(this.selectedCategory!.id);
              this.loadCategories(); // Atualizar contagem de produtos
            },
            error: (error) => {
              console.error('Erro ao excluir produto:', error);
              this.toast.error('Erro', 'Não foi possível excluir o produto.');
            }
          });
      }
    });
  }

  deactivateAllProducts(): void {
    const activeProducts = this.categoryProducts.filter(p => p.status === 'ACTIVE');
    if (activeProducts.length === 0) {
      this.toast.info('Informação', 'Não há produtos ativos para desativar.');
      return;
    }

    this.dialogService.showConfirm(
      `Tem certeza que deseja desativar todos os ${activeProducts.length} produtos ativos desta categoria?`,
      'Confirmar desativação em massa'
    ).subscribe(result => {
      if (result.confirmed) {
        const updatePromises = activeProducts.map(product => 
          this.productService.updateProduct(product.id, { status: 'INACTIVE' }).toPromise()
        );

        Promise.all(updatePromises)
          .then(() => {
            this.toast.success('Produtos desativados', `${activeProducts.length} produtos foram desativados com sucesso.`);
            this.loadCategoryProducts(this.selectedCategory!.id);
          })
          .catch((error) => {
            console.error('Erro ao desativar produtos:', error);
            this.toast.error('Erro', 'Não foi possível desativar todos os produtos.');
          });
      }
    });
  }

  deleteAllInactiveProducts(): void {
    const inactiveProducts = this.categoryProducts.filter(p => p.status !== 'ACTIVE');
    if (inactiveProducts.length === 0) {
      this.toast.info('Informação', 'Não há produtos inativos para excluir.');
      return;
    }

    this.dialogService.showConfirm(
      `Tem certeza que deseja excluir todos os ${inactiveProducts.length} produtos inativos desta categoria?`,
      'Confirmar exclusão em massa'
    ).subscribe(result => {
      if (result.confirmed) {
        const deletePromises = inactiveProducts.map(product => 
          this.productService.deleteProduct(product.id).toPromise()
        );

        Promise.all(deletePromises)
          .then(() => {
            this.toast.success('Produtos excluídos', `${inactiveProducts.length} produtos foram excluídos com sucesso.`);
            this.loadCategoryProducts(this.selectedCategory!.id);
            this.loadCategories(); // Atualizar contagem de produtos
          })
          .catch((error) => {
            console.error('Erro ao excluir produtos:', error);
            this.toast.error('Erro', 'Não foi possível excluir todos os produtos.');
          });
      }
    });
  }

}