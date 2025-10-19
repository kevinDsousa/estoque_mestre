import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

export interface MenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  items?: MenuItem[];
  badge?: string;
  badgeClass?: string;
  visible?: boolean;
  command?: () => void;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  company: string;
}

export interface EstoqueLayoutInputs {
  menuItems: MenuItem[];
  userProfile?: UserProfile;
  sidebarVisible: boolean;
  notificationCount: number;
}

export interface EstoqueLayoutOutputs {
  onMenuToggle: EventEmitter<boolean>;
  onLogout: EventEmitter<void>;
  onNotificationsClick: EventEmitter<void>;
  onUserMenuToggle: EventEmitter<void>;
}

/**
 * Layout principal do sistema Estoque Mestre
 * 
 * Componente que fornece a estrutura base com sidebar, header e área de conteúdo
 * 
 * @example
 * ```html
 * <estoque-layout 
 *   [menuItems]="menuItems"
 *   [userProfile]="userProfile"
 *   [sidebarVisible]="true"
 *   (onMenuToggle)="onMenuToggle($event)"
 *   (onLogout)="onLogout()">
 *   <div class="content">
 *     <!-- Conteúdo da página -->
 *   </div>
 * </estoque-layout>
 * ```
 */
@Component({
  selector: 'estoque-layout',
  standalone: true,
  imports: [
    CommonModule,
    SidebarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    BadgeModule,
    TooltipModule
  ],
  templateUrl: './estoque-layout.component.html',
  styleUrls: ['./estoque-layout.component.scss']
})
export class EstoqueLayoutComponent implements EstoqueLayoutInputs, EstoqueLayoutOutputs {
  @Input() menuItems: MenuItem[] = [];
  @Input() userProfile?: UserProfile;
  @Input() sidebarVisible: boolean = true;
  @Input() notificationCount: number = 0;

  @Output() onMenuToggle = new EventEmitter<boolean>();
  @Output() onLogout = new EventEmitter<void>();
  @Output() onNotificationsClick = new EventEmitter<void>();
  @Output() onUserMenuToggle = new EventEmitter<void>();

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
    this.onMenuToggle.emit(this.sidebarVisible);
  }

  toggleUserMenu(): void {
    this.onUserMenuToggle.emit();
  }

  onNotificationsClickHandler(): void {
    this.onNotificationsClick.emit();
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}