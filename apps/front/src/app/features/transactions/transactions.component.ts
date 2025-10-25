import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { TransactionService, TransactionFilters } from '../../core/services/transaction.service';
import { MultiSelectComponent, MultiSelectOption } from '../../core/components/multi-select/multi-select.component';
import { ViewToggleComponent } from '../../core/components';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';
import { TruncateTooltipDirective } from '../../core/directives';

interface Transaction {
  id: string;
  type: 'SALE' | 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  customerId?: string;
  supplierId?: string;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  supplier?: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  paymentMethod?: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentDate?: string;
  // Propriedades para templates
  amount?: number;
  date?: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectComponent, ViewToggleComponent, PaginationComponent, TruncateTooltipDirective],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  loading = false;
  searchTerm = '';
  selectedTypes: string[] = [];
  selectedStatus = '';
  selectedPaymentStatus = '';
  dateFrom = '';
  dateTo = '';
  currentView: ViewMode = 'table';
  
  // Propriedades faltando para templates
  selectedDateRange = '';
  minAmount = '';
  maxAmount = '';
  dateRangeOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mês' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este ano' }
  ];
  
  // Paginação
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10
  };

  // Modal states
  showAddModal = false;
  showViewModal = false;
  editingTransaction: Transaction | null = null;

  statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'COMPLETED', label: 'Concluída' },
    { value: 'CANCELLED', label: 'Cancelada' },
    { value: 'REFUNDED', label: 'Reembolsada' }
  ];

  paymentStatusOptions = [
    { value: '', label: 'Todos os pagamentos' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'PAID', label: 'Pago' },
    { value: 'FAILED', label: 'Falhou' },
    { value: 'REFUNDED', label: 'Reembolsado' }
  ];

  // Multi-select options
  typeMultiOptions: MultiSelectOption[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private dialogService: DialogService,
    private viewPreferencesService: ViewPreferencesService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.initializeTypeOptions();
    this.loadTransactions();
    // Carrega a preferência salva
    this.currentView = this.viewPreferencesService.getViewPreference('transactions');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeTypeOptions(): void {
    this.typeMultiOptions = [
      { value: 'SALE', label: 'Venda', selected: false },
      { value: 'PURCHASE', label: 'Compra', selected: false },
      { value: 'RETURN', label: 'Devolução', selected: false },
      { value: 'ADJUSTMENT', label: 'Ajuste', selected: false },
      { value: 'TRANSFER', label: 'Transferência', selected: false }
    ];
  }

  private loadTransactions(): void {
    this.loading = true;
    
    const { startDate, endDate } = this.getDateRangeFromPreset(this.selectedDateRange);
    const filters: TransactionFilters = {
      query: this.searchTerm || undefined,
      type: this.selectedTypes.length > 0 ? this.selectedTypes[0] : undefined,
      status: this.selectedStatus || undefined,
      dateFrom: startDate,
      dateTo: endDate,
      minAmount: this.minAmount ? parseFloat(this.minAmount) : undefined,
      maxAmount: this.maxAmount ? parseFloat(this.maxAmount) : undefined,
      page: this.paginationConfig.currentPage,
      limit: this.paginationConfig.itemsPerPage,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    this.transactionService.getTransactions(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          // Mapear dados do backend para interface local
          this.transactions = (response as any).transactions.map((transaction: any) => ({
            ...transaction,
            amount: transaction.totalAmount,
            date: transaction.createdAt,
            // Mapear cliente/fornecedor para string
            customer: transaction.customer?.name || transaction.supplier?.name || 'N/A',
            // Mapear itens para string
            items: transaction.items?.length || 0
          }));
          this.paginationConfig.totalItems = response.pagination.total;
          this.filteredTransactions = [...this.transactions];
          this.updatePagination();
        },
        error: (error) => {
          console.error('Erro ao carregar transações:', error);
          this.dialogService.showError('Erro ao carregar transações. Tente novamente.');
        }
      });
  }

  filterTransactions(): void {
    // Reset para primeira página ao filtrar
    this.paginationConfig.currentPage = 1;
    // Recarregar transações com filtros aplicados
    this.loadTransactions();
  }

  onSearchChange(): void {
    this.filterTransactions();
  }

  onTypeChange(): void {
    this.filterTransactions();
  }

  onStatusChange(): void {
    this.filterTransactions();
  }

  onPaymentStatusChange(): void {
    this.filterTransactions();
  }

  onDateChange(): void {
    this.filterTransactions();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTypes = [];
    this.selectedStatus = '';
    this.selectedPaymentStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.selectedDateRange = '';
    this.minAmount = '';
    this.maxAmount = '';
    this.filterTransactions();
  }

  updatePagination(): void {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    this.filteredTransactions = this.transactions.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.loadTransactions();
  }

  private getDateRangeFromPreset(preset: string): { startDate?: string; endDate?: string } {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    switch (preset) {
      case 'today': {
        const d = fmt(today);
        return { startDate: d, endDate: d };
      }
      case 'week': {
        const day = today.getDay();
        const diffToMonday = (day + 6) % 7;
        const start = new Date(today);
        start.setDate(today.getDate() - diffToMonday);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { startDate: fmt(start), endDate: fmt(end) };
      }
      case 'month': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { startDate: fmt(start), endDate: fmt(end) };
      }
      case 'quarter': {
        const quarter = Math.floor(today.getMonth() / 3);
        const start = new Date(today.getFullYear(), quarter * 3, 1);
        const end = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        return { startDate: fmt(start), endDate: fmt(end) };
      }
      case 'year': {
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31);
        return { startDate: fmt(start), endDate: fmt(end) };
      }
      default:
        return {};
    }
  }

  onViewModeChange(mode: ViewMode): void {
    this.currentView = mode;
    this.viewPreferencesService.setViewPreference('transactions', mode);
  }

  addTransaction(): void {
    console.log('Criando nova transação');
    // Implementar modal de criação
  }

  editTransaction(transaction: Transaction): void {
    this.editingTransaction = { ...transaction };
    this.showAddModal = true;
  }

  deleteTransaction(transaction: Transaction): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja excluir a transação "${transaction.id}"?`,
      'Confirmar exclusão'
    ).subscribe(result => {
      if (result.confirmed) {
        this.transactionService.deleteTransaction(transaction.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialogService.showSuccess('Transação excluída com sucesso!');
              this.loadTransactions();
            },
            error: (error) => {
              console.error('Erro ao excluir transação:', error);
              this.dialogService.showError('Erro ao excluir transação. Tente novamente.');
            }
          });
      }
    });
  }

  cancelTransaction(transaction: Transaction): void {
    this.dialogService.showConfirm(
      `Tem certeza que deseja cancelar a transação "${transaction.id}"?`,
      'Cancelar Transação'
    ).subscribe(result => {
      if (result.confirmed) {
        const updatedTransaction = { ...transaction, status: 'CANCELLED' as const };
        this.transactionService.updateTransaction(transaction.id, updatedTransaction)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.dialogService.showSuccess('Transação cancelada com sucesso!');
              this.loadTransactions();
            },
            error: (error) => {
              console.error('Erro ao cancelar transação:', error);
              this.dialogService.showError('Erro ao cancelar transação. Tente novamente.');
            }
          });
      }
    });
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'SALE':
        return 'type-sale';
      case 'PURCHASE':
        return 'type-purchase';
      case 'RETURN':
        return 'type-return';
      case 'ADJUSTMENT':
        return 'type-adjustment';
      case 'TRANSFER':
        return 'type-transfer';
      default:
        return '';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'SALE':
        return 'Venda';
      case 'PURCHASE':
        return 'Compra';
      case 'RETURN':
        return 'Devolução';
      case 'ADJUSTMENT':
        return 'Ajuste';
      case 'TRANSFER':
        return 'Transferência';
      default:
        return type;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'REFUNDED':
        return 'status-refunded';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELLED':
        return 'Cancelada';
      case 'REFUNDED':
        return 'Reembolsada';
      default:
        return status;
    }
  }

  getPaymentStatusClass(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'PENDING':
        return 'payment-pending';
      case 'PAID':
        return 'payment-paid';
      case 'FAILED':
        return 'payment-failed';
      case 'REFUNDED':
        return 'payment-refunded';
      default:
        return '';
    }
  }

  getPaymentStatusLabel(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'PENDING':
        return 'Pendente';
      case 'PAID':
        return 'Pago';
      case 'FAILED':
        return 'Falhou';
      case 'REFUNDED':
        return 'Reembolsado';
      default:
        return paymentStatus;
    }
  }

  getCustomerName(transaction: Transaction): string {
    return transaction.customer?.name || 'Cliente não informado';
  }

  getSupplierName(transaction: Transaction): string {
    return transaction.supplier?.name || 'Fornecedor não informado';
  }

  getTotalAmount(transaction: Transaction): number {
    return transaction.totalAmount;
  }

  getItemCount(transaction: Transaction): number {
    return transaction.items?.length || 0;
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getFormattedDateTime(date: string): string {
    return new Date(date).toLocaleString('pt-BR');
  }

  canCancel(transaction: Transaction): boolean {
    return transaction.status === 'PENDING';
  }

  canEdit(transaction: Transaction): boolean {
    return transaction.status === 'PENDING';
  }

  canDelete(transaction: Transaction): boolean {
    return transaction.status === 'PENDING' || transaction.status === 'CANCELLED';
  }

  // Métodos faltando para templates
  getPaginatedTransactions(): Transaction[] {
    return this.filteredTransactions;
  }

  getTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'SALE': 'Venda',
      'PURCHASE': 'Compra',
      'RETURN': 'Devolução',
      'ADJUSTMENT': 'Ajuste',
      'TRANSFER': 'Transferência'
    };
    return typeMap[type] || type;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'COMPLETED': 'Concluída',
      'CANCELLED': 'Cancelada',
      'REFUNDED': 'Reembolsada'
    };
    return statusMap[status] || status;
  }

  viewTransaction(transaction: Transaction): void {
    this.editingTransaction = { ...transaction };
    this.showViewModal = true;
  }

  onItemsPerPageChange(limit: number): void {
    this.paginationConfig.itemsPerPage = limit;
    this.paginationConfig.currentPage = 1;
    this.loadTransactions();
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    this.viewPreferencesService.setViewPreference('transactions', view);
  }

  onTypeSelectionChange(selectedTypes: string[]): void {
    this.selectedTypes = selectedTypes;
    this.filterTransactions();
  }
}