import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { SupplierService, SupplierFilters } from '../../core/services/supplier.service';
import { ViewToggleComponent } from '../../core/components';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';

interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  taxId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  paymentTerms?: string;
  creditLimit?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  totalPurchases?: number;
  lastPurchaseDate?: string;
  // Propriedades para templates
  isActive?: boolean;
  contact?: string;
}

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent, PaginationComponent],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent implements OnInit, OnDestroy {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus = '';
  currentView: ViewMode = 'cards';
  
  // Propriedades faltando para templates
  editingSupplier: Supplier | null = null;
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
    { value: 'SUSPENDED', label: 'Suspenso' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private dialogService: DialogService,
    private viewPreferencesService: ViewPreferencesService,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    // Carrega a preferência salva
    this.currentView = this.viewPreferencesService.getViewPreference('suppliers');
    
    this.loadSuppliers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSuppliers(): void {
    this.loading = true;
    
    const filters: SupplierFilters = {
      query: this.searchTerm,
      status: this.selectedStatus || undefined,
      page: this.paginationConfig.currentPage,
      limit: this.paginationConfig.itemsPerPage,
      sortBy: 'name',
      sortOrder: 'asc'
    };

    this.supplierService.getSuppliers(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          // Mapear dados do backend para interface local
          this.suppliers = (response as any).suppliers.map((supplier: any) => ({
            ...supplier,
            email: supplier.contacts?.[0]?.email || 'email@exemplo.com', // Usar email do primeiro contato ou fallback
            contactName: supplier.contacts?.[0]?.name,
            phone: supplier.contacts?.[0]?.phone,
            address: supplier.addresses?.[0]?.street,
            city: supplier.addresses?.[0]?.city,
            state: supplier.addresses?.[0]?.state,
            zipCode: supplier.addresses?.[0]?.zipCode,
            country: supplier.addresses?.[0]?.country,
            // Propriedades para templates
            isActive: supplier.status === 'ACTIVE',
            contact: supplier.contacts?.[0]?.name || (supplier as any).contactName || 'Não informado'
          }));
          this.paginationConfig.totalItems = response.pagination.total;
          this.filteredSuppliers = [...this.suppliers];
          this.updatePagination();
        },
        error: (error) => {
          console.error('Erro ao carregar fornecedores:', error);
          this.dialogService.showError('Erro ao carregar fornecedores. Tente novamente.');
        }
      });
  }

  filterSuppliers(): void {
    this.filteredSuppliers = this.suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           supplier.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (supplier.contactName && supplier.contactName.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = !this.selectedStatus || supplier.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
    this.paginationConfig.totalItems = this.filteredSuppliers.length;
    this.updatePagination();
  }

  onSearchChange(): void {
    this.filterSuppliers();
  }

  onStatusChange(): void {
    this.filterSuppliers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.filterSuppliers();
  }

  updatePagination(): void {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    this.filteredSuppliers = this.suppliers.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.loadSuppliers();
  }

  onViewModeChange(mode: ViewMode): void {
    this.currentView = mode;
    this.viewPreferencesService.setViewPreference('suppliers', mode);
  }

  addSupplier(): void {
    const newSupplier: Supplier = {
      id: '',
      name: '',
      email: '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.editSupplier(newSupplier);
  }

  editSupplier(supplier: Supplier): void {
    this.editingSupplier = { ...supplier };
    this.showAddModal = true;
  }

  deleteSupplier(supplier: Supplier): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja excluir o fornecedor "${supplier.name}"?`,
      'Confirmar exclusão'
    ).subscribe(result => {
      if (result.confirmed) {
        this.supplierService.deleteSupplier(supplier.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialogService.showSuccess('Fornecedor excluído com sucesso!');
              this.loadSuppliers();
            },
            error: (error) => {
              console.error('Erro ao excluir fornecedor:', error);
              this.dialogService.showError('Erro ao excluir fornecedor. Tente novamente.');
            }
          });
      }
    });
  }

  toggleSupplierStatus(supplier: Supplier): void {
    const newStatus = supplier.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updatedSupplier = { 
      ...supplier, 
      status: newStatus as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    };
    
    this.supplierService.updateSupplier(supplier.id, updatedSupplier)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialogService.showSuccess(`Fornecedor ${newStatus === 'ACTIVE' ? 'ativado' : 'desativado'} com sucesso!`);
          this.loadSuppliers();
        },
        error: (error) => {
          console.error('Erro ao alterar status do fornecedor:', error);
          this.dialogService.showError('Erro ao alterar status do fornecedor. Tente novamente.');
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'INACTIVE':
        return 'status-inactive';
      case 'SUSPENDED':
        return 'status-suspended';
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
      case 'SUSPENDED':
        return 'Suspenso';
      default:
        return status;
    }
  }

  getProductCount(supplier: Supplier): number {
    return supplier.productCount || 0;
  }

  getTotalPurchases(supplier: Supplier): number {
    return supplier.totalPurchases || 0;
  }

  getLastPurchaseDate(supplier: Supplier): string {
    return supplier.lastPurchaseDate ? new Date(supplier.lastPurchaseDate).toLocaleDateString() : 'Nunca';
  }

  getContactName(supplier: Supplier): string {
    return supplier.contactName || 'Não informado';
  }

  getFullAddress(supplier: Supplier): string {
    const parts = [supplier.address, supplier.city, supplier.state, supplier.zipCode].filter(Boolean);
    return parts.join(', ') || 'Endereço não informado';
  }

  getWebsiteUrl(supplier: Supplier): string {
    if (!supplier.website) return '';
    return supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`;
  }

  // Métodos faltando para templates
  getPaginatedSuppliers(): Supplier[] {
    return this.filteredSuppliers;
  }

  viewProducts(supplier: Supplier): void {
    console.log('Ver produtos do fornecedor:', supplier);
    // Implementar navegação para produtos do fornecedor
  }

  onItemsPerPageChange(limit: number): void {
    this.paginationConfig.itemsPerPage = limit;
    this.paginationConfig.currentPage = 1;
    this.loadSuppliers();
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    this.viewPreferencesService.setViewPreference('suppliers', view);
  }
}