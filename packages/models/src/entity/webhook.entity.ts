/**
 * Webhook entity - Sistema de webhooks
 */

import { IBaseEntityWithCompany } from '../interfaces/base.interface';

export interface IWebhookEvent {
  type: string;
  data: any;
  timestamp: Date;
  id: string;
}

export interface IWebhookResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  duration: number;
}

export class Webhook implements IBaseEntityWithCompany {
  id!: string;
  companyId!: string;
  
  // Webhook details
  name!: string;
  url!: string;
  events!: string[]; // Array of event types
  secret!: string; // Webhook secret for signature verification
  
  // Status
  isActive!: boolean;
  lastTriggered?: Date;
  successCount!: number;
  failureCount!: number;
  
  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<Webhook>) {
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

  supportsEvent(eventType: string): boolean {
    return this.events.includes(eventType) || this.events.includes('*');
  }

  getTotalAttempts(): number {
    return this.successCount + this.failureCount;
  }

  getSuccessRate(): number {
    const total = this.getTotalAttempts();
    if (total === 0) return 0;
    return (this.successCount / total) * 100;
  }

  getFailureRate(): number {
    const total = this.getTotalAttempts();
    if (total === 0) return 0;
    return (this.failureCount / total) * 100;
  }

  isHealthy(): boolean {
    return this.getSuccessRate() >= 90;
  }

  isUnhealthy(): boolean {
    return this.getSuccessRate() < 50;
  }

  recordSuccess(): void {
    this.successCount += 1;
    this.lastTriggered = new Date();
    this.updatedAt = new Date();
  }

  recordFailure(): void {
    this.failureCount += 1;
    this.lastTriggered = new Date();
    this.updatedAt = new Date();
  }

  addEvent(eventType: string): void {
    if (!this.events.includes(eventType)) {
      this.events.push(eventType);
      this.updatedAt = new Date();
    }
  }

  removeEvent(eventType: string): void {
    const index = this.events.indexOf(eventType);
    if (index > -1) {
      this.events.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  setAllEvents(): void {
    this.events = ['*'];
    this.updatedAt = new Date();
  }

  clearEvents(): void {
    this.events = [];
    this.updatedAt = new Date();
  }

  updateUrl(newUrl: string): void {
    this.url = newUrl;
    this.updatedAt = new Date();
  }

  updateSecret(newSecret: string): void {
    this.secret = newSecret;
    this.updatedAt = new Date();
  }

  generateSignature(payload: string): string {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');
  }

  verifySignature(payload: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(payload);
    // Use a simple comparison for now, timingSafeEqual requires Node.js crypto module
    return signature === expectedSignature;
  }

  getHealthStatus(): 'healthy' | 'warning' | 'critical' {
    const successRate = this.getSuccessRate();
    if (successRate >= 90) return 'healthy';
    if (successRate >= 70) return 'warning';
    return 'critical';
  }

  resetCounters(): void {
    this.successCount = 0;
    this.failureCount = 0;
    this.updatedAt = new Date();
  }

  isRecentlyTriggered(minutes: number = 5): boolean {
    if (!this.lastTriggered) return false;
    const threshold = new Date(Date.now() - minutes * 60 * 1000);
    return this.lastTriggered > threshold;
  }

  getLastTriggeredAgo(): string {
    if (!this.lastTriggered) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - this.lastTriggered.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day(s) ago`;
    if (hours > 0) return `${hours} hour(s) ago`;
    if (minutes > 0) return `${minutes} minute(s) ago`;
    return 'Just now';
  }
}
