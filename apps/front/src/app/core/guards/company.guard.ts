import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CompanyService } from '../services/company.service';

export interface CompanyGuardData {
  requireActive?: boolean; // If true, company must be active
  requireApproved?: boolean; // If true, company must be approved
  requireSubscription?: boolean; // If true, company must have active subscription
}

@Injectable({
  providedIn: 'root'
})
export class CompanyGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const data = route.data as CompanyGuardData;
    
    return this.authService.authState$.pipe(
      take(1),
      switchMap(authState => {
        if (!authState.isAuthenticated || !authState.user?.companyId) {
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return new Observable(observer => observer.next(false));
        }

        return this.companyService.getCompany(authState.user.companyId).pipe(
          map(company => {
            if (!company) {
              this.router.navigate(['/company-not-found']);
              return false;
            }

            // Check if company is active
            if (data.requireActive && company.status !== 'ACTIVE') {
              this.router.navigate(['/company-inactive']);
              return false;
            }

            // Check if company is approved
            if (data.requireApproved && company.status !== 'ACTIVE') {
              this.router.navigate(['/company-pending-approval']);
              return false;
            }

            // Check if company has active subscription
            if (data.requireSubscription && !company.subscription?.isActive) {
              this.router.navigate(['/subscription-required']);
              return false;
            }

            return true;
          })
        );
      })
    );
  }
}
