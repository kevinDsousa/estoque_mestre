import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ThemeToggleComponent, BreadcrumbComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  showBreadcrumb = true;
  showSearch = true;
  user: any = null;
  userMenuOpen = false;
  notificationCount = 0;
  searchQuery = '';

  private destroy$ = new Subject<void>();

  constructor(
    private layoutService: LayoutService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.layoutService.getLayoutConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.isCollapsed = config.sidebar.collapsed;
        this.showBreadcrumb = config.header.showBreadcrumb;
        this.showSearch = config.header.showSearch;
      });

    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.user = authState.user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  toggleNotifications(): void {
    // TODO: Implement notifications
    console.log('Toggle notifications');
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // TODO: Implement search
      console.log('Search:', this.searchQuery);
    }
  }

  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
  }
}
