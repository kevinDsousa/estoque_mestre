/**
 * Payment Order entity
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { 
  PaymentOrderStatus, 
  PaymentOrderType, 
  PaymentMethod,
  IPaymentOrderItem,
  IPaymentOrderApproval,
  IPaymentOrderExecution,
  PaymentOrderSummary
} from '../interfaces/payment-order.interface';

export class PaymentOrder implements IBaseEntityWithCompany {
  id!: string;
  number!: string; // Sequential number
  type!: PaymentOrderType;
  status!: PaymentOrderStatus;
  companyId!: string;
  
  // Basic information
  title!: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
  
  // Related entities
  supplierId?: string;
  customerId?: string;
  userId!: string; // who created the order
  
  // Items and amounts
  items!: IPaymentOrderItem[];
  summary!: PaymentOrderSummary;
  
  // Approval workflow
  approvals!: IPaymentOrderApproval[];
  requiresApproval: boolean = true;
  approvalLimit?: number; // minimum amount requiring approval
  
  // Execution
  execution?: IPaymentOrderExecution;
  
  // Dates
  requestedAt!: Date;
  approvedAt?: Date;
  executedAt?: Date;
  dueDate?: Date;
  
  // Additional information
  notes?: string;
  tags?: string[];
  
  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;

  // Relations
  supplier?: any; // Will be typed when Supplier entity is imported
  customer?: any; // Will be typed when Customer entity is imported
  user?: any; // Will be typed when User entity is imported

  constructor(data: Partial<PaymentOrder>) {
    Object.assign(this, data);
  }

  // Helper methods
  isPending(): boolean {
    return this.status === PaymentOrderStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === PaymentOrderStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === PaymentOrderStatus.REJECTED;
  }

  isProcessing(): boolean {
    return this.status === PaymentOrderStatus.PROCESSING;
  }

  isCompleted(): boolean {
    return this.status === PaymentOrderStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this.status === PaymentOrderStatus.CANCELLED;
  }

  isOverdue(): boolean {
    if (!this.dueDate || this.isCompleted()) return false;
    return new Date() > this.dueDate;
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.dueDate!.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getTotalAmount(): number {
    return this.items.reduce((total, item) => total + item.amount, 0);
  }

  getApprovedAmount(): number {
    return this.summary.approvedAmount;
  }

  getPendingAmount(): number {
    return this.summary.pendingAmount;
  }

  getExecutedAmount(): number {
    return this.summary.executedAmount;
  }

  getRemainingAmount(): number {
    return this.getTotalAmount() - this.getExecutedAmount();
  }

  hasApprovals(): boolean {
    return this.approvals && this.approvals.length > 0;
  }

  getLastApproval(): IPaymentOrderApproval | undefined {
    if (!this.hasApprovals()) return undefined;
    return this.approvals[this.approvals.length - 1];
  }

  isFullyApproved(): boolean {
    return this.status === PaymentOrderStatus.APPROVED;
  }

  canBeExecuted(): boolean {
    return this.isApproved() && !this.isCompleted() && !this.isCancelled();
  }

  canBeApproved(): boolean {
    return this.isPending() && this.requiresApproval;
  }

  canBeRejected(): boolean {
    return this.isPending() && this.requiresApproval;
  }

  canBeCancelled(): boolean {
    return !this.isCompleted() && !this.isCancelled();
  }

  getPriorityColor(): string {
    switch (this.priority) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'yellow';
      case 'HIGH': return 'orange';
      case 'URGENT': return 'red';
      default: return 'gray';
    }
  }

  getStatusColor(): string {
    switch (this.status) {
      case PaymentOrderStatus.PENDING: return 'yellow';
      case PaymentOrderStatus.APPROVED: return 'blue';
      case PaymentOrderStatus.REJECTED: return 'red';
      case PaymentOrderStatus.PROCESSING: return 'purple';
      case PaymentOrderStatus.COMPLETED: return 'green';
      case PaymentOrderStatus.CANCELLED: return 'gray';
      default: return 'gray';
    }
  }
}





