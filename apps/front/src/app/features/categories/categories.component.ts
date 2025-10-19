import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../core/services/dialog.service';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';
import { ViewToggleComponent } from '../../core/components';

interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
  isActive: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchTerm = '';
  showAddModal = false;
  editingCategory: Category | null = null;
  currentView: ViewMode = 'cards';

  constructor(
    private dialogService: DialogService,
    private viewPreferencesService: ViewPreferencesService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    // Carrega a preferência salva
    this.currentView = this.viewPreferencesService.getViewPreference('categories');
  }

  private loadCategories(): void {
    this.categories = [
      {
        id: 1,
        name: 'Eletrônicos',
        description: 'Dispositivos eletrônicos e gadgets',
        productCount: 45,
        isActive: true,
        createdAt: new Date('2024-01-01')
      },
      {
        id: 2,
        name: 'Informática',
        description: 'Computadores, periféricos e acessórios',
        productCount: 78,
        isActive: true,
        createdAt: new Date('2024-01-02')
      },
      {
        id: 3,
        name: 'Casa e Jardim',
        description: 'Produtos para casa e jardinagem',
        productCount: 23,
        isActive: true,
        createdAt: new Date('2024-01-03')
      },
      {
        id: 4,
        name: 'Esportes',
        description: 'Equipamentos e roupas esportivas',
        productCount: 12,
        isActive: false,
        createdAt: new Date('2024-01-04')
      }
    ];
    this.filteredCategories = [...this.categories];
  }

  filterCategories(): void {
    this.filteredCategories = this.categories.filter(category =>
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addCategory(): void {
    this.editingCategory = {
      id: 0,
      name: '',
      description: '',
      productCount: 0,
      isActive: true,
      createdAt: new Date()
    };
    this.showAddModal = true;
  }

  editCategory(category: Category): void {
    this.editingCategory = { ...category };
    this.showAddModal = true;
  }

  deleteCategory(category: Category): void {
    this.dialogService.confirmDelete(category.name, 'categoria').subscribe(result => {
      if (result.confirmed) {
        this.categories = this.categories.filter(c => c.id !== category.id);
        this.filterCategories();
      }
    });
  }

  saveCategory(): void {
    if (this.editingCategory) {
      if (this.editingCategory.id === 0) {
        this.editingCategory.id = Math.max(...this.categories.map(c => c.id)) + 1;
        this.categories.push(this.editingCategory);
      } else {
        const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
        this.categories[index] = this.editingCategory;
      }
      this.filterCategories();
    }
    this.closeModal();
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingCategory = null;
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Ativa' : 'Inativa';
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    // Salva a preferência no localStorage
    this.viewPreferencesService.setViewPreference('categories', view);
  }
}
