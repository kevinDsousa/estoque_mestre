/**
 * Auto Replenishment entity - Sistema de reabastecimento automático
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';

export class AutoReplenishment implements IBaseEntityWithCompany {
  id!: string;
  productId!: string;
  companyId!: string;
  
  // Replenishment settings
  minStock!: number;
  maxStock!: number;
  reorderPoint!: number;
  leadTime!: number; // days
  supplierId?: string;
  
  // Status
  isActive!: boolean;
  lastCalculation?: Date;
  nextOrderDate?: Date;
  
  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<AutoReplenishment>) {
    Object.assign(this, data);
  }

  // Helper methods
  isEnabled(): boolean {
    return this.isActive;
  }

  enable(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  disable(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  needsReorder(currentStock: number): boolean {
    if (!this.isActive) return false;
    return currentStock <= this.reorderPoint;
  }

  calculateReorderQuantity(currentStock: number): number {
    if (!this.needsReorder(currentStock)) return 0;
    return this.maxStock - currentStock;
  }

  calculateNextOrderDate(): Date {
    const today = new Date();
    return new Date(today.getTime() + this.leadTime * 24 * 60 * 60 * 1000);
  }

  updateCalculation(currentStock: number): void {
    this.lastCalculation = new Date();
    
    if (this.needsReorder(currentStock)) {
      this.nextOrderDate = this.calculateNextOrderDate();
    } else {
      this.nextOrderDate = undefined;
    }
    
    this.updatedAt = new Date();
  }

  getStockStatus(currentStock: number): 'critical' | 'low' | 'normal' | 'high' {
    if (currentStock <= 0) return 'critical';
    if (currentStock <= this.reorderPoint) return 'low';
    if (currentStock >= this.maxStock) return 'high';
    return 'normal';
  }

  getStockPercentage(currentStock: number): number {
    if (this.maxStock === 0) return 0;
    return (currentStock / this.maxStock) * 100;
  }

  getDaysUntilReorder(currentStock: number, dailyConsumption: number): number {
    if (dailyConsumption <= 0) return Infinity;
    const stockUntilReorder = currentStock - this.reorderPoint;
    return Math.ceil(stockUntilReorder / dailyConsumption);
  }

  isOverstocked(currentStock: number): boolean {
    return currentStock > this.maxStock;
  }

  isUnderstocked(currentStock: number): boolean {
    return currentStock < this.minStock;
  }

  adjustSettings(minStock: number, maxStock: number, reorderPoint: number, leadTime: number): void {
    this.minStock = minStock;
    this.maxStock = maxStock;
    this.reorderPoint = reorderPoint;
    this.leadTime = leadTime;
    this.updatedAt = new Date();
  }

  setSupplier(supplierId: string): void {
    this.supplierId = supplierId;
    this.updatedAt = new Date();
  }

  removeSupplier(): void {
    this.supplierId = undefined;
    this.updatedAt = new Date();
  }

  getReorderUrgency(currentStock: number): 'low' | 'medium' | 'high' | 'critical' {
    if (currentStock <= 0) return 'critical';
    if (currentStock <= this.minStock) return 'high';
    if (currentStock <= this.reorderPoint) return 'medium';
    return 'low';
  }

  getRecommendedOrderQuantity(currentStock: number, safetyStock: number = 0): number {
    const baseQuantity = this.calculateReorderQuantity(currentStock);
    return baseQuantity + safetyStock;
  }

  isCalculationDue(): boolean {
    if (!this.lastCalculation) return true;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.lastCalculation < oneDayAgo;
  }

  getLeadTimeInBusinessDays(): number {
    // Assuming 5 business days per week
    return Math.ceil(this.leadTime * 5 / 7);
  }
}
