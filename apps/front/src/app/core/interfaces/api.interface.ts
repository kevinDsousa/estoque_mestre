/**
 * API Interfaces
 */

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path?: string;
  details?: any;
}

export interface RequestOptions {
  headers?: { [key: string]: string };
  params?: { [key: string]: any };
  timeout?: number;
  retries?: number;
}

export interface UploadOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}
