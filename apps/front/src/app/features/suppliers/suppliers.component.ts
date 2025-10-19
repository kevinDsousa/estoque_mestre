import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../core/services/dialog.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { ViewToggleComponent } from '../../core/components';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';

interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  productCount: number;
  isActive: boolean;
}

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent, PaginationComponent],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  searchTerm = '';
  currentView: ViewMode = 'cards';
  
  // Paginação
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10
  };

  constructor(
    private dialogService: DialogService,
    private viewPreferencesService: ViewPreferencesService
  ) {}

  ngOnInit(): void {
    // Carrega a preferência salva
    this.currentView = this.viewPreferencesService.getViewPreference('suppliers');
    
    this.loadSuppliers();
  }

  private loadSuppliers(): void {
    this.suppliers = [
      {
        id: 1,
        name: 'Tech Solutions Ltda',
        contact: 'João Silva',
        email: 'joao@techsolutions.com',
        phone: '(11) 99999-9999',
        address: 'São Paulo, SP',
        productCount: 45,
        isActive: true
      },
      {
        id: 2,
        name: 'Electronics Corp',
        contact: 'Maria Santos',
        email: 'maria@electronics.com',
        phone: '(11) 88888-8888',
        address: 'Rio de Janeiro, RJ',
        productCount: 32,
        isActive: true
      },
      {
        id: 3,
        name: 'Gadget World',
        contact: 'Pedro Costa',
        email: 'pedro@gadgetworld.com',
        phone: '(11) 77777-7777',
        address: 'Belo Horizonte, MG',
        productCount: 18,
        isActive: false
      }
    ];
    this.filteredSuppliers = [...this.suppliers];
    this.updatePagination();
  }

  editSupplier(supplier: Supplier): void {
    console.log('Editando fornecedor:', supplier);
    // TODO: Implementar modal de edição
  }

  viewProducts(supplier: Supplier): void {
    console.log('Visualizando produtos do fornecedor:', supplier);
    // TODO: Navegar para página de produtos filtrados por fornecedor
  }

  deleteSupplier(supplier: Supplier): void {
    this.dialogService.confirmDelete(supplier.name, 'fornecedor').subscribe(result => {
      if (result.confirmed) {
        this.suppliers = this.suppliers.filter(s => s.id !== supplier.id);
        console.log('Fornecedor excluído:', supplier);
      }
    });
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    // Salva a preferência no localStorage
    this.viewPreferencesService.setViewPreference('suppliers', view);
  }

  // Métodos de filtro e paginação
  filterSuppliers(): void {
    this.filteredSuppliers = this.suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.updatePagination();
  }

  private updatePagination(): void {
    this.paginationConfig = {
      ...this.paginationConfig,
      totalItems: this.filteredSuppliers.length,
      currentPage: 1 // Reset para primeira página quando filtrar
    };
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

  getPaginatedSuppliers(): Supplier[] {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    return this.filteredSuppliers.slice(startIndex, endIndex);
  }
}
