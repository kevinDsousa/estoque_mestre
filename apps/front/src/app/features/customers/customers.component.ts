import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { ViewToggleComponent } from '../../core/components';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';
import { DialogService } from '../../core/services/dialog.service';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalPurchases: number;
  lastPurchase: Date;
  isActive: boolean;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent, PaginationComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchTerm = '';
  currentView: ViewMode = 'cards';
  
  // Paginação
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10
  };

  constructor(
    private viewPreferencesService: ViewPreferencesService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    // Carrega a preferência salva
    this.currentView = this.viewPreferencesService.getViewPreference('customers');
    
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.customers = [
      {
        id: 1,
        name: 'Ana Silva',
        email: 'ana@email.com',
        phone: '(11) 99999-1111',
        address: 'São Paulo, SP',
        totalPurchases: 1250.50,
        lastPurchase: new Date('2024-01-15'),
        isActive: true
      },
      {
        id: 2,
        name: 'Carlos Santos',
        email: 'carlos@email.com',
        phone: '(11) 88888-2222',
        address: 'Rio de Janeiro, RJ',
        totalPurchases: 890.75,
        lastPurchase: new Date('2024-01-10'),
        isActive: true
      },
      {
        id: 3,
        name: 'Maria Costa',
        email: 'maria@email.com',
        phone: '(11) 77777-3333',
        address: 'Belo Horizonte, MG',
        totalPurchases: 2100.00,
        lastPurchase: new Date('2024-01-08'),
        isActive: true
      }
    ];
    this.filteredCustomers = [...this.customers];
    this.updatePagination();
  }

  editCustomer(customer: Customer): void {
    console.log('Editando cliente:', customer);
    // TODO: Implementar modal de edição
  }

  viewHistory(customer: Customer): void {
    console.log('Visualizando histórico do cliente:', customer);
    // TODO: Navegar para página de histórico de compras
  }

  newSale(customer: Customer): void {
    console.log('Nova venda para cliente:', customer);
    // TODO: Navegar para página de nova venda
  }

  deleteCustomer(customer: Customer): void {
    this.dialogService.confirmDelete(customer.name, 'cliente').subscribe(result => {
      if (result.confirmed) {
        this.customers = this.customers.filter(c => c.id !== customer.id);
        this.filterCustomers();
        console.log('Cliente excluído:', customer);
      }
    });
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    // Salva a preferência no localStorage
    this.viewPreferencesService.setViewPreference('customers', view);
  }

  // Métodos de filtro e paginação
  filterCustomers(): void {
    this.filteredCustomers = this.customers.filter(customer =>
      customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.updatePagination();
  }

  private updatePagination(): void {
    this.paginationConfig = {
      ...this.paginationConfig,
      totalItems: this.filteredCustomers.length,
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

  getPaginatedCustomers(): Customer[] {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    return this.filteredCustomers.slice(startIndex, endIndex);
  }
}
