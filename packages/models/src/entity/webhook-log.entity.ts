/**
 * Webhook Log entity - Logs de webhooks
 */

import { IBaseEntity } from '../interfaces/base.interface';

export class WebhookLog implements IBaseEntity {
  id!: string;
  webhookId!: string;
  
  // Request details
  event!: string;
  payload!: any;
  response?: any;
  statusCode?: number;
  
  // Status
  success!: boolean;
  errorMessage?: string;
  retryCount!: number;
  
  // Base entity fields
  createdAt!: Date;
  updatedAt!: Date;
  
  // Timestamps
  triggeredAt!: Date;

  constructor(data: Partial<WebhookLog>) {
    Object.assign(this, data);
  }

  // Helper methods
  isSuccessful(): boolean {
    return this.success;
  }

  isFailed(): boolean {
    return !this.success;
  }

  hasRetries(): boolean {
    return this.retryCount > 0;
  }

  incrementRetry(): void {
    this.retryCount += 1;
  }

  getDuration(): number {
    // This would be calculated based on request start/end times
    // For now, returning 0 as we don't have timing data
    return 0;
  }

  getFormattedPayload(): string {
    return JSON.stringify(this.payload, null, 2);
  }

  getFormattedResponse(): string {
    if (!this.response) return '';
    return JSON.stringify(this.response, null, 2);
  }

  getStatusText(): string {
    if (this.statusCode) {
      return `${this.statusCode} ${this.getStatusMessage(this.statusCode)}`;
    }
    return this.success ? 'Success' : 'Failed';
  }

  private getStatusMessage(statusCode: number): string {
    const statusMessages: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      202: 'Accepted',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      408: 'Request Timeout',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };
    
    return statusMessages[statusCode] || 'Unknown';
  }

  isClientError(): boolean {
    return this.statusCode ? this.statusCode >= 400 && this.statusCode < 500 : false;
  }

  isServerError(): boolean {
    return this.statusCode ? this.statusCode >= 500 : false;
  }

  isTimeout(): boolean {
    return this.statusCode === 408 || this.statusCode === 504;
  }

  isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  getRetryDelay(): number {
    // Exponential backoff: 2^retryCount seconds
    return Math.pow(2, this.retryCount) * 1000;
  }

  shouldRetry(maxRetries: number = 3): boolean {
    return this.isFailed() && this.retryCount < maxRetries;
  }

  getAgeInMinutes(): number {
    const now = new Date();
    const diff = now.getTime() - this.triggeredAt.getTime();
    return Math.floor(diff / (1000 * 60));
  }

  getAgeInHours(): number {
    return Math.floor(this.getAgeInMinutes() / 60);
  }

  getAgeInDays(): number {
    return Math.floor(this.getAgeInHours() / 24);
  }

  isRecent(minutes: number = 60): boolean {
    return this.getAgeInMinutes() <= minutes;
  }

  getErrorCategory(): string {
    if (!this.errorMessage) return 'Unknown';
    
    const error = this.errorMessage.toLowerCase();
    
    if (error.includes('timeout')) return 'Timeout';
    if (error.includes('connection')) return 'Connection';
    if (error.includes('network')) return 'Network';
    if (error.includes('authentication')) return 'Authentication';
    if (error.includes('authorization')) return 'Authorization';
    if (error.includes('validation')) return 'Validation';
    if (error.includes('rate limit')) return 'Rate Limit';
    if (error.includes('server error')) return 'Server Error';
    
    return 'Other';
  }

  getFormattedTriggeredAt(): string {
    return this.triggeredAt.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
