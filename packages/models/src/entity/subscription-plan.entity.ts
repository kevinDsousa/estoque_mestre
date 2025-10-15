/**
 * Subscription Plan entity - Planos de assinatura
 */

import { IBaseEntity } from '../interfaces/base.interface';
import { 
  PlanStatus, 
  PlanType,
  ISubscriptionFeatures,
  IPlanPricing
} from '../interfaces/subscription-plan.interface';

export class SubscriptionPlan implements IBaseEntity {
  id!: string;
  
  // Basic information
  name!: string;
  description?: string;
  slug!: string; // URL-friendly identifier
  
  // Plan details
  type!: PlanType;
  status!: PlanStatus;
  
  // Pricing
  pricing!: IPlanPricing;
  
  // Features and limits
  features!: ISubscriptionFeatures;
  
  // Stripe integration
  stripePriceId?: string;
  stripeProductId?: string;
  
  // Display settings
  isPopular: boolean = false;
  isRecommended: boolean = false;
  displayOrder: number = 0;
  
  // Availability
  isPublic: boolean = true;
  availableFrom?: Date;
  availableUntil?: Date;
  
  // Trial settings
  trialDays: number = 0;
  trialFeatures?: ISubscriptionFeatures;
  
  // Promotional settings
  isPromotional: boolean = false;
  promotionalPrice?: number;
  promotionalStartDate?: Date;
  promotionalEndDate?: Date;
  promotionalDescription?: string;
  
  // Referral settings
  referralReward: number = 0; // Amount in cents
  referralRewardType: 'percentage' | 'fixed' = 'fixed';
  
  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<SubscriptionPlan>) {
    Object.assign(this, data);
  }

  // Status checks
  isActive(): boolean {
    return this.status === PlanStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this.status === PlanStatus.INACTIVE;
  }

  isArchived(): boolean {
    return this.status === PlanStatus.ARCHIVED;
  }

  // Availability checks
  isAvailable(): boolean {
    if (!this.isActive()) return false;
    if (!this.isPublic) return false;
    
    const now = new Date();
    
    if (this.availableFrom && now < this.availableFrom) return false;
    if (this.availableUntil && now > this.availableUntil) return false;
    
    return true;
  }

  isPromotionalActive(): boolean {
    if (!this.isPromotional) return false;
    if (!this.promotionalStartDate || !this.promotionalEndDate) return false;
    
    const now = new Date();
    return now >= this.promotionalStartDate && now <= this.promotionalEndDate;
  }

  // Pricing calculations
  getCurrentPrice(): number {
    if (this.isPromotionalActive() && this.promotionalPrice) {
      return this.promotionalPrice;
    }
    return this.pricing.monthly;
  }

  getFormattedPrice(): string {
    const price = this.getCurrentPrice() / 100; // Convert from cents
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  getYearlyDiscount(): number {
    if (!this.pricing.yearly) return 0;
    const monthlyTotal = this.pricing.monthly * 12;
    const discount = ((monthlyTotal - this.pricing.yearly) / monthlyTotal) * 100;
    return Math.round(discount);
  }

  getPromotionalDiscount(): number {
    if (!this.isPromotionalActive() || !this.promotionalPrice) return 0;
    const discount = ((this.pricing.monthly - this.promotionalPrice) / this.pricing.monthly) * 100;
    return Math.round(discount);
  }

  // Feature checks
  hasFeature(feature: string): boolean {
    return this.features[feature] === true;
  }

  getFeatureLimit(feature: string): number {
    return this.features[feature] || 0;
  }

  isUnlimited(feature: string): boolean {
    return this.getFeatureLimit(feature) === -1;
  }

  // Comparison methods
  isMoreExpensiveThan(other: SubscriptionPlan): boolean {
    return this.getCurrentPrice() > other.getCurrentPrice();
  }

  hasMoreFeaturesThan(other: SubscriptionPlan): boolean {
    const thisFeatures = Object.keys(this.features).length;
    const otherFeatures = Object.keys(other.features).length;
    return thisFeatures > otherFeatures;
  }

  // Display helpers
  getBadgeText(): string | null {
    if (this.isPopular) return 'Mais Popular';
    if (this.isRecommended) return 'Recomendado';
    if (this.isPromotionalActive()) return 'Promoção';
    return null;
  }

  getBadgeColor(): string {
    if (this.isPopular) return 'blue';
    if (this.isRecommended) return 'green';
    if (this.isPromotionalActive()) return 'red';
    return 'gray';
  }

  // Business rules
  canBePurchased(): boolean {
    return this.isAvailable() && this.isActive();
  }

  canBeUpgradedTo(): boolean {
    return this.isAvailable() && this.type === PlanType.PREMIUM;
  }

  canBeDowngradedTo(): boolean {
    return this.isAvailable() && this.type === PlanType.BASIC;
  }

  // Trial information
  hasTrial(): boolean {
    return this.trialDays > 0;
  }

  getTrialFeatures(): ISubscriptionFeatures {
    return this.trialFeatures || this.features;
  }

  // Referral information
  getReferralRewardAmount(subscriptionAmount: number): number {
    if (this.referralRewardType === 'percentage') {
      return Math.round(subscriptionAmount * (this.referralReward / 100));
    }
    return this.referralReward;
  }

  // Validation
  isValid(): boolean {
    return !!(
      this.name &&
      this.slug &&
      this.pricing &&
      this.pricing.monthly > 0 &&
      this.features
    );
  }

  // Clone for promotional versions
  createPromotionalVersion(
    promotionalPrice: number,
    startDate: Date,
    endDate: Date,
    description?: string
  ): SubscriptionPlan {
    return new SubscriptionPlan({
      ...this,
      id: `${this.id}-promo-${Date.now()}`,
      isPromotional: true,
      promotionalPrice,
      promotionalStartDate: startDate,
      promotionalEndDate: endDate,
      promotionalDescription: description,
      slug: `${this.slug}-promo`,
      name: `${this.name} - Promoção`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
