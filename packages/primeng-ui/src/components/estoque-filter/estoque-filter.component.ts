import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

export interface FilterOption {
  label: string;
  value: any;
  count?: number;
  disabled?: boolean;
  checked?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'checkbox' | 'radio' | 'slider' | 'chips';
  options?: FilterOption[];
  placeholder?: string;
  showClear?: boolean;
  showCount?: boolean;
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
  required?: boolean;
}

export interface FilterValue {
  [key: string]: any;
}

export interface EstoqueFilterInputs {
  filters: FilterConfig[];
  values: FilterValue;
  showLabels: boolean;
  showClearAll: boolean;
  showCounts: boolean;
  layout: 'horizontal' | 'vertical' | 'grid';
  size: 'small' | 'medium' | 'large';
}

export interface EstoqueFilterOutputs {
  onFilterChange: EventEmitter<FilterValue>;
  onClearAll: EventEmitter<void>;
  onClearFilter: EventEmitter<string>;
}

/**
 * Componente de filtros reutilizáveis para Estoque Mestre
 * 
 * Componente padronizado para filtros em listas e tabelas
 * 
 * @example
 * ```html
 * <estoque-filter 
 *   [filters]="filterConfigs"
 *   [values]="filterValues"
 *   [showLabels]="true"
 *   [layout]="'horizontal'"
 *   (onFilterChange)="onFilterChange($event)"
 *   (onClearAll)="onClearAll()">
 * </estoque-filter>
 * ```
 */
@Component({
  selector: 'estoque-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    RadioButtonModule,
    SliderModule,
    ButtonModule,
    CardModule,
    ChipModule
  ],
  templateUrl: './estoque-filter.component.html',
  styleUrls: ['./estoque-filter.component.scss']
})
export class EstoqueFilterComponent implements EstoqueFilterInputs, EstoqueFilterOutputs {
  @Input() filters: FilterConfig[] = [];
  @Input() values: FilterValue = {};
  @Input() showLabels: boolean = true;
  @Input() showClearAll: boolean = true;
  @Input() showCounts: boolean = true;
  @Input() layout: 'horizontal' | 'vertical' | 'grid' = 'horizontal';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  @Output() onFilterChange = new EventEmitter<FilterValue>();
  @Output() onClearAll = new EventEmitter<void>();
  @Output() onClearFilter = new EventEmitter<string>();

  onFilterValueChange(filterKey: string, value: any): void {
    this.values = {
      ...this.values,
      [filterKey]: value
    };
    
    this.onFilterChange.emit(this.values);
  }

  onClearFilterValue(filterKey: string): void {
    const newValues = { ...this.values };
    delete newValues[filterKey];
    this.values = newValues;
    
    this.onClearFilter.emit(filterKey);
    this.onFilterChange.emit(this.values);
  }

  onClearAllFilters(): void {
    this.values = {};
    this.onClearAll.emit();
    this.onFilterChange.emit(this.values);
  }

  getFilterClass(): string {
    const classes = ['estoque-filter'];
    classes.push(`layout-${this.layout}`);
    classes.push(`size-${this.size}`);
    return classes.join(' ');
  }

  getFilterItemClass(filter: FilterConfig): string {
    const classes = ['filter-item'];
    classes.push(`type-${filter.type}`);
    if (filter.required) classes.push('required');
    return classes.join(' ');
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.values).length > 0;
  }

  getActiveFiltersCount(): number {
    return Object.keys(this.values).length;
  }

  getFilterDisplayValue(filter: FilterConfig): string {
    const value = this.values[filter.key];
    if (value === null || value === undefined || value === '') return '';
    
    if (Array.isArray(value)) {
      return value.length > 0 ? `${value.length} selecionado(s)` : '';
    }
    
    if (filter.type === 'slider') {
      return `${value}`;
    }
    
    const option = filter.options?.find(opt => opt.value === value);
    return option ? option.label : String(value);
  }

  isFilterActive(filter: FilterConfig): boolean {
    const value = this.values[filter.key];
    return value !== null && value !== undefined && value !== '' && 
           (!Array.isArray(value) || value.length > 0);
  }

  onCheckboxChange(filter: FilterConfig, option: FilterOption): void {
    if (!this.values[filter.key]) {
      this.values[filter.key] = [];
    }
    
    const currentValues = this.values[filter.key] as any[];
    const index = currentValues.indexOf(option.value);
    
    if (option.checked && index === -1) {
      currentValues.push(option.value);
    } else if (!option.checked && index > -1) {
      currentValues.splice(index, 1);
    }
    
    this.onFilterValueChange(filter.key, currentValues);
  }

  isChipSelected(filter: FilterConfig, option: FilterOption): boolean {
    const value = this.values[filter.key];
    if (Array.isArray(value)) {
      return value.includes(option.value);
    }
    return value === option.value;
  }

  onChipClick(filter: FilterConfig, option: FilterOption): void {
    if (filter.multiple) {
      if (!this.values[filter.key]) {
        this.values[filter.key] = [];
      }
      
      const currentValues = this.values[filter.key] as any[];
      const index = currentValues.indexOf(option.value);
      
      if (index === -1) {
        currentValues.push(option.value);
      } else {
        currentValues.splice(index, 1);
      }
      
      this.onFilterValueChange(filter.key, currentValues);
    } else {
      this.onFilterValueChange(filter.key, option.value);
    }
  }

  onChipRemove(filter: FilterConfig, option: FilterOption): void {
    if (filter.multiple) {
      const currentValues = this.values[filter.key] as any[];
      const index = currentValues.indexOf(option.value);
      
      if (index > -1) {
        currentValues.splice(index, 1);
        this.onFilterValueChange(filter.key, currentValues);
      }
    } else {
      this.onClearFilterValue(filter.key);
    }
  }
}
