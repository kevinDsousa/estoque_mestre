import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { ProductService, ProductFilters } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { MultiSelectComponent, MultiSelectOption } from '../../core/components/multi-select/multi-select.component';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';
import { ViewToggleComponent } from '../../core/components';

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
    private categoryService: CategoryService
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

  private initializeCategoryOptions(): void {
    this.categoryOptions = this.categories.map(category => ({
      value: category.id,
      label: category.name,
      selected: false
    }));
  }

  private loadProducts(): void {
    this.loading = true;
    
    const filters: ProductFilters = {
      query: this.searchTerm,
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
          // Mapear dados do backend para interface local
          this.products = response.data.map(product => ({
            ...product,
            trackExpiration: (product as any).trackExpiration || false,
            isTaxable: (product as any).isTaxable || false,
            price: product.sellingPrice,
            stock: product.currentStock,
            lastUpdated: product.updatedAt
          }));
          this.paginationConfig.totalItems = response.pagination.total;
          this.filteredProducts = [...this.products];
          this.updatePagination();
        },
        error: (error) => {
          console.error('Erro ao carregar produtos:', error);
          this.dialogService.showError('Erro ao carregar produtos. Tente novamente.');
        }
      });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      // Filtro por busca (nome ou SKU)
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtro por categorias (múltiplas)
      const matchesCategory = this.selectedCategories.length === 0 || 
                             this.selectedCategories.includes(product.categoryId);
      
      // Filtro por status
      const matchesStatus = !this.selectedStatus || product.status === this.selectedStatus;
      
      // Filtro por preço
      const matchesPrice = (!this.minPrice || product.sellingPrice >= parseFloat(this.minPrice)) &&
                          (!this.maxPrice || product.sellingPrice <= parseFloat(this.maxPrice));
      
      // Filtro por estoque
      let matchesStock = true;
      if (this.selectedStockFilter) {
        switch (this.selectedStockFilter) {
          case 'low':
            matchesStock = product.currentStock < product.minStock;
            break;
          case 'medium':
            matchesStock = product.currentStock >= product.minStock && product.currentStock <= 50;
            break;
          case 'high':
            matchesStock = product.currentStock > 50;
            break;
          case 'out':
            matchesStock = product.currentStock === 0;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesStatus && matchesPrice && matchesStock;
    });
    
    this.updatePagination();
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
    this.filterProducts();
  }

  onPriceFilterChange(): void {
    this.filterProducts();
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

  updatePagination(): void {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    this.filteredProducts = this.products.slice(startIndex, endIndex);
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
    this.editingProduct = { ...product };
    this.showAddModal = true;
  }

  saveProduct(): void {
    if (!this.editingProduct) return;

    if (this.editingProduct.id) {
      // Update existing product
      this.productService.updateProduct(this.editingProduct.id, this.editingProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogService.showSuccess('Produto atualizado com sucesso!');
            this.loadProducts();
            this.showAddModal = false;
            this.editingProduct = null;
          },
          error: (error) => {
            console.error('Erro ao atualizar produto:', error);
            this.dialogService.showError('Erro ao atualizar produto. Tente novamente.');
          }
        });
    } else {
      // Create new product
      this.productService.createProduct(this.editingProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogService.showSuccess('Produto criado com sucesso!');
            this.loadProducts();
            this.showAddModal = false;
            this.editingProduct = null;
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
              this.dialogService.showError('Erro ao excluir produto. Tente novamente.');
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
    return this.filteredProducts;
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
    console.log('Imagem selecionada:', event);
  }

  removeImage(index: number): void {
    console.log('Remover imagem:', index);
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingProduct = null;
  }

  onItemsPerPageChange(limit: number): void {
    this.paginationConfig.itemsPerPage = limit;
    this.paginationConfig.currentPage = 1;
    this.loadProducts();
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    this.viewPreferencesService.setViewPreference('products', view);
  }
}