/**
 * Payment entity - Pagamentos e transações
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { 
  PaymentStatus, 
  PaymentMethod,
  PaymentType,
  IPaymentDetails,
  IPaymentFailure
} from '../interfaces/payment.interface';

export class Payment implements IBaseEntityWithCompany {
  id!: string;
  companyId!: string;
  subscriptionId!: string;
  
  // Stripe integration
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeInvoiceId?: string;
  
  // Payment information
  amount!: number; // Amount in cents
  currency: string = 'BRL';
  status!: PaymentStatus;
  method!: PaymentMethod;
  type!: PaymentType;
  
  // Payment details
  details!: IPaymentDetails;
  
  // Billing period
  billingPeriodStart!: Date;
  billingPeriodEnd!: Date;
  
  // Payment dates
  attemptedAt?: Date;
  paidAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  
  // Failure information
  failure?: IPaymentFailure;
  retryCount: number = 0;
  maxRetries: number = 3;
  
  // Refund information
  refundAmount?: number;
  refundReason?: string;
  refundedBy?: string; // User ID who processed the refund
  
  // Webhook information
  webhookReceived: boolean = false;
  webhookProcessedAt?: Date;
  webhookSignature?: string;
  
  // Additional information
  description?: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<Payment>) {
    Object.assign(this, data);
  }

  // Status checks
  isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  isProcessing(): boolean {
    return this.status === PaymentStatus.PROCESSING;
  }

  isSucceeded(): boolean {
    return this.status === PaymentStatus.SUCCEEDED;
  }

  isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  isCanceled(): boolean {
    return this.status === PaymentStatus.CANCELED;
  }

  isRefunded(): boolean {
    return this.status === PaymentStatus.REFUNDED;
  }

  isPartiallyRefunded(): boolean {
    return this.status === PaymentStatus.PARTIALLY_REFUNDED;
  }

  // Payment method checks
  isCardPayment(): boolean {
    return this.method === PaymentMethod.CARD;
  }

  isBankTransfer(): boolean {
    return this.method === PaymentMethod.BANK_TRANSFER;
  }

  isPix(): boolean {
    return this.method === PaymentMethod.PIX;
  }

  // Type checks
  isSubscriptionPayment(): boolean {
    return this.type === PaymentType.SUBSCRIPTION;
  }

  isOneTimePayment(): boolean {
    return this.type === PaymentType.ONE_TIME;
  }

  isRefundPayment(): boolean {
    return this.type === PaymentType.REFUND;
  }

  // Amount calculations
  getFormattedAmount(): string {
    const amount = this.amount / 100; // Convert from cents
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.currency
    }).format(amount);
  }

  getRefundedAmount(): number {
    return this.refundAmount || 0;
  }

  getNetAmount(): number {
    return this.amount - this.getRefundedAmount();
  }

  getFormattedNetAmount(): string {
    const amount = this.getNetAmount() / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.currency
    }).format(amount);
  }

  // Failure handling
  hasFailed(): boolean {
    return this.isFailed() && !!this.failure;
  }

  canRetry(): boolean {
    return this.isFailed() && this.retryCount < this.maxRetries;
  }

  getFailureReason(): string {
    return this.failure?.reason || 'Unknown error';
  }

  getFailureCode(): string {
    return this.failure?.code || 'unknown';
  }

  // Refund handling
  canBeRefunded(): boolean {
    return this.isSucceeded() && !this.isRefunded() && !this.isPartiallyRefunded();
  }

  canBePartiallyRefunded(): boolean {
    return this.isSucceeded() && this.getRefundedAmount() < this.amount;
  }

  getRefundableAmount(): number {
    return this.amount - this.getRefundedAmount();
  }

  // Billing period
  isCurrentPeriod(): boolean {
    const now = new Date();
    return now >= this.billingPeriodStart && now <= this.billingPeriodEnd;
  }

  isOverdue(): boolean {
    return new Date() > this.billingPeriodEnd && !this.isSucceeded();
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.billingPeriodEnd.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Webhook handling
  isWebhookProcessed(): boolean {
    return this.webhookReceived && !!this.webhookProcessedAt;
  }

  markWebhookProcessed(signature?: string): void {
    this.webhookReceived = true;
    this.webhookProcessedAt = new Date();
    if (signature) {
      this.webhookSignature = signature;
    }
  }

  // Status colors for UI
  getStatusColor(): string {
    switch (this.status) {
      case PaymentStatus.PENDING: return 'yellow';
      case PaymentStatus.PROCESSING: return 'blue';
      case PaymentStatus.SUCCEEDED: return 'green';
      case PaymentStatus.FAILED: return 'red';
      case PaymentStatus.CANCELED: return 'gray';
      case PaymentStatus.REFUNDED: return 'orange';
      case PaymentStatus.PARTIALLY_REFUNDED: return 'orange';
      default: return 'gray';
    }
  }

  getStatusText(): string {
    switch (this.status) {
      case PaymentStatus.PENDING: return 'Pendente';
      case PaymentStatus.PROCESSING: return 'Processando';
      case PaymentStatus.SUCCEEDED: return 'Pago';
      case PaymentStatus.FAILED: return 'Falhou';
      case PaymentStatus.CANCELED: return 'Cancelado';
      case PaymentStatus.REFUNDED: return 'Reembolsado';
      case PaymentStatus.PARTIALLY_REFUNDED: return 'Parcialmente Reembolsado';
      default: return 'Desconhecido';
    }
  }

  // Business rules
  shouldBlockAccess(): boolean {
    // Bloqueia acesso se pagamento estiver atrasado há mais de 11 dias
    return this.isOverdue() && this.getDaysOverdue() >= 11;
  }

  shouldShowPaymentWarning(): boolean {
    // Mostra aviso se pagamento estiver atrasado há mais de 10 dias
    return this.isOverdue() && this.getDaysOverdue() >= 10;
  }

  // Validation
  isValid(): boolean {
    return !!(
      this.companyId &&
      this.subscriptionId &&
      this.amount > 0 &&
      this.status &&
      this.method &&
      this.type
    );
  }

  // Clone for retry
  createRetryPayment(): Payment {
    return new Payment({
      ...this,
      id: `${this.id}-retry-${Date.now()}`,
      status: PaymentStatus.PENDING,
      retryCount: this.retryCount + 1,
      attemptedAt: undefined,
      paidAt: undefined,
      failedAt: undefined,
      failure: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Create refund payment
  createRefundPayment(amount: number, reason: string, refundedBy: string): Payment {
    return new Payment({
      id: `refund-${this.id}-${Date.now()}`,
      companyId: this.companyId,
      subscriptionId: this.subscriptionId,
      amount: -amount, // Negative amount for refund
      currency: this.currency,
      status: PaymentStatus.PROCESSING,
      method: this.method,
      type: PaymentType.REFUND,
      details: {
        ...this.details,
        refundOf: this.id
      },
      billingPeriodStart: this.billingPeriodStart,
      billingPeriodEnd: this.billingPeriodEnd,
      refundReason: reason,
      refundedBy,
      description: `Reembolso de ${this.getFormattedAmount()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
