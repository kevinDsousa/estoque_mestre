/**
 * Business Metric entity - Sistema de métricas de negócio
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';

export enum BusinessMetricType {
  REVENUE = 'REVENUE',
  COST = 'COST',
  PROFIT = 'PROFIT',
  TURNOVER = 'TURNOVER',
  ABC_ANALYSIS = 'ABC_ANALYSIS',
  SALES_TREND = 'SALES_TREND'
}

export enum MetricPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface IMetricMetadata {
  category?: string;
  productId?: string;
  supplierId?: string;
  customerId?: string;
  location?: string;
  additionalData?: Record<string, any>;
}

export class BusinessMetric implements IBaseEntityWithCompany {
  id!: string;
  companyId!: string;
  type!: BusinessMetricType;
  period!: MetricPeriod;
  periodStart!: Date;
  periodEnd!: Date;
  
  // Metric data
  value!: number;
  metadata?: IMetricMetadata;
  calculatedAt!: Date;
  
  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<BusinessMetric>) {
    Object.assign(this, data);
  }

  // Helper methods
  isRevenue(): boolean {
    return this.type === BusinessMetricType.REVENUE;
  }

  isCost(): boolean {
    return this.type === BusinessMetricType.COST;
  }

  isProfit(): boolean {
    return this.type === BusinessMetricType.PROFIT;
  }

  isTurnover(): boolean {
    return this.type === BusinessMetricType.TURNOVER;
  }

  isABCAnalysis(): boolean {
    return this.type === BusinessMetricType.ABC_ANALYSIS;
  }

  isSalesTrend(): boolean {
    return this.type === BusinessMetricType.SALES_TREND;
  }

  getPeriodDuration(): number {
    return this.periodEnd.getTime() - this.periodStart.getTime();
  }

  getPeriodDurationInDays(): number {
    return Math.ceil(this.getPeriodDuration() / (1000 * 60 * 60 * 24));
  }

  isCurrentPeriod(): boolean {
    const now = new Date();
    return now >= this.periodStart && now <= this.periodEnd;
  }

  isPastPeriod(): boolean {
    return new Date() > this.periodEnd;
  }

  isFuturePeriod(): boolean {
    return new Date() < this.periodStart;
  }

  getFormattedValue(currency: string = 'BRL'): string {
    if (this.isRevenue() || this.isCost() || this.isProfit()) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency
      }).format(this.value);
    }
    
    if (this.isTurnover()) {
      return `${this.value.toFixed(2)}x`;
    }
    
    return this.value.toString();
  }

  getTrendDirection(previousMetric?: BusinessMetric): 'up' | 'down' | 'stable' {
    if (!previousMetric) return 'stable';
    
    const change = this.value - previousMetric.value;
    const percentageChange = (change / previousMetric.value) * 100;
    
    if (Math.abs(percentageChange) < 1) return 'stable';
    return change > 0 ? 'up' : 'down';
  }

  getTrendPercentage(previousMetric?: BusinessMetric): number {
    if (!previousMetric) return 0;
    
    const change = this.value - previousMetric.value;
    return (change / previousMetric.value) * 100;
  }

  isPositive(): boolean {
    return this.value > 0;
  }

  isNegative(): boolean {
    return this.value < 0;
  }

  isZero(): boolean {
    return this.value === 0;
  }

  getCategory(): string | undefined {
    return this.metadata?.category;
  }

  getProductId(): string | undefined {
    return this.metadata?.productId;
  }

  getSupplierId(): string | undefined {
    return this.metadata?.supplierId;
  }

  getCustomerId(): string | undefined {
    return this.metadata?.customerId;
  }

  getLocation(): string | undefined {
    return this.metadata?.location;
  }

  getAdditionalData(key: string): any {
    return this.metadata?.additionalData?.[key];
  }

  setAdditionalData(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    if (!this.metadata.additionalData) {
      this.metadata.additionalData = {};
    }
    this.metadata.additionalData[key] = value;
    this.updatedAt = new Date();
  }
}
