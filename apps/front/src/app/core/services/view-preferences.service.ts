import { Injectable } from '@angular/core';

export type ViewMode = 'table' | 'cards';

export interface ViewPreferences {
  products: ViewMode;
  categories: ViewMode;
  transactions: ViewMode;
  suppliers: ViewMode;
  customers: ViewMode;
}

@Injectable({
  providedIn: 'root'
})
export class ViewPreferencesService {
  private readonly STORAGE_KEY = 'view-preferences';
  private readonly DEFAULT_PREFERENCES: ViewPreferences = {
    products: 'table',
    categories: 'cards',
    transactions: 'table',
    suppliers: 'cards',
    customers: 'cards'
  };

  constructor() {}

  /**
   * Obtém a preferência de visualização para um componente específico
   */
  getViewPreference(component: keyof ViewPreferences): ViewMode {
    const preferences = this.loadPreferences();
    return preferences[component];
  }

  /**
   * Define a preferência de visualização para um componente específico
   */
  setViewPreference(component: keyof ViewPreferences, view: ViewMode): void {
    const currentPreferences = this.loadPreferences();
    const newPreferences = {
      ...currentPreferences,
      [component]: view
    };
    
    this.savePreferences(newPreferences);
  }

  /**
   * Obtém todas as preferências
   */
  getAllPreferences(): ViewPreferences {
    return this.loadPreferences();
  }

  /**
   * Reseta todas as preferências para os valores padrão
   */
  resetPreferences(): void {
    this.savePreferences(this.DEFAULT_PREFERENCES);
  }

  /**
   * Carrega as preferências do localStorage
   */
  private loadPreferences(): ViewPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge com valores padrão para garantir que todas as propriedades existam
        return { ...this.DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.warn('Erro ao carregar preferências de visualização:', error);
    }
    
    return this.DEFAULT_PREFERENCES;
  }

  /**
   * Salva as preferências no localStorage
   */
  private savePreferences(preferences: ViewPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Erro ao salvar preferências de visualização:', error);
    }
  }
}
