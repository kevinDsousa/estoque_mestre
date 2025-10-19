import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  dataType?: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'custom';
  template?: TemplateRef<any>;
  filterType?: 'text' | 'dropdown' | 'date' | 'boolean';
  filterOptions?: any[];
}

export interface TableAction {
  label: string;
  icon: string;
  command: (rowData: any) => void;
  visible?: (rowData: any) => boolean;
  disabled?: (rowData: any) => boolean;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger';
}

export interface TableFilter {
  field: string;
  value: any;
  operator?: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
}

export interface TableSort {
  field: string;
  order: 1 | -1; // 1 for ascending, -1 for descending
}

export interface EstoqueDataTableInputs {
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  loading: boolean;
  paginator: boolean;
  rows: number;
  totalRecords: number;
  first: number;
  sortField?: string;
  sortOrder: number;
  filters: TableFilter[];
  selectionMode?: 'single' | 'multiple' | null;
  selectedItems: any[];
  showHeader: boolean;
  showGlobalFilter: boolean;
  globalFilterPlaceholder: string;
  emptyMessage: string;
  responsive: boolean;
  stripedRows: boolean;
  hoverableRows: boolean;
}

export interface EstoqueDataTableOutputs {
  onRowSelect: EventEmitter<any>;
  onRowUnselect: EventEmitter<any>;
  onSelectionChange: EventEmitter<any[]>;
  onSort: EventEmitter<TableSort>;
  onFilter: EventEmitter<TableFilter[]>;
  onPageChange: EventEmitter<{ first: number; rows: number; page: number; pageCount: number }>;
  onRowClick: EventEmitter<any>;
  onRowDoubleClick: EventEmitter<any>;
}

/**
 * Tabela de dados customizada para Estoque Mestre
 * 
 * Componente avançado com filtros, ordenação, paginação, seleção e ações customizadas
 * 
 * @example
 * ```html
 * <estoque-data-table 
 *   [data]="products"
 *   [columns]="columns"
 *   [actions]="actions"
 *   [loading]="loading"
 *   [paginator]="true"
 *   [rows]="10"
 *   [totalRecords]="totalProducts"
 *   (onRowSelect)="onRowSelect($event)"
 *   (onPageChange)="onPageChange($event)">
 * </estoque-data-table>
 * ```
 */
@Component({
  selector: 'estoque-data-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CheckboxModule,
    TagModule,
    BadgeModule,
    TooltipModule,
    MenuModule,
    PaginatorModule,
    ProgressSpinnerModule
  ],
  templateUrl: './estoque-data-table.component.html',
  styleUrls: ['./estoque-data-table.component.scss']
})
export class EstoqueDataTableComponent implements EstoqueDataTableInputs, EstoqueDataTableOutputs {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading: boolean = false;
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() totalRecords: number = 0;
  @Input() first: number = 0;
  @Input() sortField?: string;
  @Input() sortOrder: number = 1;
  @Input() filters: TableFilter[] = [];
  @Input() selectionMode: 'single' | 'multiple' | null = null;
  @Input() selectedItems: any[] = [];
  @Input() showHeader: boolean = true;
  @Input() showGlobalFilter: boolean = true;
  @Input() globalFilterPlaceholder: string = 'Buscar...';
  @Input() emptyMessage: string = 'Nenhum registro encontrado';
  @Input() responsive: boolean = true;
  @Input() stripedRows: boolean = true;
  @Input() hoverableRows: boolean = true;

  @Output() onRowSelect = new EventEmitter<any>();
  @Output() onRowUnselect = new EventEmitter<any>();
  @Output() onSelectionChange = new EventEmitter<any[]>();
  @Output() onSort = new EventEmitter<TableSort>();
  @Output() onFilter = new EventEmitter<TableFilter[]>();
  @Output() onPageChange = new EventEmitter<{ first: number; rows: number; page: number; pageCount: number }>();
  @Output() onRowClick = new EventEmitter<any>();
  @Output() onRowDoubleClick = new EventEmitter<any>();

  globalFilterValue: string = '';
  columnFilters: { [key: string]: any } = {};

