import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService, SidebarItem } from '../../services/layout.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isOverlay = false;
  sidebarItems: SidebarItem[] = [];
  user: any = null;

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
        this.isOverlay = config.sidebar.overlay;
      });

    this.layoutService.getSidebarItems$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.sidebarItems = items;
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

  get visibleItems(): SidebarItem[] {
    return this.sidebarItems.filter(item => item.visible !== false);
  }

  toggleSubmenu(item: SidebarItem): void {
    this.layoutService.toggleSidebarItemExpansion(item.id);
  }

  logout(): void {
    this.authService.logout();
  }
}
