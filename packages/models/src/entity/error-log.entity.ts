/**
 * Error Log entity - Sistema de logs de erro
 */

import { IBaseEntity } from '../interfaces/base.interface';
import { 
  ErrorSeverity, 
  ErrorSource, 
  ErrorStatus,
  IErrorContext,
  IErrorStack,
  IErrorMetadata
} from '../interfaces/error-log.interface';

export class ErrorLog implements IBaseEntity {
  id!: string;
  errorId!: string; // ID único gerado pelo frontend
  
  // Informações do erro
  errorType!: string;
  errorMessage!: string;
  errorCode?: string;
  severity!: ErrorSeverity;
  
  // Origem do erro
  source!: ErrorSource;
  component?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  
  // Contexto do usuário
  userId?: string;
  companyId?: string;
  sessionId?: string;
  
  // Informações técnicas
  browserInfo?: Record<string, any>;
  deviceInfo?: Record<string, any>;
  networkInfo?: Record<string, any>;
  
  // Status do processamento
  status!: ErrorStatus;
  processedAt?: Date;
  processedBy?: string;
  
  // Metadados
  metadata?: IErrorMetadata;
  tags?: string[];
  
  // Relacionamentos
  contexts?: IErrorContext[];
  stacks?: IErrorStack[];
  
  // Timestamps
  timestamp!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<ErrorLog>) {
    Object.assign(this, data);
  }

  // Status checks
  isPending(): boolean {
    return this.status === ErrorStatus.PENDING;
  }

  isProcessed(): boolean {
    return this.status === ErrorStatus.PROCESSED;
  }

  isIgnored(): boolean {
    return this.status === ErrorStatus.IGNORED;
  }

  // Severity checks
  isCritical(): boolean {
    return this.severity === ErrorSeverity.CRITICAL;
  }

  isHigh(): boolean {
    return this.severity === ErrorSeverity.HIGH;
  }

  isMedium(): boolean {
    return this.severity === ErrorSeverity.MEDIUM;
  }

  isLow(): boolean {
    return this.severity === ErrorSeverity.LOW;
  }

  // Source checks
  isFromFrontend(): boolean {
    return this.source === ErrorSource.FRONTEND;
  }

  isFromBackend(): boolean {
    return this.source === ErrorSource.BACKEND;
  }

  isFromAPI(): boolean {
    return this.source === ErrorSource.API;
  }

  isFromDatabase(): boolean {
    return this.source === ErrorSource.DATABASE;
  }

  // Processing methods
  markAsProcessed(processedBy: string): void {
    this.status = ErrorStatus.PROCESSED;
    this.processedAt = new Date();
    this.processedBy = processedBy;
  }

  markAsIgnored(processedBy: string): void {
    this.status = ErrorStatus.IGNORED;
    this.processedAt = new Date();
    this.processedBy = processedBy;
  }

  // Utility methods
  getFormattedTimestamp(): string {
    return this.timestamp.toISOString();
  }

  getSeverityColor(): string {
    switch (this.severity) {
      case ErrorSeverity.CRITICAL: return 'red';
      case ErrorSeverity.HIGH: return 'orange';
      case ErrorSeverity.MEDIUM: return 'yellow';
      case ErrorSeverity.LOW: return 'green';
      default: return 'gray';
    }
  }

  getSourceIcon(): string {
    switch (this.source) {
      case ErrorSource.FRONTEND: return '🖥️';
      case ErrorSource.BACKEND: return '⚙️';
      case ErrorSource.API: return '🔌';
      case ErrorSource.DATABASE: return '🗄️';
      default: return '❓';
    }
  }

  // Validation
  isValid(): boolean {
    return !!(
      this.errorId &&
      this.errorType &&
      this.errorMessage &&
      this.severity &&
      this.source &&
      this.timestamp
    );
  }

  // Helper methods for metadata
  getRequestInfo(): any {
    return this.metadata?.requestBody || null;
  }

  getResponseInfo(): any {
    return this.metadata?.responseBody || null;
  }

  getHeaders(): Record<string, any> {
    return this.metadata?.headers || {};
  }

  getStackTrace(): string {
    return this.metadata?.stack || '';
  }

  // Browser and device info helpers
  getBrowserName(): string {
    return this.browserInfo?.name || 'Unknown';
  }

  getBrowserVersion(): string {
    return this.browserInfo?.version || 'Unknown';
  }

  getDeviceType(): string {
    return this.deviceInfo?.type || 'Unknown';
  }

  getOperatingSystem(): string {
    return this.deviceInfo?.os || 'Unknown';
  }

  // Network info helpers
  getConnectionType(): string {
    return this.networkInfo?.connectionType || 'Unknown';
  }

  getNetworkSpeed(): string {
    return this.networkInfo?.speed || 'Unknown';
  }

  // Context helpers
  getCurrentRoute(): string {
    return this.contexts?.[0]?.route || this.url || 'Unknown';
  }

  getCurrentComponent(): string {
    return this.component || this.contexts?.[0]?.componentName || 'Unknown';
  }

  getCurrentAction(): string {
    return this.contexts?.[0]?.action || 'Unknown';
  }

  // Performance helpers
  getLoadTime(): number {
    return this.contexts?.[0]?.loadTime || 0;
  }

  getMemoryUsage(): number {
    return this.contexts?.[0]?.memoryUsage || 0;
  }

  getCpuUsage(): number {
    return this.contexts?.[0]?.cpuUsage || 0;
  }

  // Tag management
  hasTag(tag: string): boolean {
    return this.tags?.includes(tag) || false;
  }

  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = [];
    }
    if (!this.hasTag(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.tags) {
      const index = this.tags.indexOf(tag);
      if (index > -1) {
        this.tags.splice(index, 1);
      }
    }
  }

  // Time-based helpers
  getAgeInMinutes(): number {
    const now = new Date();
    const diffTime = now.getTime() - this.timestamp.getTime();
    return Math.floor(diffTime / (1000 * 60));
  }

  getAgeInHours(): number {
    return Math.floor(this.getAgeInMinutes() / 60);
  }

  getAgeInDays(): number {
    return Math.floor(this.getAgeInHours() / 24);
  }

  isRecent(minutes: number = 60): boolean {
    return this.getAgeInMinutes() <= minutes;
  }

  // Summary methods
  getSummary(): string {
    return `${this.errorType}: ${this.errorMessage}`;
  }

  getDetailedSummary(): string {
    const source = this.getSourceIcon();
    const severity = this.getSeverityColor();
    const time = this.getFormattedTimestamp();
    return `${source} [${severity}] ${this.errorType} at ${time}: ${this.errorMessage}`;
  }
}
