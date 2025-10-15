/**
 * Category related interfaces
 */

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface ICategoryHierarchy {
  level: number;
  path: string[];
  fullPath: string;
}

export interface CategorySettings {
  allowSubcategories: boolean;
  requireSpecifications: boolean;
  customFields?: {
    name: string;
    type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT';
    required: boolean;
    options?: string[];
  }[];
}

export interface CategorySEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slug: string;
}



