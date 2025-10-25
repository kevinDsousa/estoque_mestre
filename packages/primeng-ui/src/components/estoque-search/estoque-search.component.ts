import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

export interface SearchField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number';
  placeholder?: string;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  required?: boolean;
}

export interface SearchCriteria {
  [key: string]: any;
}

export interface EstoqueSearchInputs {
  fields: SearchField[];
  placeholder?: string;
  showAdvanced: boolean;
  debounceTime: number;
  clearable: boolean;
  size: 'small' | 'medium' | 'large';
}

export interface EstoqueSearchOutputs {
  onSearch: EventEmitter<SearchCriteria>;
  onClear: EventEmitter<void>;
  onAdvancedToggle: EventEmitter<boolean>;
}

/**
 * Componente de busca avançada para Estoque Mestre
 * 
 * Componente padronizado para busca e filtros avançados
 * 
 * @example
 * ```html
 * <estoque-search 
 *   [fields]="searchFields"
 *   [showAdvanced]="true"
 *   [debounceTime]="300"
 *   (onSearch)="onSearch($event)"
 *   (onClear)="onClear()">
 * </estoque-search>
 * ```
 */
@Component({
  selector: 'estoque-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    CardModule
  ],
  templateUrl: './estoque-search.component.html',
  styleUrls: ['./estoque-search.component.scss']
})
export class EstoqueSearchComponent implements EstoqueSearchInputs, EstoqueSearchOutputs, OnInit, OnDestroy {
  @Input() fields: SearchField[] = [];
  @Input() placeholder: string = 'Buscar...';
  @Input() showAdvanced: boolean = false;
  @Input() debounceTime: number = 300;
  @Input() clearable: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  @Output() onSearch = new EventEmitter<SearchCriteria>();
  @Output() onClear = new EventEmitter<void>();
  @Output() onAdvancedToggle = new EventEmitter<boolean>();

  searchCriteria: SearchCriteria = {};
  searchText: string = '';
  isAdvancedOpen: boolean = false;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((searchText: string) => {
        this.performSearch();
      });
  }

  onSearchTextChange(): void {
    this.searchSubject.next(this.searchText);
  }

  onCriteriaChange(): void {
    this.performSearch();
  }

  performSearch(): void {
    const criteria: SearchCriteria = {
      search: this.searchText,
      ...this.searchCriteria
    };
    
    this.onSearch.emit(criteria);
  }

  onClearSearch(): void {
    this.searchText = '';
    this.searchCriteria = {};
    this.onClear.emit();
    this.performSearch();
  }

  onToggleAdvanced(): void {
    this.isAdvancedOpen = !this.isAdvancedOpen;
    this.onAdvancedToggle.emit(this.isAdvancedOpen);
  }

  getSearchClass(): string {
    const classes = ['estoque-search'];
    classes.push(`size-${this.size}`);
    if (this.isAdvancedOpen) classes.push('advanced-open');
    return classes.join(' ');
  }

  getFieldClass(field: SearchField): string {
    const classes = ['search-field'];
    classes.push(`type-${field.type}`);
    if (field.required) classes.push('required');
    return classes.join(' ');
  }

  hasActiveFilters(): boolean {
    return this.searchText.length > 0 || 
           Object.values(this.searchCriteria).some(value => 
             value !== null && value !== undefined && value !== ''
           );
  }

  getActiveFiltersCount(): number {
    let count = this.searchText.length > 0 ? 1 : 0;
    count += Object.values(this.searchCriteria).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
    return count;
  }
}
