/**
 * Integration entity - Sistema de integrações externas
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';

export enum IntegrationType {
  ERP = 'ERP',
  MARKETPLACE = 'MARKETPLACE',
  SHIPPING = 'SHIPPING',
  BANKING = 'BANKING',
  ACCOUNTING = 'ACCOUNTING'
}

export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  SYNCING = 'SYNCING'
}

export interface IIntegrationConfig {
  baseUrl: string;
  apiVersion?: string;
  timeout?: number;
  retryAttempts?: number;
  customHeaders?: Record<string, string>;
}

export interface IIntegrationCredentials {
  apiKey?: string;
  username?: string;
  password?: string;
  token?: string;
  clientId?: string;
  clientSecret?: string;
  [key: string]: any;
}

export class Integration implements IBaseEntityWithCompany {
  id!: string;
  name!: string;
  type!: IntegrationType;
  status!: IntegrationStatus;
  companyId!: string;
  
  // Configuration
  config!: IIntegrationConfig;
  credentials!: IIntegrationCredentials;
  webhookUrl?: string;
  
  // Sync settings
  syncFrequency!: string; // REAL_TIME, HOURLY, DAILY
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  
  // Error handling
  errorCount!: number;
  lastErrorAt?: Date;
  lastErrorMessage?: string;
  
  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<Integration>) {
    Object.assign(this, data);
  }

  // Helper methods
  isActive(): boolean {
    return this.status === IntegrationStatus.ACTIVE;
  }

  isInError(): boolean {
    return this.status === IntegrationStatus.ERROR;
  }

  isSyncing(): boolean {
    return this.status === IntegrationStatus.SYNCING;
  }

  needsSync(): boolean {
    if (!this.nextSyncAt) return true;
    return new Date() >= this.nextSyncAt;
  }

  calculateNextSync(): Date {
    const now = new Date();
    const frequency = this.syncFrequency;
    
    switch (frequency) {
      case 'REAL_TIME':
        return now;
      case 'HOURLY':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'DAILY':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 60 * 60 * 1000); // Default to hourly
    }
  }

  markAsSyncing(): void {
    this.status = IntegrationStatus.SYNCING;
    this.lastSyncAt = new Date();
    this.nextSyncAt = this.calculateNextSync();
    this.updatedAt = new Date();
  }

  markAsActive(): void {
    this.status = IntegrationStatus.ACTIVE;
    this.errorCount = 0;
    this.lastErrorMessage = undefined;
    this.updatedAt = new Date();
  }

  markAsError(errorMessage: string): void {
    this.status = IntegrationStatus.ERROR;
    this.errorCount += 1;
    this.lastErrorAt = new Date();
    this.lastErrorMessage = errorMessage;
    this.updatedAt = new Date();
  }

  markAsInactive(): void {
    this.status = IntegrationStatus.INACTIVE;
    this.updatedAt = new Date();
  }

  getHealthScore(): number {
    if (this.errorCount === 0) return 100;
    if (this.errorCount <= 3) return 75;
    if (this.errorCount <= 10) return 50;
    return 25;
  }

  isHealthy(): boolean {
    return this.getHealthScore() >= 75;
  }

  resetErrorCount(): void {
    this.errorCount = 0;
    this.lastErrorAt = undefined;
    this.lastErrorMessage = undefined;
    this.updatedAt = new Date();
  }
}
