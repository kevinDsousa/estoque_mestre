import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MultiSelectOption {
  value: string;
  label: string;
  selected?: boolean;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss'
})
export class MultiSelectComponent implements OnInit, OnDestroy {
  @Input() options: MultiSelectOption[] = [];
  @Input() placeholder: string = 'Selecione...';
  @Input() maxHeight: string = '200px';
  @Input() disabled: boolean = false;
  @Output() selectionChange = new EventEmitter<string[]>();

  isOpen = false;
  searchTerm = '';
  filteredOptions: MultiSelectOption[] = [];

  ngOnInit(): void {
    this.filteredOptions = [...this.options];
  }

  ngOnDestroy(): void {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.multi-select-container')) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.searchTerm = '';
        this.filterOptions();
      }
    }
  }

  filterOptions(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOptions = [...this.options];
    } else {
      this.filteredOptions = this.options.filter(option =>
        option.label.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  toggleOption(option: MultiSelectOption): void {
    option.selected = !option.selected;
    this.emitSelection();
  }

  selectAll(): void {
    this.options.forEach(option => option.selected = true);
    this.emitSelection();
  }

  deselectAll(): void {
    this.options.forEach(option => option.selected = false);
    this.emitSelection();
  }

  private emitSelection(): void {
    const selectedValues = this.options
      .filter(option => option.selected)
      .map(option => option.value);
    this.selectionChange.emit(selectedValues);
  }

  getSelectedLabels(): string {
    const selected = this.options.filter(option => option.selected);
    if (selected.length === 0) {
      return this.placeholder;
    }
    if (selected.length === 1) {
      return selected[0].label;
    }
    if (selected.length === this.options.length) {
      return 'Todas selecionadas';
    }
    return `${selected.length} selecionadas`;
  }

  getSelectedCount(): number {
    return this.options.filter(option => option.selected).length;
  }

  hasSelection(): boolean {
    return this.getSelectedCount() > 0;
  }

  trackByValue(index: number, option: MultiSelectOption): string {
    return option.value;
  }
}
