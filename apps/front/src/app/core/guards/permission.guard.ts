import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface PermissionGuardData {
  permissions: string[];
  requireAll?: boolean; // If true, user must have ALL permissions; if false, user needs ANY permission
}

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const data = route.data as PermissionGuardData;
    
    if (!data?.permissions || data.permissions.length === 0) {
      return new Observable(observer => observer.next(true));
    }

    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (!authState.isAuthenticated || !authState.user) {
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }

        const userPermissions = authState.user.permissions;
        const hasAccess = data.requireAll 
          ? data.permissions.every(permission => userPermissions[permission] === true)
          : data.permissions.some(permission => userPermissions[permission] === true);

        if (!hasAccess) {
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
}
