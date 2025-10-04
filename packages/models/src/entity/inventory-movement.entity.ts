/**
 * Inventory Movement entity
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { TransactionType } from '../interfaces/transaction.interface';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER'
}

export enum MovementReason {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  EXPIRATION = 'EXPIRATION',
  THEFT = 'THEFT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  PRODUCTION = 'PRODUCTION',
  CONSUMPTION = 'CONSUMPTION'
}

export class InventoryMovement implements IBaseEntityWithCompany {
  id!: string;
  productId!: string;
  companyId!: string;
  type!: MovementType;
  reason!: MovementReason;
  quantity!: number;
  previousStock!: number;
  newStock!: number;
  unitCost?: number;
  totalCost?: number;
  reference?: string; // transaction ID or other reference
  notes?: string;
  userId!: string; // who made the movement
  movementDate!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  // Relations
  product?: any; // Will be typed when Product entity is imported
  user?: any; // Will be typed when User entity is imported

  constructor(data: Partial<InventoryMovement>) {
    Object.assign(this, data);
  }

  // Helper methods
  isInbound(): boolean {
    return this.type === MovementType.IN;
  }

  isOutbound(): boolean {
    return this.type === MovementType.OUT;
  }

  isAdjustment(): boolean {
    return this.type === MovementType.ADJUSTMENT;
  }

  isTransfer(): boolean {
    return this.type === MovementType.TRANSFER;
  }

  getStockChange(): number {
    return this.newStock - this.previousStock;
  }

  getMovementDescription(): string {
    const direction = this.isInbound() ? 'Entrada' : this.isOutbound() ? 'Saída' : 'Ajuste';
    return `${direction} - ${this.reason} (${this.quantity} unidades)`;
  }
}
