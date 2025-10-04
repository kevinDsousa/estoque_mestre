/**
 * Base interfaces for the Estoque Mestre system
 */

export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBaseEntityWithCompany extends IBaseEntity {
  companyId: string;
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ISearchParams {
  query?: string;
  filters?: Record<string, any>;
}

export interface IAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  changes?: Record<string, any>;
  userId: string;
  createdAt: Date;
}
