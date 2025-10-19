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
    path: 'not-found',
    loadComponent: () => import('./features/errors/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: { breadcrumb: { label: 'Não Encontrado', icon: 'pi pi-exclamation-triangle' } }
  },
  {
    path: '**',
    redirectTo: '/not-found'
  }
];
