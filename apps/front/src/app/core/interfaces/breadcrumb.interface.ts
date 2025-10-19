/**
 * Breadcrumb Interfaces
 */

export interface BreadcrumbItem {
  label: string;
  route?: string;
  url?: string;
  icon?: string;
  fragment?: string;
  queryParams?: { [key: string]: any };
  disabled?: boolean;
  active?: boolean;
}

export interface BreadcrumbConfig {
  show: boolean;
  separator: string;
  maxItems: number;
  showHome: boolean;
  homeLabel: string;
  homeIcon: string;
  homeRoute: string;
}