  // Event Handlers
  onRowSelectHandler(event: any): void {
    this.onRowSelect.emit(event.data);
  }

  onRowUnselectHandler(event: any): void {
    this.onRowUnselect.emit(event.data);
  }

  onSelectionChangeHandler(event: any): void {
    this.onSelectionChange.emit(event);
  }

  onSortHandler(event: any): void {
    const sort: TableSort = {
      field: event.field,
      order: event.order === 1 ? 1 : -1
    };
    this.onSort.emit(sort);
  }

  onPageChangeHandler(event: any): void {
    this.onPageChange.emit({
      first: event.first,
      rows: event.rows,
      page: event.page,
      pageCount: event.pageCount
    });
  }

  onRowClickHandler(event: any): void {
    this.onRowClick.emit(event.data);
  }

  onRowDoubleClickHandler(event: any): void {
    this.onRowDoubleClick.emit(event.data);
  }

  // Filter Methods
  onGlobalFilter(event: any): void {
    this.globalFilterValue = event.target.value;
    this.applyFilters();
  }

  onColumnFilter(field: string, value: any): void {
    this.columnFilters[field] = value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.globalFilterValue = '';
    this.columnFilters = {};
    this.applyFilters();
  }

  private applyFilters(): void {
    const filters: TableFilter[] = [];

    // Global filter
    if (this.globalFilterValue) {
      filters.push({
        field: 'global',
        value: this.globalFilterValue,
        operator: 'contains'
      });
    }

    // Column filters
    Object.keys(this.columnFilters).forEach(field => {
      if (this.columnFilters[field] !== null && this.columnFilters[field] !== undefined && this.columnFilters[field] !== '') {
        filters.push({
          field,
          value: this.columnFilters[field],
          operator: 'contains'
        });
      }
    });

    this.onFilter.emit(filters);
  }

  // Action Methods
  executeAction(action: TableAction, rowData: any): void {
    if (action.disabled && action.disabled(rowData)) {
      return;
    }
    action.command(rowData);
  }

  isActionVisible(action: TableAction, rowData: any): boolean {
    return action.visible ? action.visible(rowData) : true;
  }

  isActionDisabled(action: TableAction, rowData: any): boolean {
    return action.disabled ? action.disabled(rowData) : false;
  }

  // Utility Methods
  getColumnValue(rowData: any, column: TableColumn): any {
    const value = this.getNestedValue(rowData, column.field);
    return this.formatValue(value, column);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private formatValue(value: any, column: TableColumn): any {
    if (value === null || value === undefined) return '';

    switch (column.dataType) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR');
      case 'boolean':
        return value ? 'Sim' : 'Não';
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(value);
      default:
        return value;
    }
  }

  // Getters
  get hasActions(): boolean {
    return this.actions && this.actions.length > 0;
  }

  get hasFilters(): boolean {
    return this.columns.some(col => col.filterable);
  }

  get hasSelection(): boolean {
    return this.selectionMode !== null;
  }

  get selectedCount(): number {
    return this.selectedItems ? this.selectedItems.length : 0;
  }

  get isAllSelected(): boolean {
    return this.selectedCount === this.data.length && this.data.length > 0;
  }

  get isPartiallySelected(): boolean {
    return this.selectedCount > 0 && this.selectedCount < this.data.length;
  }

  // Selection Methods
  selectAll(): void {
    if (this.isAllSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.data];
    }
    this.onSelectionChange.emit(this.selectedItems);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  trackByField(index: number, column: TableColumn): string {
    return column.field;
  }

  getCellClass(column: TableColumn, rowData: any): string {
    const classes = [];
    
    switch (column.dataType) {
      case 'number':
        classes.push('cell-number');
        break;
      case 'currency':
        classes.push('cell-currency');
        break;
      case 'date':
        classes.push('cell-date');
        break;
      case 'boolean':
        classes.push('cell-boolean');
        const value = this.getNestedValue(rowData, column.field);
        classes.push(value ? 'true' : 'false');
        break;
    }
    
    return classes.join(' ');
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.columnFilters).some(key => 
      this.columnFilters[key] !== null && 
      this.columnFilters[key] !== undefined && 
      this.columnFilters[key] !== ''
    );
  }
}
