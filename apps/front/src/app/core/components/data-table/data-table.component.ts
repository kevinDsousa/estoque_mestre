import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent, PaginationConfig } from '../pagination/pagination.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  template?: TemplateRef<any>;
}

export interface TableAction {
  label: string;
  icon: string;
  class?: string;
  action: (item: any) => void;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() pagination: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10
  };
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'Nenhum item encontrado';
  @Input() showPagination: boolean = true;
  @Input() striped: boolean = true;
  @Input() hover: boolean = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();

  currentSort: { column: string; direction: 'asc' | 'desc' } | null = null;
  paginatedData: any[] = [];

  ngOnInit(): void {
    this.updatePaginatedData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['pagination']) {
      this.updatePaginatedData();
    }
  }

  private updatePaginatedData(): void {
    if (!this.data || this.data.length === 0) {
      this.paginatedData = [];
      return;
    }

    const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    this.paginatedData = this.data.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPageChange.emit(itemsPerPage);
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    
    if (this.currentSort?.column === column.key) {
      direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    }

    this.currentSort = { column: column.key, direction };
    this.sortChange.emit(this.currentSort);
  }

  getSortIcon(column: TableColumn): string {
    if (!column.sortable) return '';
    
    if (this.currentSort?.column === column.key) {
      return this.currentSort.direction === 'asc' ? 'pi pi-sort-up' : 'pi pi-sort-down';
    }
    
    return 'pi pi-sort';
  }

  getColumnClass(column: TableColumn): string {
    const classes = ['table-column'];
    
    if (column.align) {
      classes.push(`align-${column.align}`);
    }
    
    if (column.sortable) {
      classes.push('sortable');
    }
    
    return classes.join(' ');
  }

  getRowClass(index: number): string {
    const classes = ['table-row'];
    
    if (this.striped && index % 2 === 1) {
      classes.push('striped');
    }
    
    if (this.hover) {
      classes.push('hoverable');
    }
    
    return classes.join(' ');
  }

  hasActions(): boolean {
    return this.actions && this.actions.length > 0;
  }

  getCellValue(item: any, column: TableColumn): any {
    return this.getNestedValue(item, column.key);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByColumn(index: number, column: TableColumn): string {
    return column.key;
  }
}
