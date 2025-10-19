import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../core/services/dialog.service';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  status: 'active' | 'inactive' | 'low-stock';
  lastUpdated: Date;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedStockFilter = '';
  minPrice = '';
  maxPrice = '';
  showAddModal = false;
  editingProduct: Product | null = null;

  constructor(private dialogService: DialogService) {}

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

  ngOnInit(): void {
    this.loadProducts();
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
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: 2,
        name: 'Mouse sem fio Logitech',
        category: 'Informática',
        price: 89.90,
        stock: 3,
        sku: 'LOG-MX3-002',
        status: 'low-stock',
        lastUpdated: new Date('2024-01-14')
      },
      {
        id: 3,
        name: 'Teclado Mecânico RGB',
        category: 'Informática',
        price: 299.90,
        stock: 25,
        sku: 'MECH-KB-003',
        status: 'active',
        lastUpdated: new Date('2024-01-13')
      },
      {
        id: 4,
        name: 'Monitor 24" Full HD',
        category: 'Informática',
        price: 899.90,
        stock: 8,
        sku: 'MON-24FHD-004',
        status: 'active',
        lastUpdated: new Date('2024-01-12')
      },
      {
        id: 5,
        name: 'Smartphone Samsung Galaxy',
        category: 'Eletrônicos',
        price: 1899.90,
        stock: 0,
        sku: 'SAM-GAL-005',
        status: 'inactive',
        lastUpdated: new Date('2024-01-11')
      }
    ];
    this.filteredProducts = [...this.products];
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      // Filtro por busca (nome ou SKU)
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtro por categoria
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      
      // Filtro por status
      const matchesStatus = !this.selectedStatus || product.status === this.selectedStatus;
      
      // Filtro por estoque
      const matchesStock = this.matchesStockFilter(product.stock);
      
      // Filtro por faixa de preço
      const matchesPrice = this.matchesPriceFilter(product.price);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesPrice;
    });
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
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.selectedStockFilter = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.filterProducts();
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
    this.editingProduct = null;
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
}
