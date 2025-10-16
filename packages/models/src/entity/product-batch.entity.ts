/**
 * Product Batch entity - Sistema de controle de lotes
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { QualityStatus } from './quality-inspection.entity';

export enum BatchStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  RECALLED = 'RECALLED',
  QUARANTINED = 'QUARANTINED'
}

export class ProductBatch implements IBaseEntityWithCompany {
  id!: string;
  productId!: string;
  batchNumber!: string;
  manufacturingDate!: Date;
  expiryDate?: Date;
  supplierId?: string;
  companyId!: string;
  
  // Batch details
  quantity!: number;
  remainingQuantity!: number;
  status!: BatchStatus;
  qualityStatus!: QualityStatus;
  
  // Location tracking
  location?: string;
  warehouse?: string;
  
  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<ProductBatch>) {
    Object.assign(this, data);
  }

  // Helper methods
  isActive(): boolean {
    return this.status === BatchStatus.ACTIVE;
  }

  isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  isRecalled(): boolean {
    return this.status === BatchStatus.RECALLED;
  }

  isQuarantined(): boolean {
    return this.status === BatchStatus.QUARANTINED;
  }

  getDaysUntilExpiry(): number {
    if (!this.expiryDate) return Infinity;
    const today = new Date();
    const diffTime = this.expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isExpiringSoon(days: number = 30): boolean {
    return this.getDaysUntilExpiry() <= days && this.getDaysUntilExpiry() > 0;
  }

  getUsagePercentage(): number {
    if (this.quantity === 0) return 0;
    return ((this.quantity - this.remainingQuantity) / this.quantity) * 100;
  }

  consume(amount: number): boolean {
    if (this.remainingQuantity < amount) {
      return false;
    }
    this.remainingQuantity -= amount;
    this.updatedAt = new Date();
    return true;
  }

  addStock(amount: number): void {
    this.remainingQuantity += amount;
    this.updatedAt = new Date();
  }

  recall(reason: string): void {
    this.status = BatchStatus.RECALLED;
    this.updatedAt = new Date();
  }

  quarantine(reason: string): void {
    this.status = BatchStatus.QUARANTINED;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.status = BatchStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  expire(): void {
    this.status = BatchStatus.EXPIRED;
    this.updatedAt = new Date();
  }
}
