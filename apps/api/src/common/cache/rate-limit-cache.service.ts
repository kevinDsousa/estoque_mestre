import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

@Injectable()
export class RateLimitCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Verifica rate limit genérico
   */
  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const resetTime = now + windowMs;
    
    // Obter contador atual
    const current = await this.cacheManager.get<number>(key) || 0;
    const totalHits = current + 1;
    
    // Definir TTL se for a primeira requisição
    if (current === 0) {
      await this.cacheManager.set(key, totalHits, windowSeconds * 1000);
    } else {
      await this.cacheManager.set(key, totalHits, windowSeconds * 1000);
    }
    
    return {
      allowed: totalHits <= limit,
      remaining: Math.max(0, limit - totalHits),
      resetTime,
      totalHits,
    };
  }

  /**
   * Rate limiting por usuário
   */
  async checkUserRateLimit(
    userId: string,
    endpoint: string,
    limit: number = 100,
    windowSeconds: number = 3600, // 1 hora
  ): Promise<RateLimitResult> {
    const key = `rate_limit:user:${userId}:${endpoint}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting por empresa
   */
  async checkCompanyRateLimit(
    companyId: string,
    limit: number = 1000,
    windowSeconds: number = 3600, // 1 hora
  ): Promise<RateLimitResult> {
    const key = `rate_limit:company:${companyId}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting por IP
   */
  async checkIpRateLimit(
    ip: string,
    limit: number = 200,
    windowSeconds: number = 3600, // 1 hora
  ): Promise<RateLimitResult> {
    const key = `rate_limit:ip:${ip}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting por endpoint específico
   */
  async checkEndpointRateLimit(
    endpoint: string,
    limit: number = 50,
    windowSeconds: number = 60, // 1 minuto
  ): Promise<RateLimitResult> {
    const key = `rate_limit:endpoint:${endpoint}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting para login
   */
  async checkLoginRateLimit(
    identifier: string, // email ou IP
    limit: number = 5,
    windowSeconds: number = 900, // 15 minutos
  ): Promise<RateLimitResult> {
    const key = `rate_limit:login:${identifier}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting para reset de senha
   */
  async checkPasswordResetRateLimit(
    email: string,
    limit: number = 3,
    windowSeconds: number = 3600, // 1 hora
  ): Promise<RateLimitResult> {
    const key = `rate_limit:password_reset:${email}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting para verificação de email
   */
  async checkEmailVerificationRateLimit(
    email: string,
    limit: number = 3,
    windowSeconds: number = 3600, // 1 hora
  ): Promise<RateLimitResult> {
    const key = `rate_limit:email_verification:${email}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting para upload de arquivos
   */
  async checkFileUploadRateLimit(
    userId: string,
    limit: number = 10,
    windowSeconds: number = 3600, // 1 hora
  ): Promise<RateLimitResult> {
    const key = `rate_limit:file_upload:${userId}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting para API externa
   */
  async checkExternalApiRateLimit(
    apiKey: string,
    limit: number = 1000,
    windowSeconds: number = 3600, // 1 hora
  ): Promise<RateLimitResult> {
    const key = `rate_limit:external_api:${apiKey}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting para webhooks
   */
  async checkWebhookRateLimit(
    webhookId: string,
    limit: number = 100,
    windowSeconds: number = 3600, // 1 hora
  ): Promise<RateLimitResult> {
    const key = `rate_limit:webhook:${webhookId}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting para notificações
   */
  async checkNotificationRateLimit(
    userId: string,
    limit: number = 50,
    windowSeconds: number = 3600, // 1 hora
  ): Promise<RateLimitResult> {
    const key = `rate_limit:notification:${userId}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting para relatórios
   */
  async checkReportRateLimit(
    userId: string,
    limit: number = 20,
    windowSeconds: number = 3600, // 1 hora
  ): Promise<RateLimitResult> {
    const key = `rate_limit:report:${userId}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Rate limiting para integrações
   */
  async checkIntegrationRateLimit(
    integrationId: string,
    limit: number = 100,
    windowSeconds: number = 3600, // 1 hora
  ): Promise<RateLimitResult> {
    const key = `rate_limit:integration:${integrationId}`;
    return await this.checkRateLimit(key, limit, windowSeconds);
  }

  /**
   * Limpa rate limit de um usuário
   */
  async clearUserRateLimit(userId: string): Promise<void> {
    // Limpar todos os rate limits do usuário
    await this.cacheManager.del(`rate_limit:user:${userId}:*`);
    await this.cacheManager.del(`rate_limit:login:${userId}`);
    await this.cacheManager.del(`rate_limit:file_upload:${userId}`);
    await this.cacheManager.del(`rate_limit:notification:${userId}`);
    await this.cacheManager.del(`rate_limit:report:${userId}`);
  }

  /**
   * Limpa rate limit de uma empresa
   */
  async clearCompanyRateLimit(companyId: string): Promise<void> {
    await this.cacheManager.del(`rate_limit:company:${companyId}`);
  }

  /**
   * Limpa rate limit de um IP
   */
  async clearIpRateLimit(ip: string): Promise<void> {
    await this.cacheManager.del(`rate_limit:ip:${ip}`);
  }

  /**
   * Obtém estatísticas de rate limiting
   */
  async getRateLimitStats(): Promise<{
    totalRateLimits: number;
    blockedRequests: number;
    allowedRequests: number;
  }> {
    // Implementação simplificada
    return {
      totalRateLimits: 0,
      blockedRequests: 0,
      allowedRequests: 0,
    };
  }

  /**
   * Obtém rate limits ativos de um usuário
   */
  async getUserRateLimits(userId: string): Promise<Record<string, RateLimitResult>> {
    // Implementação simplificada
    return {};
  }

  /**
   * Obtém rate limits ativos de uma empresa
   */
  async getCompanyRateLimits(companyId: string): Promise<Record<string, RateLimitResult>> {
    // Implementação simplificada
    return {};
  }
}
