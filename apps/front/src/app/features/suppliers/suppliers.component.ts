import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { SupplierService, SupplierFilters } from '../../core/services/supplier.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../shared/services/toast.service';
import { ViewToggleComponent } from '../../core/components';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';
import { PhoneMaskDirective } from '../../core/directives/phone-mask.directive';
import { CpfCnpjMaskDirective } from '../../core/directives/cpf-cnpj-mask.directive';
import { CpfCnpjValidatorDirective } from '../../core/directives/cpf-cnpj-validator.directive';
import { FormErrorComponent } from '../../core/components/form-error/form-error.component';

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
  imports: [
    CommonModule,
    FormsModule,
    ViewToggleComponent,
    PaginationComponent,
    // Form helpers
    PhoneMaskDirective,
    CpfCnpjMaskDirective,
    CpfCnpjValidatorDirective,
    FormErrorComponent
  ],
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
  
  // Propriedades para modal de produtos do fornecedor
  showSupplierProductsModal = false;
  selectedSupplier: Supplier | null = null;
  
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
    private supplierService: SupplierService,
    private productService: ProductService,
    private toast: ToastService
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
      search: this.searchTerm,
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
    // Busca instantânea - digitou, buscou
    this.paginationConfig.currentPage = 1;
    this.loadSuppliers();
  }

  onSearchChange(): void {
    this.filterSuppliers();
  }

  onStatusChange(): void {
    this.paginationConfig.currentPage = 1;
    this.loadSuppliers();
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
    const isActivating = newStatus === 'ACTIVE';
    
    // Se estiver ativando e tem produtos, pergunta ao usuário
    if (isActivating && supplier.productCount && supplier.productCount > 0) {
      this.dialogService.confirm({
        title: 'Ativar Fornecedor',
        message: `Este fornecedor possui ${supplier.productCount} produto(s). Deseja ativar os produtos junto com o fornecedor?`,
        confirmText: 'Sim, ativar tudo',
        cancelText: 'Apenas fornecedor',
        type: 'confirm',
        icon: 'pi pi-question-circle'
      }).subscribe(result => {
        // Ambos os botões ativam o fornecedor, a diferença é se ativa os produtos
        this.updateSupplierStatus(supplier.id!, newStatus, result.confirmed);
      });
    } else if (!isActivating && supplier.productCount && supplier.productCount > 0) {
      // Se estiver desativando e tem produtos, avisa o usuário
      this.dialogService.confirm({
        title: 'Desativar Fornecedor',
        message: `Ao desativar este fornecedor, todos os ${supplier.productCount} produto(s) associados também serão desativados. Deseja continuar?`,
        confirmText: 'Sim, desativar',
        cancelText: 'Cancelar',
        type: 'warning',
        icon: 'pi pi-exclamation-triangle'
      }).subscribe(result => {
        if (result.confirmed) {
          this.updateSupplierStatus(supplier.id!, newStatus, false);
        }
      });
    } else {
      // Sem produtos ou ação sem confirmação
      this.updateSupplierStatus(supplier.id!, newStatus, false);
    }
  }

  private updateSupplierStatus(supplierId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED', updateProducts: boolean): void {
    this.supplierService.updateSupplierStatus(supplierId, status, updateProducts)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const message = status === 'ACTIVE' 
            ? (updateProducts ? 'Fornecedor e produtos ativados com sucesso!' : 'Fornecedor ativado com sucesso!')
            : 'Fornecedor e produtos desativados com sucesso!';
          this.dialogService.showSuccess(message);
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
            
            // Tratamento específico para erros de conflito (documento duplicado)
            if (error.status === 409) {
              this.dialogService.showError('Este CNPJ/CPF já está cadastrado para outro fornecedor.');
            } else if (error.error?.message) {
              this.dialogService.showError(error.error.message);
            } else {
              this.dialogService.showError('Erro ao atualizar fornecedor. Tente novamente.');
            }
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
            
            // Tratamento específico para erros de conflito (documento duplicado)
            if (error.status === 409) {
              this.dialogService.showError('Este CNPJ/CPF já está cadastrado para outro fornecedor.');
            } else if (error.error?.message) {
              this.dialogService.showError(error.error.message);
            } else {
              this.dialogService.showError('Erro ao criar fornecedor. Tente novamente.');
            }
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

  // Métodos para exclusão de fornecedores
  deleteSupplier(supplier: Supplier): void {
    this.selectedSupplier = supplier;
    this.loadSupplierProducts(supplier.id!);
    this.showSupplierProductsModal = true;
  }

  loadSupplierProducts(supplierId: string): void {
    this.productService.getProducts({ supplierId, page: 1, limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.supplierProducts = response.data || [];
        },
        error: (error) => {
          console.error('Erro ao carregar produtos do fornecedor:', error);
          this.toast.error('Erro', 'Não foi possível carregar os produtos do fornecedor.');
        }
      });
  }

  closeSupplierProductsModal(): void {
    this.showSupplierProductsModal = false;
    this.selectedSupplier = null;
    this.supplierProducts = [];
  }

  getProductStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'INACTIVE': return 'status-inactive';
      case 'DISCONTINUED': return 'status-discontinued';
      case 'OUT_OF_STOCK': return 'status-out-of-stock';
      default: return 'status-inactive';
    }
  }

  getProductStatusText(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Ativo';
      case 'INACTIVE': return 'Inativo';
      case 'DISCONTINUED': return 'Descontinuado';
      case 'OUT_OF_STOCK': return 'Sem Estoque';
      default: return 'Inativo';
    }
  }

  deactivateProductFromSupplier(product: any): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja desativar o produto "${product.name}"?`,
      'Confirmar desativação'
    ).subscribe(result => {
      if (result.confirmed) {
        this.productService.updateProduct(product.id, { status: 'INACTIVE' })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toast.success('Produto desativado', 'O produto foi desativado com sucesso.');
              this.loadSupplierProducts(this.selectedSupplier!.id!);
            },
            error: (error) => {
              console.error('Erro ao desativar produto:', error);
              this.toast.error('Erro', 'Não foi possível desativar o produto.');
            }
          });
      }
    });
  }

  deleteProductFromSupplier(product: any): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja excluir o produto "${product.name}"?`,
      'Confirmar exclusão'
    ).subscribe(result => {
      if (result.confirmed) {
        this.productService.deleteProduct(product.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toast.success('Produto excluído', 'O produto foi excluído com sucesso.');
              this.loadSupplierProducts(this.selectedSupplier!.id!);
            },
            error: (error) => {
              console.error('Erro ao excluir produto:', error);
              this.toast.error('Erro', 'Não foi possível excluir o produto.');
            }
          });
      }
    });
  }

  deactivateAllSupplierProducts(): void {
    const activeProducts = this.supplierProducts.filter(p => p.status === 'ACTIVE');
    if (activeProducts.length === 0) {
      this.toast.info('Informação', 'Não há produtos ativos para desativar.');
      return;
    }

    this.dialogService.showConfirm(
      `Tem certeza que deseja desativar todos os ${activeProducts.length} produtos ativos deste fornecedor?`,
      'Confirmar desativação em massa'
    ).subscribe(result => {
      if (result.confirmed) {
        const updatePromises = activeProducts.map(product => 
          this.productService.updateProduct(product.id, { status: 'INACTIVE' }).toPromise()
        );

        Promise.all(updatePromises)
          .then(() => {
            this.toast.success('Produtos desativados', `${activeProducts.length} produtos foram desativados com sucesso.`);
            this.loadSupplierProducts(this.selectedSupplier!.id!);
          })
          .catch((error) => {
            console.error('Erro ao desativar produtos:', error);
            this.toast.error('Erro', 'Não foi possível desativar todos os produtos.');
          });
      }
    });
  }

  deleteAllInactiveSupplierProducts(): void {
    const inactiveProducts = this.supplierProducts.filter(p => p.status !== 'ACTIVE');
    if (inactiveProducts.length === 0) {
      this.toast.info('Informação', 'Não há produtos inativos para excluir.');
      return;
    }

    this.dialogService.showConfirm(
      `Tem certeza que deseja excluir todos os ${inactiveProducts.length} produtos inativos deste fornecedor?`,
      'Confirmar exclusão em massa'
    ).subscribe(result => {
      if (result.confirmed) {
        const deletePromises = inactiveProducts.map(product => 
          this.productService.deleteProduct(product.id).toPromise()
        );

        Promise.all(deletePromises)
          .then(() => {
            this.toast.success('Produtos excluídos', `${inactiveProducts.length} produtos foram excluídos com sucesso.`);
            this.loadSupplierProducts(this.selectedSupplier!.id!);
          })
          .catch((error) => {
            console.error('Erro ao excluir produtos:', error);
            this.toast.error('Erro', 'Não foi possível excluir todos os produtos.');
          });
      }
    });
  }

  confirmDeleteSupplier(): void {
    if (!this.selectedSupplier) return;

    this.dialogService.showConfirm(
      `Tem certeza que deseja excluir o fornecedor "${this.selectedSupplier.name}"?`,
      'Confirmar exclusão'
    ).subscribe(result => {
      if (result.confirmed) {
        this.supplierService.deleteSupplier(this.selectedSupplier!.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              console.log('Resposta da exclusão:', response);
              this.toast.success('Fornecedor excluído', 'O fornecedor foi excluído com sucesso.');
              this.closeSupplierProductsModal();
              this.loadSuppliers();
            },
            error: (error) => {
              console.error('Erro ao excluir fornecedor:', error);
              this.toast.error('Erro', 'Não foi possível excluir o fornecedor.');
            }
          });
      }
    });
  }

  isFormValid(): boolean {
    if (!this.editingSupplier) return false;

    // Campos obrigatórios básicos
    const basicFieldsValid = 
      !!(this.editingSupplier.name && 
      this.editingSupplier.name.trim().length > 0 &&
      this.editingSupplier.email && 
      this.editingSupplier.email.trim().length > 0);

    // Se é um novo fornecedor, validar campos de endereço
    if (!this.editingSupplier.id) {
      const addressFieldsValid = 
        !!(this.editingSupplier.street && 
        this.editingSupplier.street.trim().length > 0 &&
        this.editingSupplier.number && 
        this.editingSupplier.number.trim().length > 0 &&
        this.editingSupplier.neighborhood && 
        this.editingSupplier.neighborhood.trim().length >= 2 &&
        this.editingSupplier.city && 
        this.editingSupplier.city.trim().length > 0 &&
        this.editingSupplier.state && 
        this.editingSupplier.state.trim().length > 0 &&
        this.editingSupplier.zipCode && 
        this.editingSupplier.zipCode.trim().length > 0);

      return basicFieldsValid && addressFieldsValid;
    }

    // Para edição, apenas campos básicos são obrigatórios
    return basicFieldsValid;
  }
}