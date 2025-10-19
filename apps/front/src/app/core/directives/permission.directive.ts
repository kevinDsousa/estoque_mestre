import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appPermission]'
})
export class PermissionDirective implements OnInit, OnDestroy {
  @Input() appPermission: string | string[] = '';
  @Input() appPermissionRequireAll = false;

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
    const hasPermission = this.checkPermission(authState);

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermission(authState: any): boolean {
    if (!authState.isAuthenticated || !authState.user) {
      return false;
    }

    const permissions = Array.isArray(this.appPermission) 
      ? this.appPermission 
      : [this.appPermission];

    const userPermissions = authState.user.permissions;

    if (this.appPermissionRequireAll) {
      return permissions.every(permission => userPermissions[permission] === true);
    } else {
      return permissions.some(permission => userPermissions[permission] === true);
    }
  }
}
