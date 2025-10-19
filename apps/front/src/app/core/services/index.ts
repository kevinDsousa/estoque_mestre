/**
 * Estoque Mestre - Core Services
 * 
 * This file exports all core services for the frontend application.
 */

// Core Services
export { ApiService } from './api.service';
export { AuthService } from './auth.service';
export { StorageService } from './storage.service';
export { NotificationService } from './notification.service';
export { DialogService } from './dialog.service';

// Business Services
export { ProductService } from './product.service';
export { CompanyService } from './company.service';
export { UserService } from './user.service';
export { CategoryService } from './category.service';
export { SupplierService } from './supplier.service';
export { CustomerService } from './customer.service';

// Advanced Services
export { TransactionService } from './transaction.service';
export { ImageService } from './image.service';
export { PaymentService } from './payment.service';

// Utility Services
export { ValidationService } from './validation.service';
export { ReportsService } from './reports.service';

// Theme and Settings Services
export { ThemeService } from './theme.service';
export { SettingsService } from './settings.service';
export { LanguageService } from './language.service';
export { LayoutService } from './layout.service';
export { BreadcrumbService } from './breadcrumb.service';

// Types and Interfaces
export type { ApiResponse, PaginatedResponse, ApiError } from './api.service';
export type { AuthUser, LoginResponse, AuthState } from './auth.service';
export type { Notification, NotificationOptions } from './notification.service';
export type { ProductFilters, ProductStats } from './product.service';
export type { CompanyFilters, CompanyStats } from './company.service';
export type { UserFilters, UserStats } from './user.service';
export type { CategoryFilters, CategoryTree } from './category.service';
export type { SupplierFilters, SupplierStats } from './supplier.service';
export type { CustomerFilters, CustomerStats } from './customer.service';
export type { TransactionFilters, TransactionStats, TransactionItem } from './transaction.service';
export type { ImageFilters, ImageUploadResult, ImageVariant } from './image.service';
export type { PaymentFilters, PaymentStats, PaymentMethod, PaymentIntent } from './payment.service';
export type { ValidationRule, ValidationResult } from './validation.service';
export type { ReportFilters, ReportData, DashboardData, AnalyticsData } from './reports.service';
// Re-export interfaces from the interfaces folder
export * from '../interfaces';
