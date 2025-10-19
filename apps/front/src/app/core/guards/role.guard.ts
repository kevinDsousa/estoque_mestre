import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface RoleGuardData {
  roles: string[];
  requireAll?: boolean; // If true, user must have ALL roles; if false, user needs ANY role
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const data = route.data as RoleGuardData;
    
    if (!data?.roles || data.roles.length === 0) {
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

        const userRole = authState.user.role;
        const hasAccess = data.requireAll 
          ? data.roles.every(role => userRole === role)
          : data.roles.some(role => userRole === role);

        if (!hasAccess) {
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
}
