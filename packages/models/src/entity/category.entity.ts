/**
 * Category entity
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { CategoryStatus, ICategoryHierarchy, CategorySettings, CategorySEO } from '../interfaces/category.interface';

export class Category implements IBaseEntityWithCompany {
  id!: string;
  name!: string;
  description?: string;
  slug!: string;
  status!: CategoryStatus;
  companyId!: string;
  parentId?: string;
  hierarchy!: ICategoryHierarchy;
  settings!: CategorySettings;
  seo!: CategorySEO;
  image?: string;
  icon?: string;
  sortOrder!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // Relations
  parent?: Category;
  children?: Category[];
  products?: any[]; // Will be typed when Product entity is created

  constructor(data: Partial<Category>) {
    Object.assign(this, data);
  }

  // Helper methods
  isActive(): boolean {
    return this.status === CategoryStatus.ACTIVE;
  }

  isRoot(): boolean {
    return !this.parentId;
  }

  hasChildren(): boolean {
    return !!(this.children && this.children.length > 0);
  }

  getFullPath(): string {
    return this.hierarchy.fullPath;
  }

  getLevel(): number {
    return this.hierarchy.level;
  }

  canHaveSubcategories(): boolean {
    return this.settings.allowSubcategories;
  }
}
