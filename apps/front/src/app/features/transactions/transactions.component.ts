import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../core/services/dialog.service';
import { MultiSelectComponent, MultiSelectOption } from '../../core/components/multi-select/multi-select.component';
import { PaginationComponent, PaginationConfig } from '../../core/components/pagination/pagination.component';

interface Transaction {
  id: number;
  type: 'sale' | 'purchase' | 'return';
  customer: string;
  amount: number;
  date: Date;
  status: 'completed' | 'pending' | 'cancelled';
  items: number;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectComponent, PaginationComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  searchTerm = '';
  selectedTypes: string[] = [];
  selectedStatus = '';
  selectedDateRange = '';
  minAmount = '';
  maxAmount = '';
  
  // Pagination
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10
  };

  // Filter options
  typeOptions = [
    { value: 'sale', label: 'Venda' },
    { value: 'purchase', label: 'Compra' },
    { value: 'return', label: 'Devolução' }
  ];

  statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'completed', label: 'Concluída' },
    { value: 'pending', label: 'Pendente' },
    { value: 'cancelled', label: 'Cancelada' }
  ];

  dateRangeOptions = [
    { value: '', label: 'Todas as datas' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mês' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este ano' }
  ];

  // Multi-select options
  typeMultiOptions: MultiSelectOption[] = [];

  ngOnInit(): void {
    this.transactions = [
      {
        id: 1,
        type: 'sale',
        customer: 'Ana Silva',
        amount: 1250.50,
        date: new Date('2024-01-15'),
        status: 'completed',
        items: 3
      },
      {
        id: 2,
        type: 'purchase',
        customer: 'Tech Solutions Ltda',
        amount: 2500.00,
        date: new Date('2024-01-14'),
        status: 'completed',
        items: 5
      },
      {
        id: 3,
        type: 'sale',
        customer: 'Carlos Santos',
        amount: 890.75,
        date: new Date('2024-01-13'),
        status: 'pending',
        items: 2
      },
      {
        id: 4,
        type: 'return',
        customer: 'Maria Costa',
        amount: 299.90,
        date: new Date('2024-01-12'),
        status: 'completed',
        items: 1
      }
    ];
    this.filteredTransactions = [...this.transactions];
    this.initializeTypeOptions();
    this.updatePagination();
  }

  private initializeTypeOptions(): void {
    this.typeMultiOptions = this.typeOptions.map(type => ({
      value: type.value,
      label: type.label,
      selected: false
    }));
  }

  private updatePagination(): void {
    this.paginationConfig = {
      ...this.paginationConfig,
      totalItems: this.filteredTransactions.length,
      currentPage: 1
    };
  }

  getTypeText(type: string): string {
    switch (type) {
      case 'sale': return 'Venda';
      case 'purchase': return 'Compra';
      case 'return': return 'Devolução';
      default: return type;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }

  filterTransactions(): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      // Filtro por busca (cliente)
      const matchesSearch = transaction.customer.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtro por tipos (múltiplos)
      const matchesType = this.selectedTypes.length === 0 || 
                         this.selectedTypes.includes(transaction.type);
      
      // Filtro por status
      const matchesStatus = !this.selectedStatus || transaction.status === this.selectedStatus;
      
      // Filtro por faixa de valor
      const matchesAmount = this.matchesAmountFilter(transaction.amount);
      
      // Filtro por data
      const matchesDate = this.matchesDateFilter(transaction.date);
      
      return matchesSearch && matchesType && matchesStatus && matchesAmount && matchesDate;
    });

    this.updatePagination();
  }

  private matchesAmountFilter(amount: number): boolean {
    const min = this.minAmount ? parseFloat(this.minAmount) : 0;
    const max = this.maxAmount ? parseFloat(this.maxAmount) : Infinity;
    return amount >= min && amount <= max;
  }

  private matchesDateFilter(date: Date): boolean {
    if (!this.selectedDateRange) return true;
    
    const now = new Date();
    const transactionDate = new Date(date);
    
    switch (this.selectedDateRange) {
      case 'today':
        return transactionDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= weekAgo;
      case 'month':
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const transactionQuarter = Math.floor(transactionDate.getMonth() / 3);
        return transactionQuarter === quarter && 
               transactionDate.getFullYear() === now.getFullYear();
      case 'year':
        return transactionDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTypes = [];
    this.selectedStatus = '';
    this.selectedDateRange = '';
    this.minAmount = '';
    this.maxAmount = '';
    
    // Reset multi-select options
    this.typeMultiOptions.forEach(option => option.selected = false);
    
    this.filterTransactions();
  }

  onTypeSelectionChange(selectedValues: string[]): void {
    this.selectedTypes = selectedValues;
    this.filterTransactions();
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

  getPaginatedTransactions(): Transaction[] {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    return this.filteredTransactions.slice(startIndex, endIndex);
  }

  viewTransaction(transaction: Transaction): void {
    console.log('Visualizando transação:', transaction);
    // TODO: Implementar modal de visualização
  }

  editTransaction(transaction: Transaction): void {
    console.log('Editando transação:', transaction);
    // TODO: Implementar modal de edição
  }

  cancelTransaction(transaction: Transaction): void {
    if (confirm(`Tem certeza que deseja cancelar a transação #${transaction.id}?`)) {
      transaction.status = 'cancelled';
      console.log('Transação cancelada:', transaction);
    }
  }
}
