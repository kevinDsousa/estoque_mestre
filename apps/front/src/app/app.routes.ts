import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default route
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { breadcrumb: { label: 'Dashboard', icon: 'pi pi-home' } }
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    data: { breadcrumb: { label: 'Login', icon: 'pi pi-sign-in' } }
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    data: { breadcrumb: { label: 'Registro', icon: 'pi pi-user-plus' } }
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    data: { breadcrumb: { label: 'Perfil', icon: 'pi pi-user' } }
  },
  {
    path: 'produtos',
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
    data: { breadcrumb: { label: 'Produtos', icon: 'pi pi-box' } }
  },
  {
    path: 'categorias',
    loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent),
    data: { breadcrumb: { label: 'Categorias', icon: 'pi pi-tags' } }
  },
  {
    path: 'fornecedores',
    loadComponent: () => import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent),
    data: { breadcrumb: { label: 'Fornecedores', icon: 'pi pi-building' } }
  },
  {
    path: 'clientes',
    loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent),
    data: { breadcrumb: { label: 'Clientes', icon: 'pi pi-users' } }
  },
  {
    path: 'transacoes',
    loadComponent: () => import('./features/transactions/transactions.component').then(m => m.TransactionsComponent),
    data: { breadcrumb: { label: 'Transações', icon: 'pi pi-credit-card' } }
  },
  {
    path: 'relatorios',
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
    data: { breadcrumb: { label: 'Relatórios', icon: 'pi pi-chart-bar' } }
  },
  {
    path: 'configuracoes',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    data: { breadcrumb: { label: 'Configurações', icon: 'pi pi-cog' } }
  },
  {
    path: 'assinatura',
    loadComponent: () => import('./features/subscription/subscription.component').then(m => m.SubscriptionComponent),
    data: { breadcrumb: { label: 'Minha Assinatura', icon: 'pi pi-credit-card' } }
  },
  {
    path: 'not-found',
    loadComponent: () => import('./features/errors/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: { breadcrumb: { label: 'Não Encontrado', icon: 'pi pi-exclamation-triangle' } }
  },
  {
    path: '**',
    redirectTo: '/not-found'
  }
];
