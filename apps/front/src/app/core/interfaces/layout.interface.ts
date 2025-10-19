/**
 * Layout Interfaces
 */

export interface LayoutConfig {
  sidebar: {
    collapsed: boolean;
    position: 'left' | 'right';
    width: number;
    collapsedWidth: number;
    overlay: boolean;
    persistent: boolean;
  };
  header: {
    height: number;
    fixed: boolean;
    showBreadcrumb: boolean;
    showSearch: boolean;
    showUserMenu: boolean;
    showNotifications: boolean;
  };
  footer: {
    height: number;
    show: boolean;
    fixed: boolean;
  };
  content: {
    padding: number;
    maxWidth: number;
    fluid: boolean;
  };
  theme: {
    compact: boolean;
    boxed: boolean;
    dark: boolean;
  };
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  children?: SidebarItem[];
  expanded?: boolean;
  visible?: boolean;
  disabled?: boolean;
  badge?: {
    text: string;
    color?: string;
  };
  permissions?: string[];
  permission?: string;
  roles?: string[];
  role?: string[];
}

export interface LayoutState {
  config: LayoutConfig;
  sidebarItems: SidebarItem[];
  isMobile: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}
