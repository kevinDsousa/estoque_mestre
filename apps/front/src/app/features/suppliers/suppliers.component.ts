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
  id?: string;
  name: string;
  document?: string;
  type?: 'DISTRIBUTOR' | 'MANUFACTURER' | 'WHOLESALER';
  contactName?: string;
  email: string;
  phone?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
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
  createdAt?: string;
  updatedAt?: string;
  productCount?: number;
  totalPurchases?: number;
  lastPurchaseDate?: string;
  // Propriedades para templates
  isActive?: boolean;
  contact?: string;
  address?: string;
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
  showProductsModal = false;
  currentSupplier: Supplier | null = null;
  supplierProducts: any[] = [];
  
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
            id: supplier.id,
            name: supplier.name,
            document: supplier.document,
            type: supplier.type,
            status: supplier.status,
            email: supplier.contacts?.[0]?.email || 'email@exemplo.com',
            contactName: supplier.contacts?.[0]?.name,
            phone: supplier.contacts?.[0]?.phone,
            street: supplier.addresses?.[0]?.street,
            number: supplier.addresses?.[0]?.number,
            complement: supplier.addresses?.[0]?.complement,
            neighborhood: supplier.addresses?.[0]?.neighborhood,
            city: supplier.addresses?.[0]?.city,
            state: supplier.addresses?.[0]?.state,
            zipCode: supplier.addresses?.[0]?.zipCode,
            country: supplier.addresses?.[0]?.country,
            website: supplier.website,
            notes: supplier.notes,
            createdAt: supplier.createdAt,
            updatedAt: supplier.updatedAt,
            contact: supplier.contacts?.[0]?.name || 'Não informado',
            address: supplier.addresses?.[0]?.street || 'Não informado',
            productCount: supplier._count?.products || 0
          }));
          this.paginationConfig.totalItems = response.pagination.total;
          this.filteredSuppliers = [...this.suppliers];
        },
        error: (error) => {
          console.error('Erro ao carregar fornecedores:', error);
          this.dialogService.showError('Erro ao carregar fornecedores. Tente novamente.');
        }
      });
  }

  filterSuppliers(): void {
    // Reset para primeira página ao filtrar
    this.paginationConfig.currentPage = 1;
    // Recarregar fornecedores com filtros aplicados
    this.loadSuppliers();
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

  // Pagination is now handled by backend via loadSuppliers()

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
      name: '',
      email: '',
      type: 'DISTRIBUTOR',
      status: 'ACTIVE'
    };
    this.editSupplier(newSupplier);
  }

  editSupplier(supplier: Supplier): void {
    this.editingSupplier = { ...supplier };
    this.showAddModal = true;
  }

  // Delete method removed - suppliers should be deactivated instead of deleted

  toggleSupplierStatus(supplier: Supplier): void {
    if (!supplier.id) return;
    
    const newStatus = supplier.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    // Enviar apenas o status para o backend
    this.supplierService.updateSupplier(supplier.id, { status: newStatus as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' })
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
    if (!supplier.id) return;
    
    this.currentSupplier = supplier;
    
    // Se não tem produtos, mostra toast e retorna
    if (!supplier.productCount || supplier.productCount === 0) {
      this.dialogService.showSuccess('Este fornecedor não possui produtos cadastrados.', 'Informação');
      return;
    }
    
    // Buscar produtos do fornecedor
    this.loading = true;
    this.supplierService.getSupplierProducts(supplier.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (products) => {
          this.supplierProducts = products;
          this.showProductsModal = true;
        },
        error: (error) => {
          console.error('Erro ao carregar produtos:', error);
          this.dialogService.showError('Erro ao carregar produtos do fornecedor.');
        }
      });
  }
  
  closeProductsModal(): void {
    this.showProductsModal = false;
    this.supplierProducts = [];
    this.currentSupplier = null;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingSupplier = null;
  }

  saveSupplier(): void {
    if (!this.editingSupplier) return;

    if (this.editingSupplier.id) {
      // Update existing supplier - enviar apenas campos que podem ser atualizados
      const updateData: any = {
        name: this.editingSupplier.name,
        status: this.editingSupplier.status,
      };

      // Adicionar campos opcionais apenas se preenchidos
      if (this.editingSupplier.document) updateData.document = this.editingSupplier.document;
      if (this.editingSupplier.type) updateData.type = this.editingSupplier.type;
      if (this.editingSupplier.email) updateData.email = this.editingSupplier.email;
      if (this.editingSupplier.phone) updateData.phone = this.editingSupplier.phone;
      if (this.editingSupplier.contactName) updateData.contactPerson = this.editingSupplier.contactName;
      if (this.editingSupplier.website) updateData.website = this.editingSupplier.website;
      if (this.editingSupplier.notes) updateData.notes = this.editingSupplier.notes;

      this.supplierService.updateSupplier(this.editingSupplier.id, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogService.showSuccess('Fornecedor atualizado com sucesso!');
            this.closeModal();
            this.loadSuppliers();
          },
          error: (error) => {
            console.error('Erro ao atualizar fornecedor:', error);
            this.dialogService.showError('Erro ao atualizar fornecedor. Tente novamente.');
          }
        });
    } else {
      // Create new supplier - todos os campos obrigatórios
      const createData = {
        name: this.editingSupplier.name,
        document: this.editingSupplier.document || '',
        type: (this.editingSupplier.type || 'DISTRIBUTOR') as 'DISTRIBUTOR' | 'MANUFACTURER' | 'WHOLESALER',
        status: this.editingSupplier.status,
        email: this.editingSupplier.email,
        phone: this.editingSupplier.phone || '',
        contactPerson: this.editingSupplier.contactName,
        street: this.editingSupplier.street || '',
        number: this.editingSupplier.number || '',
        complement: this.editingSupplier.complement,
        neighborhood: this.editingSupplier.neighborhood || '',
        city: this.editingSupplier.city || '',
        state: this.editingSupplier.state || '',
        zipCode: this.editingSupplier.zipCode || '',
        country: this.editingSupplier.country || 'Brasil',
        website: this.editingSupplier.website,
        notes: this.editingSupplier.notes
      };

      this.supplierService.createSupplier(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogService.showSuccess('Fornecedor criado com sucesso!');
            this.closeModal();
            this.loadSuppliers();
          },
          error: (error) => {
            console.error('Erro ao criar fornecedor:', error);
            this.dialogService.showError('Erro ao criar fornecedor. Tente novamente.');
          }
        });
    }
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