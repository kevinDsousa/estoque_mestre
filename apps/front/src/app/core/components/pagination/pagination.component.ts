import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationConfig {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  maxVisiblePages?: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() config: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    maxVisiblePages: 5
  };
  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  totalPages = 0;
  visiblePages: number[] = [];
  itemsPerPageOptions = [5, 10, 20, 50, 100];

  ngOnInit(): void {
    this.calculatePagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.calculatePagination();
    }
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.config.totalItems / this.config.itemsPerPage);
    this.generateVisiblePages();
  }

  private generateVisiblePages(): void {
    const maxVisible = this.config.maxVisiblePages || 5;
    const current = this.config.currentPage;
    const total = this.totalPages;

    this.visiblePages = [];

    if (total <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= total; i++) {
        this.visiblePages.push(i);
      }
    } else {
      // Calculate start and end pages
      let start = Math.max(1, current - Math.floor(maxVisible / 2));
      let end = Math.min(total, start + maxVisible - 1);

      // Adjust start if we're near the end
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      // Add pages
      for (let i = start; i <= end; i++) {
        this.visiblePages.push(i);
      }
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.config.currentPage) {
      this.pageChange.emit(page);
    }
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  goToPreviousPage(): void {
    this.goToPage(this.config.currentPage - 1);
  }

  goToNextPage(): void {
    this.goToPage(this.config.currentPage + 1);
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newItemsPerPage = parseInt(target.value, 10);
    this.itemsPerPageChange.emit(newItemsPerPage);
  }

  getStartItem(): number {
    return (this.config.currentPage - 1) * this.config.itemsPerPage + 1;
  }

  getEndItem(): number {
    return Math.min(this.config.currentPage * this.config.itemsPerPage, this.config.totalItems);
  }

  getPageInfo(): string {
    if (this.config.totalItems === 0) {
      return 'Nenhum item encontrado';
    }
    return `${this.getStartItem()}-${this.getEndItem()} de ${this.config.totalItems} itens`;
  }

  canGoToPrevious(): boolean {
    return this.config.currentPage > 1;
  }

  canGoToNext(): boolean {
    return this.config.currentPage < this.totalPages;
  }

  shouldShowPagination(): boolean {
    return this.config.totalItems > 0;
  }

  trackByPage(index: number, page: number): number {
    return page;
  }
}
