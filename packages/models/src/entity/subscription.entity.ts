/**
 * Subscription entity - Sistema de assinaturas
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';
import { 
  SubscriptionStatus, 
  SubscriptionPlan, 
  PaymentStatus,
  ISubscriptionFeatures,
  ISubscriptionBilling
} from '../interfaces/subscription.interface';

export class Subscription implements IBaseEntityWithCompany {
  id!: string;
  companyId!: string;
  
  // Stripe integration
  stripeCustomerId!: string;
  stripeSubscriptionId?: string;
  stripePriceId!: string;
  
  // Plan information
  plan!: SubscriptionPlan;
  planName!: string;
  planDescription?: string;
  
  // Status and billing
  status!: SubscriptionStatus;
  paymentStatus!: PaymentStatus;
  
  // Pricing
  amount!: number; // Valor em centavos (Stripe format)
  currency: string = 'BRL';
  interval: 'month' | 'year' = 'month';
  intervalCount: number = 1;
  
  // Features and limits
  features!: ISubscriptionFeatures;
  
  // Billing information
  billing!: ISubscriptionBilling;
  
  // Trial information
  trialStart?: Date;
  trialEnd?: Date;
  isInTrial: boolean = false;
  
  // Payment dates
  currentPeriodStart!: Date;
  currentPeriodEnd!: Date;
  nextBillingDate?: Date;
  
  // Payment history
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  failedPaymentCount: number = 0;
  lastFailedPaymentDate?: Date;
  
  // Cancellation
  cancelAtPeriodEnd: boolean = false;
  canceledAt?: Date;
  cancellationReason?: string;
  
  // Discounts and promotions
  discountCode?: string;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed';
  discountEndDate?: Date;
  
  // Referral system
  referredBy?: string; // Company ID que fez a indicação
  referralCode?: string;
  referralDiscount?: number;
  
  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<Subscription>) {
    Object.assign(this, data);
  }

  // Status checks
  isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this.status === SubscriptionStatus.INACTIVE;
  }

  isCanceled(): boolean {
    return this.status === SubscriptionStatus.CANCELED;
  }

  isPastDue(): boolean {
    return this.status === SubscriptionStatus.PAST_DUE;
  }

  isUnpaid(): boolean {
    return this.status === SubscriptionStatus.UNPAID;
  }

  isTrialing(): boolean {
    return this.isInTrial && this.trialEnd && new Date() < this.trialEnd;
  }

  // Payment status checks
  isPaymentUpToDate(): boolean {
    return this.paymentStatus === PaymentStatus.PAID;
  }

  isPaymentPending(): boolean {
    return this.paymentStatus === PaymentStatus.PENDING;
  }

  isPaymentFailed(): boolean {
    return this.paymentStatus === PaymentStatus.FAILED;
  }

  isPaymentOverdue(): boolean {
    return this.paymentStatus === PaymentStatus.OVERDUE;
  }

  // Billing calculations
  getDaysUntilNextBilling(): number {
    if (!this.nextBillingDate) return 0;
    const today = new Date();
    const diffTime = this.nextBillingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysOverdue(): number {
    if (!this.isPaymentOverdue()) return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.currentPeriodEnd.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getAmountWithDiscount(): number {
    let amount = this.amount;
    
    if (this.discountAmount && this.discountType) {
      if (this.discountType === 'percentage') {
        amount = amount * (1 - this.discountAmount / 100);
      } else {
        amount = Math.max(0, amount - this.discountAmount);
      }
    }
    
    if (this.referralDiscount) {
      amount = Math.max(0, amount - this.referralDiscount);
    }
    
    return Math.round(amount);
  }

  getFormattedAmount(): string {
    const amount = this.getAmountWithDiscount() / 100; // Convert from cents
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.currency
    }).format(amount);
  }

  // Feature checks
  hasFeature(feature: string): boolean {
    return this.features[feature] === true;
  }

  getFeatureLimit(feature: string): number {
    return this.features[feature] || 0;
  }

  canUseFeature(feature: string, currentUsage: number): boolean {
    if (!this.isActive() && !this.isTrialing()) return false;
    const limit = this.getFeatureLimit(feature);
    return limit === -1 || currentUsage < limit; // -1 means unlimited
  }

  // Cancellation
  canCancel(): boolean {
    return this.isActive() && !this.cancelAtPeriodEnd;
  }

  shouldCancelAtPeriodEnd(): boolean {
    return this.cancelAtPeriodEnd;
  }

  // Trial management
  getTrialDaysRemaining(): number {
    if (!this.isTrialing()) return 0;
    const today = new Date();
    const diffTime = this.trialEnd!.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Status colors for UI
  getStatusColor(): string {
    switch (this.status) {
      case SubscriptionStatus.ACTIVE: return 'green';
      case SubscriptionStatus.INACTIVE: return 'gray';
      case SubscriptionStatus.CANCELED: return 'red';
      case SubscriptionStatus.PAST_DUE: return 'orange';
      case SubscriptionStatus.UNPAID: return 'red';
      default: return 'gray';
    }
  }

  getPaymentStatusColor(): string {
    switch (this.paymentStatus) {
      case PaymentStatus.PAID: return 'green';
      case PaymentStatus.PENDING: return 'yellow';
      case PaymentStatus.FAILED: return 'red';
      case PaymentStatus.OVERDUE: return 'red';
      default: return 'gray';
    }
  }

  // Business rules
  shouldBlockAccess(): boolean {
    // Bloqueia acesso após 11 dias de atraso
    return this.isPaymentOverdue() && this.getDaysOverdue() >= 11;
  }

  shouldShowPaymentWarning(): boolean {
    // Mostra aviso após 10 dias de atraso
    return this.isPaymentOverdue() && this.getDaysOverdue() >= 10;
  }

  canUpgrade(): boolean {
    return this.isActive() && !this.cancelAtPeriodEnd;
  }

  canDowngrade(): boolean {
    return this.isActive() && !this.cancelAtPeriodEnd;
  }
}
