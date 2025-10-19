import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { BreadcrumbItem } from '../interfaces/breadcrumb.interface';

// Re-export interfaces for external use
export { BreadcrumbItem } from '../interfaces/breadcrumb.interface';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.initializeBreadcrumbs();
  }

  /**
   * Get current breadcrumbs
   */
  getCurrentBreadcrumbs(): BreadcrumbItem[] {
    return this.breadcrumbsSubject.value;
  }

  /**
   * Get breadcrumbs as observable
   */
  getBreadcrumbs(): Observable<BreadcrumbItem[]> {
    return this.breadcrumbs$;
  }

  /**
   * Set breadcrumbs manually
   */
  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  /**
   * Add breadcrumb item
   */
  addBreadcrumb(item: BreadcrumbItem): void {
    const currentBreadcrumbs = this.getCurrentBreadcrumbs();
    this.setBreadcrumbs([...currentBreadcrumbs, item]);
  }

  /**
   * Remove last breadcrumb
   */
  removeLastBreadcrumb(): void {
    const currentBreadcrumbs = this.getCurrentBreadcrumbs();
    if (currentBreadcrumbs.length > 0) {
      this.setBreadcrumbs(currentBreadcrumbs.slice(0, -1));
    }
  }

  /**
   * Clear all breadcrumbs
   */
  clearBreadcrumbs(): void {
    this.setBreadcrumbs([]);
  }

  /**
   * Initialize breadcrumbs from router
   */
  private initializeBreadcrumbs(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe(data => {
        const breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
        this.setBreadcrumbs(breadcrumbs);
      });
  }

  /**
   * Build breadcrumbs from route data
   */
  private buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const breadcrumbData = child.snapshot.data['breadcrumb'];
      if (breadcrumbData) {
        const breadcrumb: BreadcrumbItem = {
          label: breadcrumbData.label || 'Unknown',
          url: url,
          icon: breadcrumbData.icon,
          active: child.snapshot.url.length === 0,
          disabled: breadcrumbData.disabled || false,
          queryParams: child.snapshot.queryParams,
          fragment: child.snapshot.fragment || undefined
        };

        // Check if breadcrumb already exists
        const existingBreadcrumb = breadcrumbs.find(b => b.url === url);
        if (!existingBreadcrumb) {
          breadcrumbs.push(breadcrumb);
        }
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  /**
   * Get breadcrumb configuration for common routes
   */
  getBreadcrumbConfig(): { [key: string]: BreadcrumbItem } {
    return {
      '/dashboard': {
        label: 'Dashboard',
        icon: 'pi pi-home'
      },
      '/products': {
        label: 'Produtos',
        icon: 'pi pi-box'
      },
      '/products/create': {
        label: 'Novo Produto',
        icon: 'pi pi-plus'
      },
      '/products/edit': {
        label: 'Editar Produto',
        icon: 'pi pi-pencil'
      },
      '/categories': {
        label: 'Categorias',
        icon: 'pi pi-tags'
      },
      '/categories/create': {
        label: 'Nova Categoria',
        icon: 'pi pi-plus'
      },
      '/categories/edit': {
        label: 'Editar Categoria',
        icon: 'pi pi-pencil'
      },
      '/suppliers': {
        label: 'Fornecedores',
        icon: 'pi pi-building'
      },
      '/suppliers/create': {
        label: 'Novo Fornecedor',
        icon: 'pi pi-plus'
      },
      '/suppliers/edit': {
        label: 'Editar Fornecedor',
        icon: 'pi pi-pencil'
      },
      '/customers': {
        label: 'Clientes',
        icon: 'pi pi-users'
      },
      '/customers/create': {
        label: 'Novo Cliente',
        icon: 'pi pi-plus'
      },
      '/customers/edit': {
        label: 'Editar Cliente',
        icon: 'pi pi-pencil'
      },
      '/transactions': {
        label: 'Transações',
        icon: 'pi pi-shopping-cart'
      },
      '/transactions/create': {
        label: 'Nova Transação',
        icon: 'pi pi-plus'
      },
      '/transactions/edit': {
        label: 'Editar Transação',
        icon: 'pi pi-pencil'
      },
      '/reports': {
        label: 'Relatórios',
        icon: 'pi pi-chart-bar'
      },
      '/settings': {
        label: 'Configurações',
        icon: 'pi pi-cog'
      },
      '/profile': {
        label: 'Perfil',
        icon: 'pi pi-user'
      },
      '/login': {
        label: 'Login',
        icon: 'pi pi-sign-in'
      },
      '/register': {
        label: 'Registro',
        icon: 'pi pi-user-plus'
      }
    };
  }

  /**
   * Generate breadcrumb from route path
   */
  generateBreadcrumbFromPath(path: string): BreadcrumbItem[] {
    const config = this.getBreadcrumbConfig();
    const segments = path.split('/').filter(segment => segment);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      const configItem = config[currentPath];
      if (configItem) {
        breadcrumbs.push({
          ...configItem,
          url: isLast ? undefined : currentPath,
          active: isLast
        });
      } else {
        // Generate label from segment if no config found
        const label = this.generateLabelFromSegment(segment);
        breadcrumbs.push({
          label: label,
          url: isLast ? undefined : currentPath,
          active: isLast
        });
      }
    });

    return breadcrumbs;
  }

  /**
   * Generate label from URL segment
   */
  private generateLabelFromSegment(segment: string): string {
    // Handle common patterns
    if (segment === 'create') return 'Novo';
    if (segment === 'edit') return 'Editar';
    if (segment === 'view') return 'Visualizar';
    if (segment === 'list') return 'Lista';
    
    // Convert kebab-case to Title Case
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get breadcrumb for specific route
   */
  getBreadcrumbForRoute(route: string): BreadcrumbItem | null {
    const config = this.getBreadcrumbConfig();
    return config[route] || null;
  }

  /**
   * Update breadcrumb label
   */
  updateBreadcrumbLabel(index: number, label: string): void {
    const currentBreadcrumbs = this.getCurrentBreadcrumbs();
    if (index >= 0 && index < currentBreadcrumbs.length) {
      const updatedBreadcrumbs = [...currentBreadcrumbs];
      updatedBreadcrumbs[index] = { ...updatedBreadcrumbs[index], label };
      this.setBreadcrumbs(updatedBreadcrumbs);
    }
  }

  /**
   * Update breadcrumb icon
   */
  updateBreadcrumbIcon(index: number, icon: string): void {
    const currentBreadcrumbs = this.getCurrentBreadcrumbs();
    if (index >= 0 && index < currentBreadcrumbs.length) {
      const updatedBreadcrumbs = [...currentBreadcrumbs];
      updatedBreadcrumbs[index] = { ...updatedBreadcrumbs[index], icon };
      this.setBreadcrumbs(updatedBreadcrumbs);
    }
  }

  /**
   * Set breadcrumb as active
   */
  setBreadcrumbActive(index: number): void {
    const currentBreadcrumbs = this.getCurrentBreadcrumbs();
    if (index >= 0 && index < currentBreadcrumbs.length) {
      const updatedBreadcrumbs = currentBreadcrumbs.map((breadcrumb, i) => ({
        ...breadcrumb,
        active: i === index
      }));
      this.setBreadcrumbs(updatedBreadcrumbs);
    }
  }

  /**
   * Set breadcrumb as disabled
   */
  setBreadcrumbDisabled(index: number, disabled: boolean = true): void {
    const currentBreadcrumbs = this.getCurrentBreadcrumbs();
    if (index >= 0 && index < currentBreadcrumbs.length) {
      const updatedBreadcrumbs = [...currentBreadcrumbs];
      updatedBreadcrumbs[index] = { ...updatedBreadcrumbs[index], disabled };
      this.setBreadcrumbs(updatedBreadcrumbs);
    }
  }
}
