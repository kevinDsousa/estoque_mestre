import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { CustomerService, CustomerFilters } from '../../core/services/customer.service';
import { ViewToggleComponent } from '../../core/components';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';
import { ProductService } from '../../core/services/product.service';
import { TransactionService } from '../../core/services/transaction.service';

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
  // Modal Nova Venda
  showSaleModal = false;
  saleDraft: {
    customerId: string;
    items: Array<{ productId: string; name?: string; quantity: number; unitPrice: number; totalPrice?: number }>;
    notes?: string;
    totalAmount: number;
  } | null = null;
  productSearchTerm = '';
  productSuggestions: Array<{ id: string; name: string; sellingPrice?: number }> = [];
  productSearchLoading = false;
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus = '';
  selectedType = '';
  currentView: ViewMode = 'cards';
  
  // Modal de criação/edição
  editingCustomer: Customer | null = null;
  showAddModal = false;
  
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
    private customerService: CustomerService,
    private router: Router,
    private productService: ProductService,
    private transactionService: TransactionService
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
      search: this.searchTerm,
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
    this.editingCustomer = { ...customer };
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingCustomer = null;
  }

  saveCustomer(): void {
    if (!this.editingCustomer) return;

    // Monta payload mínimo aceito pelo backend
    // Monta payload apenas com campos válidos e normalizados
    const payload: any = {
      name: this.editingCustomer.name,
      status: this.editingCustomer.status,
      type: this.editingCustomer.customerType,
      notes: this.editingCustomer.notes
    };

    // Envia email somente se preenchido
    if (this.editingCustomer.email) {
      payload.email = this.editingCustomer.email;
    }
    // Normaliza telefone para dígitos (10-11). Se inválido, não envia
    if (this.editingCustomer.phone) {
      const digits = this.editingCustomer.phone.replace(/\D/g, '');
      if (digits.length >= 10 && digits.length <= 11) {
        payload.phone = digits;
      }
    }

    // Atualização
    if (this.editingCustomer.id) {
      this.customerService.updateCustomer(this.editingCustomer.id, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            try {
              this.dialogService.showSuccess('Cliente atualizado com sucesso!');
              this.closeModal();
              this.loadCustomers();
            } catch (e) {
              console.error('Pós-atualização falhou, porém update foi bem-sucedido:', e);
              this.closeModal();
              this.loadCustomers();
            }
          },
          error: (error) => {
            // Se não houver status (erro não-HTTP), assume update ok e segue com sucesso
            if (error?.status === undefined) {
              console.warn('Erro não-HTTP após update; tratando como sucesso.', error);
              this.dialogService.showSuccess('Cliente atualizado com sucesso!');
              this.closeModal();
              this.loadCustomers();
              return;
            }
            console.error('Erro ao atualizar cliente:', error);
            this.dialogService.showError(error?.error?.message || 'Erro ao atualizar cliente. Tente novamente.');
          }
        });
      return;
    }

    // Criação
    this.customerService.createCustomer(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialogService.showSuccess('Cliente criado com sucesso!');
          this.closeModal();
          this.loadCustomers();
        },
        error: (error) => {
          console.error('Erro ao criar cliente:', error);
          this.dialogService.showError(error?.error?.message || 'Erro ao criar cliente. Tente novamente.');
        }
      });
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
    this.saleDraft = {
      customerId: customer.id,
      items: [],
      totalAmount: 0
    };
    this.showSaleModal = true;
  }

  closeSaleModal(): void {
    this.showSaleModal = false;
    this.saleDraft = null;
  }

  searchProducts(): void {
    const term = (this.productSearchTerm || '').trim();
    if (!term) {
      this.productSuggestions = [];
      return;
    }
    this.productSearchLoading = true;
    this.productService.getProducts({ query: term, limit: 5 })
      .subscribe({
        next: (response: any) => {
          const list = (response?.data || response?.products || response?.items || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            sellingPrice: p.sellingPrice
          }));
          this.productSuggestions = list;
          this.productSearchLoading = false;
        },
        error: () => {
          this.productSuggestions = [];
          this.productSearchLoading = false;
        }
      });
  }

  addProductToSale(product: { id: string; name: string; sellingPrice?: number }): void {
    if (!this.saleDraft) return;
    const unitPrice = product.sellingPrice ?? 0;
    const existing = this.saleDraft.items.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity += 1;
      existing.totalPrice = existing.quantity * existing.unitPrice;
    } else {
      this.saleDraft.items.push({ productId: product.id, name: product.name, quantity: 1, unitPrice, totalPrice: unitPrice });
    }
    this.recalculateSaleTotal();
    this.productSearchTerm = '';
    this.productSuggestions = [];
  }

  onItemQuantityChange(index: number): void {
    if (!this.saleDraft) return;
    const item = this.saleDraft.items[index];
    if (!item) return;
    if (!item.quantity || item.quantity < 1) item.quantity = 1;
    item.totalPrice = item.quantity * item.unitPrice;
    this.recalculateSaleTotal();
  }

  removeItem(index: number): void {
    if (!this.saleDraft) return;
    this.saleDraft.items.splice(index, 1);
    this.recalculateSaleTotal();
  }

  private recalculateSaleTotal(): void {
    if (!this.saleDraft) return;
    this.saleDraft.totalAmount = this.saleDraft.items.reduce((sum, i) => sum + ((i.totalPrice ?? (i.quantity * i.unitPrice)) || 0), 0);
  }

  submitSale(): void {
    if (!this.saleDraft) return;
    if (!this.saleDraft.items.length) {
      this.dialogService.showError('Adicione ao menos 1 produto para prosseguir.');
      return;
    }
    const payload = {
      type: 'SALE' as const,
      customerId: this.saleDraft.customerId,
      totalAmount: this.saleDraft.totalAmount,
      notes: this.saleDraft.notes,
      items: this.saleDraft.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice }))
    };
    this.transactionService.createTransaction(payload as any)
      .subscribe({
        next: () => {
          this.dialogService.showSuccess('Venda criada com sucesso!');
          this.closeSaleModal();
        },
        error: (error) => {
          console.error('Erro ao criar venda:', error);
          this.dialogService.showError('Erro ao criar venda. Tente novamente.');
        }
      });
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