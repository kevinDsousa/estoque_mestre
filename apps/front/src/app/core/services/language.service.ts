import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { APP_CONSTANTS } from '../utils/constants';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  currencySymbol: string;
  numberFormat: string;
  translations: {
    [key: string]: string;
  };
}

export interface TranslationKeys {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    sort: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    confirm: string;
    yes: string;
    no: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    clear: string;
    select: string;
    selectAll: string;
    deselectAll: string;
    refresh: string;
    export: string;
    import: string;
    download: string;
    upload: string;
    print: string;
    copy: string;
    paste: string;
    cut: string;
    undo: string;
    redo: string;
  };

  // Navigation
  navigation: {
    dashboard: string;
    products: string;
    categories: string;
    suppliers: string;
    customers: string;
    transactions: string;
    reports: string;
    settings: string;
    profile: string;
    logout: string;
    login: string;
    register: string;
  };

  // Forms
  forms: {
    required: string;
    invalid: string;
    minLength: string;
    maxLength: string;
    email: string;
    phone: string;
    cpf: string;
    cnpj: string;
    cep: string;
    password: string;
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
  };

  // Messages
  messages: {
    saved: string;
    updated: string;
    deleted: string;
    created: string;
    errorOccurred: string;
    networkError: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    serverError: string;
    validationError: string;
    loginSuccess: string;
    logoutSuccess: string;
    passwordChanged: string;
    profileUpdated: string;
  };

  // Tables
  tables: {
    noData: string;
    loading: string;
    rowsPerPage: string;
    of: string;
    previousPage: string;
    nextPage: string;
    firstPage: string;
    lastPage: string;
    search: string;
    clear: string;
    selectAll: string;
    deselectAll: string;
  };

  // Dashboard
  dashboard: {
    overview: string;
    analytics: string;
    recentActivity: string;
    quickActions: string;
    statistics: string;
    charts: string;
    reports: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<Language>(this.getDefaultLanguage());
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private readonly STORAGE_KEY = APP_CONSTANTS.STORAGE_KEYS.LANGUAGE;
  private readonly AVAILABLE_LANGUAGES: Language[] = [
    {
      code: 'pt-BR',
      name: 'Português (Brasil)',
      nativeName: 'Português',
      flag: '🇧🇷',
      dateFormat: 'dd/MM/yyyy',
      timeFormat: 'HH:mm',
      currency: 'BRL',
      currencySymbol: 'R$',
      numberFormat: 'pt-BR',
      translations: this.getPortugueseTranslations()
    },
    {
      code: 'en-US',
      name: 'English (US)',
      nativeName: 'English',
      flag: '🇺🇸',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: 'h:mm a',
      currency: 'USD',
      currencySymbol: '$',
      numberFormat: 'en-US',
      translations: this.getEnglishTranslations()
    },
    {
      code: 'es-ES',
      name: 'Español',
      nativeName: 'Español',
      flag: '🇪🇸',
      dateFormat: 'dd/MM/yyyy',
      timeFormat: 'HH:mm',
      currency: 'EUR',
      currencySymbol: '€',
      numberFormat: 'es-ES',
      translations: this.getSpanishTranslations()
    }
  ];

  constructor(private storageService: StorageService) {
    this.initializeLanguage();
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  /**
   * Get current language as observable
   */
  getCurrentLanguage$(): Observable<Language> {
    return this.currentLanguage$;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Language[] {
    return this.AVAILABLE_LANGUAGES;
  }

  /**
   * Set current language
   */
  setLanguage(languageCode: string): void {
    const language = this.AVAILABLE_LANGUAGES.find(lang => lang.code === languageCode);
    
    if (language) {
      this.currentLanguageSubject.next(language);
      this.saveLanguage(language);
      this.updateDocumentLanguage(language);
    }
  }

  /**
   * Get translation by key
   */
  translate(key: string): string {
    const currentLanguage = this.getCurrentLanguage();
    const keys = key.split('.');
    let translation: any = currentLanguage.translations;

    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof translation === 'string' ? translation : key;
  }

  /**
   * Get translation with parameters
   */
  translateWithParams(key: string, params: { [key: string]: string | number }): string {
    let translation = this.translate(key);
    
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(`{{${paramKey}}}`, String(value));
    });

    return translation;
  }

  /**
   * Format date according to current language
   */
  formatDate(date: string | Date, format?: string): string {
    if (!date) return '';
    
    const currentLanguage = this.getCurrentLanguage();
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';

    const options: Intl.DateTimeFormatOptions = {};
    const formatToUse = format || currentLanguage.dateFormat;

    switch (formatToUse) {
      case 'short':
        options.day = '2-digit';
        options.month = '2-digit';
        options.year = 'numeric';
        break;
      case 'long':
        options.day = '2-digit';
        options.month = 'long';
        options.year = 'numeric';
        break;
      case 'time':
        options.hour = '2-digit';
        options.minute = '2-digit';
        break;
      case 'datetime':
        options.day = '2-digit';
        options.month = '2-digit';
        options.year = 'numeric';
        options.hour = '2-digit';
        options.minute = '2-digit';
        break;
    }

    return new Intl.DateTimeFormat(currentLanguage.numberFormat, options).format(dateObj);
  }

  /**
   * Format number according to current language
   */
  formatNumber(value: number): string {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    const currentLanguage = this.getCurrentLanguage();
    return new Intl.NumberFormat(currentLanguage.numberFormat).format(value);
  }

  /**
   * Format currency according to current language
   */
  formatCurrency(value: number): string {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    const currentLanguage = this.getCurrentLanguage();
    return new Intl.NumberFormat(currentLanguage.numberFormat, {
      style: 'currency',
      currency: currentLanguage.currency
    }).format(value);
  }

  /**
   * Initialize language from storage or browser
   */
  private initializeLanguage(): void {
    const savedLanguage = this.storageService.getItemAsObject<Language>(this.STORAGE_KEY);
    
    if (savedLanguage && this.AVAILABLE_LANGUAGES.find(lang => lang.code === savedLanguage.code)) {
      this.currentLanguageSubject.next(savedLanguage);
    } else {
      const browserLanguage = this.getBrowserLanguage();
      const language = this.AVAILABLE_LANGUAGES.find(lang => 
        lang.code === browserLanguage || lang.code.startsWith(browserLanguage.split('-')[0])
      ) || this.getDefaultLanguage();
      
      this.currentLanguageSubject.next(language);
      this.saveLanguage(language);
    }

    this.updateDocumentLanguage(this.getCurrentLanguage());
  }

  /**
   * Get browser language
   */
  private getBrowserLanguage(): string {
    return navigator.language || navigator.languages[0] || 'pt-BR';
  }

  /**
   * Get default language
   */
  private getDefaultLanguage(): Language {
    return this.AVAILABLE_LANGUAGES[0]; // Portuguese as default
  }

  /**
   * Save language to storage
   */
  private saveLanguage(language: Language): void {
    this.storageService.setItem(this.STORAGE_KEY, language);
  }

  /**
   * Update document language
   */
  private updateDocumentLanguage(language: Language): void {
    document.documentElement.lang = language.code;
    document.documentElement.setAttribute('data-language', language.code);
  }

  /**
   * Get Portuguese translations
   */
  private getPortugueseTranslations(): any {
    return {
      common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        create: 'Criar',
        update: 'Atualizar',
        search: 'Pesquisar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        loading: 'Carregando...',
        error: 'Erro',
        success: 'Sucesso',
        warning: 'Aviso',
        info: 'Informação',
        confirm: 'Confirmar',
        yes: 'Sim',
        no: 'Não',
        close: 'Fechar',
        back: 'Voltar',
        next: 'Próximo',
        previous: 'Anterior',
        submit: 'Enviar',
        reset: 'Limpar',
        clear: 'Limpar',
        select: 'Selecionar',
        selectAll: 'Selecionar Todos',
        deselectAll: 'Desmarcar Todos',
        refresh: 'Atualizar',
        export: 'Exportar',
        import: 'Importar',
        download: 'Baixar',
        upload: 'Enviar',
        print: 'Imprimir',
        copy: 'Copiar',
        paste: 'Colar',
        cut: 'Cortar',
        undo: 'Desfazer',
        redo: 'Refazer'
      },
      navigation: {
        dashboard: 'Dashboard',
        products: 'Produtos',
        categories: 'Categorias',
        suppliers: 'Fornecedores',
        customers: 'Clientes',
        transactions: 'Transações',
        reports: 'Relatórios',
        settings: 'Configurações',
        profile: 'Perfil',
        logout: 'Sair',
        login: 'Entrar',
        register: 'Registrar'
      },
      forms: {
        required: 'Este campo é obrigatório',
        invalid: 'Valor inválido',
        minLength: 'Mínimo de caracteres não atingido',
        maxLength: 'Máximo de caracteres excedido',
        email: 'Email',
        phone: 'Telefone',
        cpf: 'CPF',
        cnpj: 'CNPJ',
        cep: 'CEP',
        password: 'Senha',
        confirmPassword: 'Confirmar Senha',
        currentPassword: 'Senha Atual',
        newPassword: 'Nova Senha'
      },
      messages: {
        saved: 'Salvo com sucesso',
        updated: 'Atualizado com sucesso',
        deleted: 'Excluído com sucesso',
        created: 'Criado com sucesso',
        errorOccurred: 'Ocorreu um erro',
        networkError: 'Erro de conexão',
        unauthorized: 'Não autorizado',
        forbidden: 'Acesso negado',
        notFound: 'Não encontrado',
        serverError: 'Erro do servidor',
        validationError: 'Erro de validação',
        loginSuccess: 'Login realizado com sucesso',
        logoutSuccess: 'Logout realizado com sucesso',
        passwordChanged: 'Senha alterada com sucesso',
        profileUpdated: 'Perfil atualizado com sucesso'
      },
      tables: {
        noData: 'Nenhum dado encontrado',
        loading: 'Carregando...',
        rowsPerPage: 'Linhas por página',
        of: 'de',
        previousPage: 'Página anterior',
        nextPage: 'Próxima página',
        firstPage: 'Primeira página',
        lastPage: 'Última página',
        search: 'Pesquisar',
        clear: 'Limpar',
        selectAll: 'Selecionar todos',
        deselectAll: 'Desmarcar todos'
      },
      dashboard: {
        overview: 'Visão Geral',
        analytics: 'Analytics',
        recentActivity: 'Atividade Recente',
        quickActions: 'Ações Rápidas',
        statistics: 'Estatísticas',
        charts: 'Gráficos',
        reports: 'Relatórios'
      }
    };
  }

  /**
   * Get English translations
   */
  private getEnglishTranslations(): any {
    return {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        reset: 'Reset',
        clear: 'Clear',
        select: 'Select',
        selectAll: 'Select All',
        deselectAll: 'Deselect All',
        refresh: 'Refresh',
        export: 'Export',
        import: 'Import',
        download: 'Download',
        upload: 'Upload',
        print: 'Print',
        copy: 'Copy',
        paste: 'Paste',
        cut: 'Cut',
        undo: 'Undo',
        redo: 'Redo'
      },
      navigation: {
        dashboard: 'Dashboard',
        products: 'Products',
        categories: 'Categories',
        suppliers: 'Suppliers',
        customers: 'Customers',
        transactions: 'Transactions',
        reports: 'Reports',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Logout',
        login: 'Login',
        register: 'Register'
      },
      forms: {
        required: 'This field is required',
        invalid: 'Invalid value',
        minLength: 'Minimum length not reached',
        maxLength: 'Maximum length exceeded',
        email: 'Email',
        phone: 'Phone',
        cpf: 'CPF',
        cnpj: 'CNPJ',
        cep: 'ZIP Code',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password'
      },
      messages: {
        saved: 'Saved successfully',
        updated: 'Updated successfully',
        deleted: 'Deleted successfully',
        created: 'Created successfully',
        errorOccurred: 'An error occurred',
        networkError: 'Network error',
        unauthorized: 'Unauthorized',
        forbidden: 'Forbidden',
        notFound: 'Not found',
        serverError: 'Server error',
        validationError: 'Validation error',
        loginSuccess: 'Login successful',
        logoutSuccess: 'Logout successful',
        passwordChanged: 'Password changed successfully',
        profileUpdated: 'Profile updated successfully'
      },
      tables: {
        noData: 'No data found',
        loading: 'Loading...',
        rowsPerPage: 'Rows per page',
        of: 'of',
        previousPage: 'Previous page',
        nextPage: 'Next page',
        firstPage: 'First page',
        lastPage: 'Last page',
        search: 'Search',
        clear: 'Clear',
        selectAll: 'Select all',
        deselectAll: 'Deselect all'
      },
      dashboard: {
        overview: 'Overview',
        analytics: 'Analytics',
        recentActivity: 'Recent Activity',
        quickActions: 'Quick Actions',
        statistics: 'Statistics',
        charts: 'Charts',
        reports: 'Reports'
      }
    };
  }

  /**
   * Get Spanish translations
   */
  private getSpanishTranslations(): any {
    return {
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        create: 'Crear',
        update: 'Actualizar',
        search: 'Buscar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        warning: 'Advertencia',
        info: 'Información',
        confirm: 'Confirmar',
        yes: 'Sí',
        no: 'No',
        close: 'Cerrar',
        back: 'Atrás',
        next: 'Siguiente',
        previous: 'Anterior',
        submit: 'Enviar',
        reset: 'Restablecer',
        clear: 'Limpiar',
        select: 'Seleccionar',
        selectAll: 'Seleccionar Todo',
        deselectAll: 'Deseleccionar Todo',
        refresh: 'Actualizar',
        export: 'Exportar',
        import: 'Importar',
        download: 'Descargar',
        upload: 'Subir',
        print: 'Imprimir',
        copy: 'Copiar',
        paste: 'Pegar',
        cut: 'Cortar',
        undo: 'Deshacer',
        redo: 'Rehacer'
      },
      navigation: {
        dashboard: 'Panel',
        products: 'Productos',
        categories: 'Categorías',
        suppliers: 'Proveedores',
        customers: 'Clientes',
        transactions: 'Transacciones',
        reports: 'Reportes',
        settings: 'Configuración',
        profile: 'Perfil',
        logout: 'Cerrar Sesión',
        login: 'Iniciar Sesión',
        register: 'Registrar'
      },
      forms: {
        required: 'Este campo es obligatorio',
        invalid: 'Valor inválido',
        minLength: 'Longitud mínima no alcanzada',
        maxLength: 'Longitud máxima excedida',
        email: 'Email',
        phone: 'Teléfono',
        cpf: 'CPF',
        cnpj: 'CNPJ',
        cep: 'Código Postal',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        currentPassword: 'Contraseña Actual',
        newPassword: 'Nueva Contraseña'
      },
      messages: {
        saved: 'Guardado exitosamente',
        updated: 'Actualizado exitosamente',
        deleted: 'Eliminado exitosamente',
        created: 'Creado exitosamente',
        errorOccurred: 'Ocurrió un error',
        networkError: 'Error de red',
        unauthorized: 'No autorizado',
        forbidden: 'Prohibido',
        notFound: 'No encontrado',
        serverError: 'Error del servidor',
        validationError: 'Error de validación',
        loginSuccess: 'Inicio de sesión exitoso',
        logoutSuccess: 'Cierre de sesión exitoso',
        passwordChanged: 'Contraseña cambiada exitosamente',
        profileUpdated: 'Perfil actualizado exitosamente'
      },
      tables: {
        noData: 'No se encontraron datos',
        loading: 'Cargando...',
        rowsPerPage: 'Filas por página',
        of: 'de',
        previousPage: 'Página anterior',
        nextPage: 'Página siguiente',
        firstPage: 'Primera página',
        lastPage: 'Última página',
        search: 'Buscar',
        clear: 'Limpiar',
        selectAll: 'Seleccionar todo',
        deselectAll: 'Deseleccionar todo'
      },
      dashboard: {
        overview: 'Resumen',
        analytics: 'Analíticas',
        recentActivity: 'Actividad Reciente',
        quickActions: 'Acciones Rápidas',
        statistics: 'Estadísticas',
        charts: 'Gráficos',
        reports: 'Reportes'
      }
    };
  }
}
