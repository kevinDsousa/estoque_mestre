import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { APP_CONSTANTS } from '../utils/constants';
import { LayoutConfig, SidebarItem } from '../interfaces/layout.interface';

// Re-export interfaces for external use
export { LayoutConfig, SidebarItem } from '../interfaces/layout.interface';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private layoutConfigSubject = new BehaviorSubject<LayoutConfig>(this.getDefaultLayoutConfig());
  public layoutConfig$ = this.layoutConfigSubject.asObservable();

  private sidebarItemsSubject = new BehaviorSubject<SidebarItem[]>(this.getDefaultSidebarItems());
  public sidebarItems$ = this.sidebarItemsSubject.asObservable();

  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  public sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();

  private readonly STORAGE_KEY = 'layout_config';

  constructor(private storageService: StorageService) {
    this.initializeLayout();
  }

  /**
   * Get current layout configuration
   */
  getCurrentLayoutConfig(): LayoutConfig {
    return this.layoutConfigSubject.value;
  }

  /**
   * Get layout configuration as observable
   */
  getLayoutConfig(): Observable<LayoutConfig> {
    return this.layoutConfig$;
  }

  /**
   * Update layout configuration
   */
  updateLayoutConfig(config: Partial<LayoutConfig>): void {
    const currentConfig = this.getCurrentLayoutConfig();
    const newConfig = { ...currentConfig, ...config };
    
    this.layoutConfigSubject.next(newConfig);
    this.saveLayoutConfig(newConfig);
  }

  /**
   * Update sidebar configuration
   */
  updateSidebarConfig(config: Partial<LayoutConfig['sidebar']>): void {
    const currentConfig = this.getCurrentLayoutConfig();
    const newConfig = {
      ...currentConfig,
      sidebar: { ...currentConfig.sidebar, ...config }
    };
    
    this.layoutConfigSubject.next(newConfig);
    this.saveLayoutConfig(newConfig);
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    const currentConfig = this.getCurrentLayoutConfig();
    const newCollapsed = !currentConfig.sidebar.collapsed;
    
    this.updateSidebarConfig({ collapsed: newCollapsed });
    this.sidebarCollapsedSubject.next(newCollapsed);
  }

  /**
   * Set sidebar collapsed state
   */
  setSidebarCollapsed(collapsed: boolean): void {
    this.updateSidebarConfig({ collapsed });
    this.sidebarCollapsedSubject.next(collapsed);
  }

  /**
   * Get sidebar items
   */
  getSidebarItems(): SidebarItem[] {
    return this.sidebarItemsSubject.value;
  }

  /**
   * Get sidebar items as observable
   */
  getSidebarItems$(): Observable<SidebarItem[]> {
    return this.sidebarItems$;
  }

  /**
   * Update sidebar items
   */
  updateSidebarItems(items: SidebarItem[]): void {
    this.sidebarItemsSubject.next(items);
  }

  /**
   * Add sidebar item
   */
  addSidebarItem(item: SidebarItem, parentId?: string): void {
    const currentItems = this.getSidebarItems();
    
    if (parentId) {
      const updatedItems = this.addItemToParent(currentItems, parentId, item);
      this.updateSidebarItems(updatedItems);
    } else {
      this.updateSidebarItems([...currentItems, item]);
    }
  }

  /**
   * Remove sidebar item
   */
  removeSidebarItem(itemId: string): void {
    const currentItems = this.getSidebarItems();
    const updatedItems = this.removeItemFromItems(currentItems, itemId);
    this.updateSidebarItems(updatedItems);
  }

  /**
   * Update sidebar item
   */
  updateSidebarItem(itemId: string, updates: Partial<SidebarItem>): void {
    const currentItems = this.getSidebarItems();
    const updatedItems = this.updateItemInItems(currentItems, itemId, updates);
    this.updateSidebarItems(updatedItems);
  }

  /**
   * Toggle sidebar item expansion
   */
  toggleSidebarItemExpansion(itemId: string): void {
    const currentItems = this.getSidebarItems();
    const updatedItems = this.toggleItemExpansion(currentItems, itemId);
    this.updateSidebarItems(updatedItems);
  }

  /**
   * Get sidebar collapsed state
   */
  isSidebarCollapsed(): boolean {
    return this.sidebarCollapsedSubject.value;
  }

  /**
   * Get sidebar collapsed state as observable
   */
  getSidebarCollapsed$(): Observable<boolean> {
    return this.sidebarCollapsed$;
  }

  /**
   * Reset layout to default
   */
  resetLayout(): void {
    const defaultConfig = this.getDefaultLayoutConfig();
    this.layoutConfigSubject.next(defaultConfig);
    this.saveLayoutConfig(defaultConfig);
  }

  /**
   * Get responsive breakpoints
   */
  getBreakpoints(): { [key: string]: number } {
    return {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400
    };
  }

  /**
   * Check if screen size matches breakpoint
   */
  isScreenSize(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'): boolean {
    const breakpoints = this.getBreakpoints();
    const width = window.innerWidth;
    
    switch (size) {
      case 'xs':
        return width >= breakpoints['xs'] && width < breakpoints['sm'];
      case 'sm':
        return width >= breakpoints['sm'] && width < breakpoints['md'];
      case 'md':
        return width >= breakpoints['md'] && width < breakpoints['lg'];
      case 'lg':
        return width >= breakpoints['lg'] && width < breakpoints['xl'];
      case 'xl':
        return width >= breakpoints['xl'] && width < breakpoints['xxl'];
      case 'xxl':
        return width >= breakpoints['xxl'];
      default:
        return false;
    }
  }

  /**
   * Get current screen size
   */
  getCurrentScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' {
    const breakpoints = this.getBreakpoints();
    const width = window.innerWidth;
    
    if (width >= breakpoints['xxl']) return 'xxl';
    if (width >= breakpoints['xl']) return 'xl';
    if (width >= breakpoints['lg']) return 'lg';
    if (width >= breakpoints['md']) return 'md';
    if (width >= breakpoints['sm']) return 'sm';
    return 'xs';
  }

  /**
   * Initialize layout from storage
   */
  private initializeLayout(): void {
    const savedConfig = this.storageService.getItemAsObject<LayoutConfig>(this.STORAGE_KEY);
    
    if (savedConfig) {
      this.layoutConfigSubject.next(savedConfig);
      this.sidebarCollapsedSubject.next(savedConfig.sidebar.collapsed);
    } else {
      const defaultConfig = this.getDefaultLayoutConfig();
      this.layoutConfigSubject.next(defaultConfig);
      this.sidebarCollapsedSubject.next(defaultConfig.sidebar.collapsed);
    }
  }

  /**
   * Get default layout configuration
   */
  private getDefaultLayoutConfig(): LayoutConfig {
    return {
      sidebar: {
        collapsed: false,
        position: 'left',
        width: 280,
        collapsedWidth: 64,
        overlay: false,
        persistent: true
      },
      header: {
        height: 64,
        fixed: true,
        showBreadcrumb: true,
        showUserMenu: true,
        showNotifications: true,
        showSearch: true
      },
      footer: {
        height: 48,
        show: true,
        fixed: false
      },
      content: {
        padding: 24,
        maxWidth: 1200,
        fluid: false
      },
      theme: {
        compact: false,
        boxed: false,
        dark: false
      }
    };
  }

  /**
   * Get default sidebar items
   */
  private getDefaultSidebarItems(): SidebarItem[] {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'pi pi-home',
        route: '/dashboard',
        visible: true
      },
      {
        id: 'products',
        label: 'Produtos',
        icon: 'pi pi-box',
        route: '/products',
        visible: true,
        permission: 'canManageProducts'
      },
      {
        id: 'categories',
        label: 'Categorias',
        icon: 'pi pi-tags',
        route: '/categories',
        visible: true,
        permission: 'canManageCategories'
      },
      {
        id: 'suppliers',
        label: 'Fornecedores',
        icon: 'pi pi-building',
        route: '/suppliers',
        visible: true,
        permission: 'canManageSuppliers'
      },
      {
        id: 'customers',
        label: 'Clientes',
        icon: 'pi pi-users',
        route: '/customers',
        visible: true,
        permission: 'canManageCustomers'
      },
      {
        id: 'transactions',
        label: 'Transações',
        icon: 'pi pi-shopping-cart',
        route: '/transactions',
        visible: true,
        permission: 'canManageInventory'
      },
      {
        id: 'reports',
        label: 'Relatórios',
        icon: 'pi pi-chart-bar',
        route: '/reports',
        visible: true,
        permission: 'canViewReports'
      },
      {
        id: 'settings',
        label: 'Configurações',
        icon: 'pi pi-cog',
        route: '/settings',
        visible: true,
        role: ['ADMIN', 'SUPER_ADMIN']
      }
    ];
  }

  /**
   * Save layout configuration to storage
   */
  private saveLayoutConfig(config: LayoutConfig): void {
    this.storageService.setItem(this.STORAGE_KEY, config);
  }

  /**
   * Add item to parent in sidebar items
   */
  private addItemToParent(items: SidebarItem[], parentId: string, newItem: SidebarItem): SidebarItem[] {
    return items.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newItem]
        };
      }
      if (item.children) {
        return {
          ...item,
          children: this.addItemToParent(item.children, parentId, newItem)
        };
      }
      return item;
    });
  }

  /**
   * Remove item from sidebar items
   */
  private removeItemFromItems(items: SidebarItem[], itemId: string): SidebarItem[] {
    return items
      .filter(item => item.id !== itemId)
      .map(item => {
        if (item.children) {
          return {
            ...item,
            children: this.removeItemFromItems(item.children, itemId)
          };
        }
        return item;
      });
  }

  /**
   * Update item in sidebar items
   */
  private updateItemInItems(items: SidebarItem[], itemId: string, updates: Partial<SidebarItem>): SidebarItem[] {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      if (item.children) {
        return {
          ...item,
          children: this.updateItemInItems(item.children, itemId, updates)
        };
      }
      return item;
    });
  }

  /**
   * Toggle item expansion in sidebar items
   */
  private toggleItemExpansion(items: SidebarItem[], itemId: string): SidebarItem[] {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, expanded: !item.expanded };
      }
      if (item.children) {
        return {
          ...item,
          children: this.toggleItemExpansion(item.children, itemId)
        };
      }
      return item;
    });
  }
}
