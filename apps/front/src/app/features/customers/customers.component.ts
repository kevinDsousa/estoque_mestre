import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { CustomerService, CustomerFilters } from '../../core/services/customer.service';
import { ViewToggleComponent } from '../../core/components';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  customerType: 'INDIVIDUAL' | 'COMPANY';
  taxId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  totalPurchases?: number;
  lastPurchaseDate?: string;
  purchaseCount?: number;
  averageOrderValue?: number;
  creditLimit?: number;
  currentBalance?: number;
  // Propriedades para templates
  isActive?: boolean;
  lastPurchase?: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent, PaginationComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit, OnDestroy {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus = '';
  selectedType = '';
  currentView: ViewMode = 'cards';
  
  // Paginação
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10
  };

  statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'BLOCKED', label: 'Bloqueado' }
  ];

  typeOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'INDIVIDUAL', label: 'Pessoa Física' },
    { value: 'COMPANY', label: 'Pessoa Jurídica' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private dialogService: DialogService,
    private viewPreferencesService: ViewPreferencesService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    // Carrega a preferência salva
    this.currentView = this.viewPreferencesService.getViewPreference('customers');
    
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCustomers(): void {
    this.loading = true;
    
    const filters: CustomerFilters = {
      query: this.searchTerm,
      status: this.selectedStatus || undefined,
      type: this.selectedType || undefined,
      page: this.paginationConfig.currentPage,
      limit: this.paginationConfig.itemsPerPage,
      sortBy: 'name',
      sortOrder: 'asc'
    };

    this.customerService.getCustomers(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          // Mapear dados do backend para interface local
          this.customers = (response as any).customers.map((customer: any) => {
            const primaryContact = customer.contacts?.[0] || {};
            const primaryAddress = customer.addresses?.[0] || {};
            
            return {
              ...customer,
              // Extrair email e phone do primeiro contato
              email: primaryContact.email || '',
              phone: primaryContact.phone || '',
              // Extrair dados do primeiro endereço
              address: primaryAddress.street || '',
              city: primaryAddress.city || '',
              state: primaryAddress.state || '',
              zipCode: primaryAddress.zipCode || '',
              country: primaryAddress.country || '',
              // Outros mapeamentos
              isActive: customer.status === 'ACTIVE',
              lastPurchase: customer.lastPurchaseAt,
              lastPurchaseDate: customer.lastPurchaseAt,
              purchaseCount: customer._count?.transactions || 0
            };
          });
          this.paginationConfig.totalItems = response.pagination.total;
          this.filteredCustomers = [...this.customers];
          this.updatePagination();
        },
        error: (error) => {
          console.error('Erro ao carregar clientes:', error);
          this.dialogService.showError('Erro ao carregar clientes. Tente novamente.');
        }
      });
  }

  filterCustomers(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (customer.phone && customer.phone.includes(this.searchTerm));
      
      const matchesStatus = !this.selectedStatus || customer.status === this.selectedStatus;
      const matchesType = !this.selectedType || customer.customerType === this.selectedType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
    this.paginationConfig.totalItems = this.filteredCustomers.length;
    this.updatePagination();
  }

  onSearchChange(): void {
    this.filterCustomers();
  }

  onStatusChange(): void {
    this.filterCustomers();
  }

  onTypeChange(): void {
    this.filterCustomers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.filterCustomers();
  }

  updatePagination(): void {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    this.filteredCustomers = this.customers.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.loadCustomers();
  }

  onViewModeChange(mode: ViewMode): void {
    this.currentView = mode;
    this.viewPreferencesService.setViewPreference('customers', mode);
  }

  addCustomer(): void {
    const newCustomer: Customer = {
      id: '',
      name: '',
      email: '',
      status: 'ACTIVE',
      customerType: 'INDIVIDUAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.editCustomer(newCustomer);
  }

  editCustomer(customer: Customer): void {
    console.log('Editando cliente:', customer);
    // Implementar modal de edição
  }


  toggleCustomerStatus(customer: Customer): void {
    const newStatus = customer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    this.customerService.toggleCustomerStatus(customer.id, customer.status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialogService.showSuccess(`Cliente ${newStatus === 'ACTIVE' ? 'ativado' : 'desativado'} com sucesso!`);
          this.loadCustomers();
        },
        error: (error) => {
          this.dialogService.showError(error?.message || 'Erro ao alterar status do cliente. Tente novamente.');
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'INACTIVE':
        return 'status-inactive';
      case 'BLOCKED':
        return 'status-blocked';
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
      case 'BLOCKED':
        return 'Bloqueado';
      default:
        return status;
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'INDIVIDUAL':
        return 'Pessoa Física';
      case 'COMPANY':
        return 'Pessoa Jurídica';
      default:
        return type;
    }
  }

  getTotalPurchases(customer: Customer): number {
    return customer.totalPurchases || 0;
  }

  getLastPurchaseDate(customer: Customer): string {
    return customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'Nunca';
  }

  getPurchaseCount(customer: Customer): number {
    return customer.purchaseCount || 0;
  }

  getAverageOrderValue(customer: Customer): number {
    return customer.averageOrderValue || 0;
  }

  getFullAddress(customer: Customer): string {
    const parts = [
      customer.address, 
      customer.city, 
      customer.state
    ].filter(Boolean);
    
    const address = parts.join(', ');
    if (customer.zipCode) {
      return `${address} - ${customer.zipCode}`;
    }
    return address || 'Endereço não informado';
  }

  getPhone(customer: Customer): string {
    return customer.phone || 'Não informado';
  }

  getAge(customer: Customer): string {
    if (!customer.dateOfBirth) return 'Não informado';
    const today = new Date();
    const birthDate = new Date(customer.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    return `${age} anos`;
  }

  // Métodos faltando para templates
  getPaginatedCustomers(): Customer[] {
    return this.filteredCustomers;
  }

  viewHistory(customer: Customer): void {
    console.log('Ver histórico do cliente:', customer);
    // Implementar navegação para histórico
  }

  newSale(customer: Customer): void {
    console.log('Nova venda para cliente:', customer);
    // Implementar modal de nova venda
  }

  onItemsPerPageChange(limit: number): void {
    this.paginationConfig.itemsPerPage = limit;
    this.paginationConfig.currentPage = 1;
    this.loadCustomers();
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    this.viewPreferencesService.setViewPreference('customers', view);
  }
}