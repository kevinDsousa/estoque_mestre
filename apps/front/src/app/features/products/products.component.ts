import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { ProductService, ProductFilters } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { SupplierService } from '../../core/services/supplier.service';
import { MultiSelectComponent, MultiSelectOption } from '../../core/components/multi-select/multi-select.component';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';
import { ViewToggleComponent } from '../../core/components';
import { ToastService } from '../../shared/services/toast.service';

interface Product {
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
  // Propriedades para templates
  price?: number;
  stock?: number;
  lastUpdated?: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectComponent, PaginationComponent, ViewToggleComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: any[] = [];
  suppliers: any[] = [];
  loading = false;
  searchTerm = '';
  selectedCategories: string[] = [];
  selectedStatus = '';
  selectedStockFilter = '';
  minPrice = '';
  maxPrice = '';
  showAddModal = false;
  editingProduct: Product | null = null;
  currentView: ViewMode = 'table';
  // Upload de imagens (pré-visualização antes de enviar)
  selectedFiles: File[] = [];
  selectedPreviews: string[] = [];
  
  // Pagination
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10
  };

  private destroy$ = new Subject<void>();

  constructor(
    private dialogService: DialogService,
    private viewPreferencesService: ViewPreferencesService,
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'DISCONTINUED', label: 'Descontinuado' }
  ];

  stockFilterOptions = [
    { value: '', label: 'Todos os produtos' },
    { value: 'low', label: 'Estoque baixo' },
    { value: 'medium', label: 'Estoque médio' },
    { value: 'high', label: 'Estoque alto' },
    { value: 'out', label: 'Sem estoque (0)' }
  ];

  // Multi-select options
  categoryOptions: MultiSelectOption[] = [];

  ngOnInit(): void {
    this.loadCategories();
    this.loadSuppliers();
    this.loadProducts();
    // Carrega a preferência salva
    this.currentView = this.viewPreferencesService.getViewPreference('products');
    
    // Verifica se há query parameters para aplicar filtros
    this.route.queryParams.subscribe(params => {
      if (params['stockFilter'] === 'low') {
        this.selectedStockFilter = 'low';
        this.loadProducts();
        this.filterProducts(); // Aplica os filtros após carregar os produtos
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories.data;
          this.initializeCategoryOptions();
        },
        error: (error) => {
          console.error('Erro ao carregar categorias:', error);
        }
      });
  }

  private loadSuppliers(): void {
    this.supplierService.getSuppliers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.suppliers = (response as any).suppliers || [];
        },
        error: (error) => {
          console.error('Erro ao carregar fornecedores:', error);
        }
      });
  }

  private initializeCategoryOptions(): void {
    this.categoryOptions = this.categories.map(category => ({
      value: category.id,
      label: category.name,
      selected: false
    }));
  }

  private loadProducts(): void {
    console.log('loadProducts chamado');
    this.loading = true;
    
    const filters: ProductFilters = {
      search: this.searchTerm,
      categoryId: this.selectedCategories.length > 0 ? this.selectedCategories[0] : undefined,
      status: this.selectedStatus || undefined,
      minPrice: this.minPrice ? parseFloat(this.minPrice) : undefined,
      maxPrice: this.maxPrice ? parseFloat(this.maxPrice) : undefined,
      page: this.paginationConfig.currentPage,
      limit: this.paginationConfig.itemsPerPage,
      sortBy: 'name',
      sortOrder: 'asc'
    };
    

    this.productService.getProducts(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          // Verificar se a resposta tem a estrutura esperada
          const productsData = (response as any).products || (response as any).data || [];
          
          // Mapear dados do backend para interface local
          this.products = productsData.map((product: any) => ({
            ...product,
            trackExpiration: (product as any).trackExpiration || false,
            isTaxable: (product as any).isTaxable || false,
            price: product.sellingPrice,
            stock: product.currentStock,
            lastUpdated: product.updatedAt,
            category: product.category || { id: '', name: 'Sem categoria' },
            supplier: product.supplier || { id: '', name: 'Sem fornecedor' },
            // Garantir que o status seja preservado
            status: product.status
          }));
          
          // Atualizar configuração de paginação
          const paginationData = (response as any).pagination;
          if (paginationData) {
            this.paginationConfig.totalItems = paginationData.total || this.products.length;
            this.paginationConfig.currentPage = paginationData.page || 1;
            // Não sobrescrever itemsPerPage escolhido pelo usuário
          } else {
            // Fallback se não houver dados de paginação
            this.paginationConfig.totalItems = this.products.length;
            this.paginationConfig.currentPage = 1;
          }
          
          // Aplicar filtros locais (estoque e preço)
          this.applyClientFilters();
        },
        error: (error) => {
          console.error('Erro ao carregar produtos:', error);
          this.dialogService.showError('Erro ao carregar produtos. Tente novamente.');
        }
      });
  }

  filterProducts(): void {
    // Reset to first page when filtering
    this.paginationConfig.currentPage = 1;
    this.loadProducts();
  }

  private applyClientFilters(): void {
    // Base list from backend
    let list = this.products.slice();

    // Stock filter
    switch (this.selectedStockFilter) {
      case 'out':
        list = list.filter(p => (p.currentStock ?? p.stock ?? 0) === 0);
        break;
      case 'low':
        list = list.filter(p => (p.currentStock ?? p.stock ?? 0) > 0 && (p.currentStock ?? p.stock ?? 0) < (p.minStock ?? 5));
        break;
      case 'medium':
        list = list.filter(p => {
          const stock = (p.currentStock ?? p.stock ?? 0);
          const min = (p.minStock ?? 5);
          return stock >= min && stock <= min * 3;
        });
        break;
      case 'high':
        list = list.filter(p => {
          const stock = (p.currentStock ?? p.stock ?? 0);
          const min = (p.minStock ?? 5);
          return stock > min * 3;
        });
        break;
      default:
        break;
    }

    // Price filter (client-side)
    const min = this.minPrice ? parseFloat(this.minPrice) : undefined;
    const max = this.maxPrice ? parseFloat(this.maxPrice) : undefined;
    if (min !== undefined) {
      list = list.filter(p => (p.sellingPrice ?? p.price ?? 0) >= min);
    }
    if (max !== undefined) {
      list = list.filter(p => (p.sellingPrice ?? p.price ?? 0) <= max);
    }

    this.filteredProducts = list;
    this.paginationConfig.totalItems = list.length;
  }

  onSearchChange(): void {
    this.filterProducts();
  }

  onCategoryChange(): void {
    this.filterProducts();
  }

  onStatusChange(): void {
    this.filterProducts();
  }

  onStockFilterChange(): void {
    // Reset to first page and apply local filters immediately
    this.paginationConfig.currentPage = 1;
    this.applyClientFilters();
  }

  onPriceFilterChange(): void {
    // Apply client-side price filter together with stock filter
    this.paginationConfig.currentPage = 1;
    this.applyClientFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategories = [];
    this.selectedStatus = '';
    this.selectedStockFilter = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.filterProducts();
  }


  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.loadProducts();
  }

  onViewModeChange(mode: ViewMode): void {
    this.currentView = mode;
    this.viewPreferencesService.setViewPreference('products', mode);
  }

  addProduct(): void {
    // Reset de seleção de imagens
    this.selectedFiles = [];
    this.selectedPreviews = [];
    this.editingProduct = {
      id: '',
      name: '',
      sku: '',
      status: 'ACTIVE',
      type: 'PRODUCT',
      costPrice: 0,
      sellingPrice: 0,
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      categoryId: '',
      supplierId: '',
      trackExpiration: false,
      isTaxable: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.showAddModal = true;
  }

  editProduct(product: Product): void {
    // Reset de seleção de imagens ao abrir modal
    this.selectedFiles = [];
    this.selectedPreviews = [];
    this.editingProduct = { ...product };
    this.showAddModal = true;
  }

  saveProduct(): void {
    if (!this.editingProduct) return;

    // Map form data to API format
    const productData = {
      ...this.editingProduct,
      type: 'ACCESSORY', // Use valid API type
      costPrice: this.editingProduct.costPrice || 0,
      sellingPrice: this.editingProduct.price || 0,
      currentStock: this.editingProduct.stock || 0,
      supplierId: this.editingProduct.supplierId || '', // Add default supplier
      status: this.editingProduct.status || 'ACTIVE'
    };

    if (this.editingProduct.id) {
      // Update existing product
      this.productService.updateProduct(this.editingProduct.id, productData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedProduct) => {
            // Atualizar produto localmente na lista
            const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
            if (index !== -1) {
              this.products[index] = {
                ...updatedProduct,
                price: updatedProduct.sellingPrice,
                stock: updatedProduct.currentStock,
                lastUpdated: updatedProduct.updatedAt
              };
              this.filteredProducts = this.products.slice();
            }
            
            this.closeModal();
            this.dialogService.showSuccess('Produto atualizado com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao atualizar produto:', error);
            this.dialogService.showError('Erro ao atualizar produto. Tente novamente.');
          }
        });
    } else {
      // Create new product
      this.productService.createProduct(productData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.closeModal();
            this.dialogService.showSuccess('Produto criado com sucesso!');
            this.loadProducts();
          },
          error: (error) => {
            console.error('Erro ao criar produto:', error);
            this.dialogService.showError('Erro ao criar produto. Tente novamente.');
          }
        });
    }
  }

  deleteProduct(product: Product): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja excluir o produto "${product.name}"?`,
      'Confirmar exclusão'
    ).subscribe(result => {
      if (result.confirmed) {
        this.productService.deleteProduct(product.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialogService.showSuccess('Produto excluído com sucesso!');
              this.loadProducts();
            },
            error: (error) => {
              console.error('Erro ao excluir produto:', error);
              
              // Verificar se é o erro específico de histórico de inventário
              if (error.message && error.message.includes('inventory history')) {
                this.showDeleteWithHistoryDialog(product);
              } else {
                this.dialogService.showError('Erro ao excluir produto. Tente novamente.');
              }
            }
          });
      }
    });
  }

  private showDeleteWithHistoryDialog(product: Product): void {
    this.dialogService.warning({
      title: 'Não é possível excluir este produto',
      message: `O produto "${product.name}" possui histórico de movimentação de inventário e não pode ser excluído. Você pode desativá-lo para que não apareça nas listagens ativas.`,
      confirmText: 'Desativar produto',
      cancelText: 'Cancelar',
      icon: 'pi pi-exclamation-triangle'
    }).subscribe(result => {
      if (result.confirmed) {
        this.deactivateProduct(product);
      }
    });
  }

  deactivateProduct(product: Product): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja desativar o produto "${product.name}"?`,
      'Confirmar desativação'
    ).subscribe(result => {
      if (result.confirmed) {
        const updateData = {
          ...product,
          status: 'INACTIVE' as const
        };

        this.productService.updateProduct(product.id, updateData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              console.log('Produto desativado com sucesso, atualizando lista local...');
              this.dialogService.showSuccess('Produto desativado com sucesso!');
              
              // Atualizar produto na lista local
              const productIndex = this.products.findIndex(p => p.id === product.id);
              if (productIndex !== -1) {
                this.products[productIndex].status = 'INACTIVE';
                this.filteredProducts = [...this.products];
                console.log('Produto atualizado na lista local:', this.products[productIndex]);
              }
              
              // Limpar filtro de status para mostrar todos os produtos
              this.selectedStatus = '';
              // Forçar detecção de mudanças
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Erro ao desativar produto:', error);
              this.dialogService.showError('Erro ao desativar produto. Tente novamente.');
            }
          });
      }
    });
  }

  activateProduct(product: Product): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja ativar o produto "${product.name}"?`,
      'Confirmar ativação'
    ).subscribe(result => {
      if (result.confirmed) {
        const updateData = {
          ...product,
          status: 'ACTIVE' as const
        };

        this.productService.updateProduct(product.id, updateData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialogService.showSuccess('Produto ativado com sucesso!');

              // Atualizar produto na lista local
              const productIndex = this.products.findIndex(p => p.id === product.id);
              if (productIndex !== -1) {
                this.products[productIndex].status = 'ACTIVE';
                this.applyClientFilters();
              }

              // Forçar detecção de mudanças se necessário
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Erro ao ativar produto:', error);
              this.dialogService.showError('Erro ao ativar produto. Tente novamente.');
            }
          });
      }
    });
  }

  cancelEdit(): void {
    this.showAddModal = false;
    this.editingProduct = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'INACTIVE':
        return 'status-inactive';
      case 'DISCONTINUED':
        return 'status-discontinued';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'INACTIVE':
        return 'Inativo';
      case 'DISCONTINUED':
        return 'Descontinuado';
      default:
        return status;
    }
  }

  getStockClass(stock: number, minStock: number): string {
    if (stock === 0) return 'stock-out';
    if (stock < minStock) return 'stock-low';
    if (stock > 50) return 'stock-high';
    return 'stock-normal';
  }

  getStockLabel(stock: number, minStock: number): string {
    if (stock === 0) return 'Sem estoque';
    if (stock < minStock) return 'Estoque baixo';
    if (stock > 50) return 'Estoque alto';
    return 'Estoque normal';
  }

  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return 'https://via.placeholder.com/100x100?text=Sem+Imagem';
  }

  getProductPrice(product: Product): number {
    return product.sellingPrice;
  }

  getProductStock(product: Product): number {
    return product.currentStock;
  }

  getProductCategory(product: Product): string {
    return product.category?.name || 'Sem categoria';
  }

  getProductSupplier(product: Product): string {
    return product.supplier?.name || 'Sem fornecedor';
  }

  // Métodos faltando para templates
  getPaginatedProducts(): Product[] {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Ativo',
      'INACTIVE': 'Inativo',
      'DISCONTINUED': 'Descontinuado'
    };
    return statusMap[status] || status;
  }

  onCategorySelectionChange(selectedCategories: string[]): void {
    this.selectedCategories = selectedCategories;
    this.filterProducts();
  }

  onImageError(event: any): void {
    console.log('Erro ao carregar imagem:', event);
  }

  onImageSelect(event: any): void {
    const files: FileList | null = event?.target?.files || null;
    if (!files || !this.editingProduct) return;
    const currentCount = this.selectedFiles.length;
    const maxToAdd = Math.max(0, 5 - currentCount);
    if (maxToAdd === 0) {
      this.dialogService.showError('Você pode selecionar no máximo 5 imagens.');
      return;
    }

    const filesArray = Array.from(files).slice(0, maxToAdd);
    for (const file of filesArray) {
      // Verifica duplicado por nome+tamanho (heurística suficiente para evitar reenvio da mesma imagem)
      const isDuplicate = this.selectedFiles.some(f => f.name === file.name && f.size === file.size);
      if (isDuplicate) {
        this.toast.warning('Imagem duplicada', 'Esta imagem já foi adicionada.');
        continue;
      }
      this.selectedFiles.push(file);
      const objectUrl = URL.createObjectURL(file);
      this.selectedPreviews.push(objectUrl);
    }
    // Atualiza pré-visualização no modal
    (this.editingProduct as any).images = [...this.selectedPreviews];
  }

  removeImage(index: number): void {
    const url = this.selectedPreviews[index];
    if (url) {
      try { URL.revokeObjectURL(url); } catch {}
    }
    this.selectedPreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    if (this.editingProduct) {
      (this.editingProduct as any).images = [...this.selectedPreviews];
    }
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingProduct = null;
    // Limpa seleções e pré-visualizações
    for (const url of this.selectedPreviews) {
      try { URL.revokeObjectURL(url); } catch {}
    }
    this.selectedFiles = [];
    this.selectedPreviews = [];
  }

  onItemsPerPageChange(limit: number): void {
    this.paginationConfig.itemsPerPage = limit;
    this.paginationConfig.currentPage = 1;
    // Recalcula apenas no cliente para refletir range e páginas
    this.applyClientFilters();
    this.cdr.detectChanges();
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    this.viewPreferencesService.setViewPreference('products', view);
  }
}