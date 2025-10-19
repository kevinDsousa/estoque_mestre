import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appRole]'
})
export class RoleDirective implements OnInit, OnDestroy {
  @Input() appRole: string | string[] = '';
  @Input() appRoleRequireAll = false;

  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.updateView(authState);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(authState: any): void {
    const hasRole = this.checkRole(authState);

    if (hasRole && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkRole(authState: any): boolean {
    if (!authState.isAuthenticated || !authState.user) {
      return false;
    }

    const roles = Array.isArray(this.appRole) 
      ? this.appRole 
      : [this.appRole];

    const userRole = authState.user.role;

    if (this.appRoleRequireAll) {
      return roles.every(role => userRole === role);
    } else {
      return roles.some(role => userRole === role);
    }
  }
}
