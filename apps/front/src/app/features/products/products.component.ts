import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from '../../core/services/dialog.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { MultiSelectComponent, MultiSelectOption } from '../../core/components/multi-select/multi-select.component';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';
import { ViewToggleComponent } from '../../core/components';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  status: 'active' | 'inactive' | 'low-stock';
  lastUpdated: Date;
  images: string[];
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectComponent, PaginationComponent, ViewToggleComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
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

  constructor(
    private dialogService: DialogService,
    private viewPreferencesService: ViewPreferencesService,
    private route: ActivatedRoute
  ) {}

  categories = [
    'Eletrônicos',
    'Informática',
    'Casa e Jardim',
    'Esportes',
    'Livros',
    'Roupas',
    'Acessórios'
  ];

  statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
    { value: 'low-stock', label: 'Estoque Baixo' }
  ];

  stockFilterOptions = [
    { value: '', label: 'Todos os produtos' },
    { value: 'low', label: 'Estoque baixo (< 10)' },
    { value: 'medium', label: 'Estoque médio (10-50)' },
    { value: 'high', label: 'Estoque alto (> 50)' },
    { value: 'out', label: 'Sem estoque (0)' }
  ];

  // Multi-select options
  categoryOptions: MultiSelectOption[] = [];

  ngOnInit(): void {
    this.loadProducts();
    this.initializeCategoryOptions();
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

  private initializeCategoryOptions(): void {
    this.categoryOptions = this.categories.map(category => ({
      value: category,
      label: category,
      selected: false
    }));
  }

  private loadProducts(): void {
    // Mock data - substituir por chamada da API
    this.products = [
      {
        id: 1,
        name: 'Notebook Dell Inspiron 15',
        category: 'Informática',
        price: 2500.00,
        stock: 15,
        sku: 'DELL-INS15-001',
        status: 'active',
        lastUpdated: new Date('2024-01-15'),
        images: [
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'
        ]
      },
      {
        id: 2,
        name: 'Mouse sem fio Logitech',
        category: 'Informática',
        price: 89.90,
        stock: 3,
        sku: 'LOG-MX3-002',
        status: 'low-stock',
        lastUpdated: new Date('2024-01-14'),
        images: [
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'
        ]
      },
      {
        id: 3,
        name: 'Teclado Mecânico RGB',
        category: 'Informática',
        price: 299.90,
        stock: 25,
        sku: 'MECH-KB-003',
        status: 'active',
        lastUpdated: new Date('2024-01-13'),
        images: [
          'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
          'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop&sat=-50'
        ]
      },
      {
        id: 4,
        name: 'Monitor 24" Full HD',
        category: 'Informática',
        price: 899.90,
        stock: 8,
        sku: 'MON-24FHD-004',
        status: 'active',
        lastUpdated: new Date('2024-01-12'),
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'
        ]
      },
      {
        id: 5,
        name: 'Smartphone Samsung Galaxy',
        category: 'Eletrônicos',
        price: 1899.90,
        stock: 0,
        sku: 'SAM-GAL-005',
        status: 'inactive',
        lastUpdated: new Date('2024-01-11'),
        images: []
      },
      {
        id: 6,
        name: 'Smartphone Samsung Galaxy A54',
        category: 'Eletrônicos',
        price: 1200.00,
        stock: 3,
        sku: 'SAM-A54-001',
        status: 'low-stock',
        lastUpdated: new Date('2024-01-12'),
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
        ]
      },
      {
        id: 7,
        name: 'Monitor LG 24"',
        category: 'Informática',
        price: 800.00,
        stock: 0,
        sku: 'LG-24-001',
        status: 'inactive',
        lastUpdated: new Date('2024-01-08'),
        images: []
      },
      {
        id: 8,
        name: 'Teclado Mecânico RGB',
        category: 'Informática',
        price: 250.00,
        stock: 5,
        sku: 'TEC-RGB-001',
        status: 'low-stock',
        lastUpdated: new Date('2024-01-14'),
        images: []
      }
    ];
    this.filteredProducts = [...this.products];
    this.updatePagination();
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      // Filtro por busca (nome ou SKU)
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtro por categorias (múltiplas)
      const matchesCategory = this.selectedCategories.length === 0 || 
                             this.selectedCategories.includes(product.category);
      
      // Filtro por status
      const matchesStatus = !this.selectedStatus || product.status === this.selectedStatus;
      
      // Filtro por estoque
      const matchesStock = this.matchesStockFilter(product.stock);
      
      // Filtro por faixa de preço
      const matchesPrice = this.matchesPriceFilter(product.price);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesPrice;
    });

    // Atualizar paginação
    this.updatePagination();
  }

  private updatePagination(): void {
    this.paginationConfig = {
      ...this.paginationConfig,
      totalItems: this.filteredProducts.length,
      currentPage: 1 // Reset para primeira página quando filtrar
    };
  }

  private matchesStockFilter(stock: number): boolean {
    if (!this.selectedStockFilter) return true;
    
    switch (this.selectedStockFilter) {
      case 'low': return stock < 10;
      case 'medium': return stock >= 10 && stock <= 50;
      case 'high': return stock > 50;
      case 'out': return stock === 0;
      default: return true;
    }
  }

  private matchesPriceFilter(price: number): boolean {
    const min = this.minPrice ? parseFloat(this.minPrice) : 0;
    const max = this.maxPrice ? parseFloat(this.maxPrice) : Infinity;
    return price >= min && price <= max;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategories = [];
    this.selectedStatus = '';
    this.selectedStockFilter = '';
    this.minPrice = '';
    this.maxPrice = '';
    
    // Reset multi-select options
    this.categoryOptions.forEach(option => option.selected = false);
    
    this.filterProducts();
  }

  onCategorySelectionChange(selectedValues: string[]): void {
    this.selectedCategories = selectedValues;
    this.filterProducts();
  }

  onPageChange(page: number): void {
    this.paginationConfig = {
      ...this.paginationConfig,
      currentPage: page
    };
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.paginationConfig = {
      ...this.paginationConfig,
      itemsPerPage: itemsPerPage,
      currentPage: 1
    };
  }

  getPaginatedProducts(): Product[] {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    // Salva a preferência no localStorage
    this.viewPreferencesService.setViewPreference('products', view);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'low-stock': return 'status-low-stock';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'low-stock': return 'Estoque Baixo';
      default: return status;
    }
  }

  addProduct(): void {
    this.editingProduct = {
      id: 0,
      name: '',
      category: '',
      price: 0,
      stock: 0,
      sku: '',
      status: 'active',
      lastUpdated: new Date(),
      images: []
    };
    this.showAddModal = true;
  }

  editProduct(product: Product): void {
    this.editingProduct = { ...product };
    this.showAddModal = true;
  }

  deleteProduct(product: Product): void {
    this.dialogService.confirmDelete(product.name, 'produto').subscribe(result => {
      if (result.confirmed) {
        this.products = this.products.filter(p => p.id !== product.id);
        this.filterProducts();
      }
    });
  }

  saveProduct(): void {
    // TODO: Implementar salvamento
    console.log('Salvando produto:', this.editingProduct);
    this.showAddModal = false;
    this.editingProduct = null;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingProduct = null;
  }

  onImageSelect(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const maxFiles = 5;
      const currentImages = this.editingProduct?.images || [];
      const remainingSlots = maxFiles - currentImages.length;
      const filesToAdd = Math.min(files.length, remainingSlots);
      
      for (let i = 0; i < filesToAdd; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            if (this.editingProduct) {
              if (!this.editingProduct.images) {
                this.editingProduct.images = [];
              }
              this.editingProduct.images.push(e.target.result);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  }

  removeImage(index: number): void {
    if (this.editingProduct && this.editingProduct.images) {
      this.editingProduct.images.splice(index, 1);
    }
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
}
