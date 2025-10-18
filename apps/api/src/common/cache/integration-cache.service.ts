import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

export interface CachedIntegrationData {
  integrationId: string;
  entity: string;
  data: any;
  lastSync: Date;
  ttl: number;
}

export interface SyncStatus {
  integrationId: string;
  status: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  lastSync: Date;
  nextSync: Date;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  errorMessage?: string;
}

export interface WebhookCache {
  webhookId: string;
  lastTriggered: Date;
  successCount: number;
  failureCount: number;
  lastError?: string;
}

@Injectable()
export class IntegrationCacheService {
  private readonly integrationTtl: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.integrationTtl = (this.configService.get<number>('redis.cache.integrations') || 600) * 1000;
  }

  /**
   * Cache de dados de integração
   */
  async getIntegrationData(integrationId: string, entity: string): Promise<any | null> {
    const cacheKey = `integration:${integrationId}:${entity}`;
    const cached = await this.cacheManager.get<CachedIntegrationData>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setIntegrationData(integrationId: string, entity: string, data: any): Promise<void> {
    const cacheKey = `integration:${integrationId}:${entity}`;
    const cached: CachedIntegrationData = {
      integrationId,
      entity,
      data,
      lastSync: new Date(),
      ttl: this.integrationTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.integrationTtl);
  }

  /**
   * Cache de status de sincronização
   */
  async getSyncStatus(integrationId: string): Promise<SyncStatus | null> {
    const cacheKey = `sync:status:${integrationId}`;
    return (await this.cacheManager.get<SyncStatus>(cacheKey)) || null;
  }

  async setSyncStatus(integrationId: string, status: SyncStatus): Promise<void> {
    const cacheKey = `sync:status:${integrationId}`;
    await this.cacheManager.set(cacheKey, status, this.integrationTtl);
  }

  /**
   * Cache de configurações de integração
   */
  async getIntegrationConfig(integrationId: string): Promise<any | null> {
    const cacheKey = `integration:config:${integrationId}`;
    return await this.cacheManager.get<any>(cacheKey);
  }

  async setIntegrationConfig(integrationId: string, config: any): Promise<void> {
    const cacheKey = `integration:config:${integrationId}`;
    await this.cacheManager.set(cacheKey, config, this.integrationTtl);
  }

  /**
   * Cache de credenciais de integração (criptografadas)
   */
  async getIntegrationCredentials(integrationId: string): Promise<any | null> {
    const cacheKey = `integration:credentials:${integrationId}`;
    return await this.cacheManager.get<any>(cacheKey);
  }

  async setIntegrationCredentials(integrationId: string, credentials: any): Promise<void> {
    const cacheKey = `integration:credentials:${integrationId}`;
    await this.cacheManager.set(cacheKey, credentials, this.integrationTtl);
  }

  /**
   * Cache de teste de conexão
   */
  async getConnectionTest(integrationId: string): Promise<any | null> {
    const cacheKey = `integration:connection_test:${integrationId}`;
    return await this.cacheManager.get<any>(cacheKey);
  }

  async setConnectionTest(integrationId: string, result: any): Promise<void> {
    const cacheKey = `integration:connection_test:${integrationId}`;
    await this.cacheManager.set(cacheKey, result, this.integrationTtl);
  }

  /**
   * Cache de webhooks
   */
  async getWebhookCache(webhookId: string): Promise<WebhookCache | null> {
    const cacheKey = `webhook:cache:${webhookId}`;
    return (await this.cacheManager.get<WebhookCache>(cacheKey)) || null;
  }

  async setWebhookCache(webhookId: string, cache: WebhookCache): Promise<void> {
    const cacheKey = `webhook:cache:${webhookId}`;
    await this.cacheManager.set(cacheKey, cache, this.integrationTtl);
  }

  /**
   * Atualiza estatísticas de webhook
   */
  async updateWebhookStats(webhookId: string, success: boolean, error?: string): Promise<void> {
    const webhookCache = await this.getWebhookCache(webhookId) || {
      webhookId,
      lastTriggered: new Date(),
      successCount: 0,
      failureCount: 0,
    };

    webhookCache.lastTriggered = new Date();
    
    if (success) {
      webhookCache.successCount++;
    } else {
      webhookCache.failureCount++;
      webhookCache.lastError = error;
    }

    await this.setWebhookCache(webhookId, webhookCache);
  }

  /**
   * Cache de fila de sincronização
   */
  async addToSyncQueue(integrationId: string, entity: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'): Promise<void> {
    const job = {
      integrationId,
      entity,
      priority,
      timestamp: new Date(),
      attempts: 0,
    };

    const queueKey = `sync:queue:${priority.toLowerCase()}`;
    await this.cacheManager.set(queueKey, job, this.integrationTtl);
  }

  async getSyncQueue(priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'): Promise<any | null> {
    const queueKey = `sync:queue:${priority.toLowerCase()}`;
    return await this.cacheManager.get<any>(queueKey);
  }

  async removeFromSyncQueue(priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'): Promise<void> {
    const queueKey = `sync:queue:${priority.toLowerCase()}`;
    await this.cacheManager.del(queueKey);
  }

  /**
   * Cache de logs de sincronização
   */
  async getSyncLogs(integrationId: string, limit: number = 10): Promise<any[]> {
    const cacheKey = `sync:logs:${integrationId}`;
    const logs = await this.cacheManager.get<any[]>(cacheKey) || [];
    return logs.slice(0, limit);
  }

  async addSyncLog(integrationId: string, log: any): Promise<void> {
    const cacheKey = `sync:logs:${integrationId}`;
    const logs = await this.cacheManager.get<any[]>(cacheKey) || [];
    
    logs.unshift({
      ...log,
      timestamp: new Date(),
    });
    
    // Manter apenas os últimos 50 logs
    if (logs.length > 50) {
      logs.splice(50);
    }
    
    await this.cacheManager.set(cacheKey, logs, this.integrationTtl);
  }

  /**
   * Cache de métricas de integração
   */
  async getIntegrationMetrics(integrationId: string): Promise<any | null> {
    const cacheKey = `integration:metrics:${integrationId}`;
    return await this.cacheManager.get<any>(cacheKey);
  }

  async setIntegrationMetrics(integrationId: string, metrics: any): Promise<void> {
    const cacheKey = `integration:metrics:${integrationId}`;
    await this.cacheManager.set(cacheKey, metrics, this.integrationTtl);
  }

  /**
   * Cache de dados de API externa
   */
  async getExternalApiData(apiKey: string, endpoint: string): Promise<any | null> {
    const cacheKey = `external_api:${apiKey}:${endpoint}`;
    const cached = await this.cacheManager.get<CachedIntegrationData>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    return null;
  }

  async setExternalApiData(apiKey: string, endpoint: string, data: any): Promise<void> {
    const cacheKey = `external_api:${apiKey}:${endpoint}`;
    const cached: CachedIntegrationData = {
      integrationId: apiKey,
      entity: endpoint,
      data,
      lastSync: new Date(),
      ttl: this.integrationTtl,
    };
    
    await this.cacheManager.set(cacheKey, cached, this.integrationTtl);
  }

  /**
   * Cache de mapeamento de dados
   */
  async getDataMapping(integrationId: string, entity: string): Promise<any | null> {
    const cacheKey = `mapping:${integrationId}:${entity}`;
    return await this.cacheManager.get<any>(cacheKey);
  }

  async setDataMapping(integrationId: string, entity: string, mapping: any): Promise<void> {
    const cacheKey = `mapping:${integrationId}:${entity}`;
    await this.cacheManager.set(cacheKey, mapping, this.integrationTtl);
  }

  /**
   * Cache de transformações de dados
   */
  async getDataTransformation(integrationId: string, entity: string): Promise<any | null> {
    const cacheKey = `transformation:${integrationId}:${entity}`;
    return await this.cacheManager.get<any>(cacheKey);
  }

  async setDataTransformation(integrationId: string, entity: string, transformation: any): Promise<void> {
    const cacheKey = `transformation:${integrationId}:${entity}`;
    await this.cacheManager.set(cacheKey, transformation, this.integrationTtl);
  }

  /**
   * Cache de validações de dados
   */
  async getDataValidation(integrationId: string, entity: string): Promise<any | null> {
    const cacheKey = `validation:${integrationId}:${entity}`;
    return await this.cacheManager.get<any>(cacheKey);
  }

  async setDataValidation(integrationId: string, entity: string, validation: any): Promise<void> {
    const cacheKey = `validation:${integrationId}:${entity}`;
    await this.cacheManager.set(cacheKey, validation, this.integrationTtl);
  }

  /**
   * Invalidação de cache de integração
   */
  async invalidateIntegrationCache(integrationId: string): Promise<void> {
    const patterns = [
      `integration:${integrationId}:*`,
      `sync:status:${integrationId}`,
      `integration:config:${integrationId}`,
      `integration:credentials:${integrationId}`,
      `integration:connection_test:${integrationId}`,
      `integration:metrics:${integrationId}`,
      `sync:logs:${integrationId}`,
      `mapping:${integrationId}:*`,
      `transformation:${integrationId}:*`,
      `validation:${integrationId}:*`,
    ];
    
    for (const pattern of patterns) {
      await this.cacheManager.del(pattern);
    }
  }

  /**
   * Invalidação de cache de webhook
   */
  async invalidateWebhookCache(webhookId: string): Promise<void> {
    await this.cacheManager.del(`webhook:cache:${webhookId}`);
  }

  /**
   * Verifica se o cache é válido
   */
  private isCacheValid(cached: CachedIntegrationData): boolean {
    const now = new Date();
    const cacheAge = now.getTime() - cached.lastSync.getTime();
    return cacheAge < cached.ttl;
  }

  /**
   * Obtém estatísticas de cache de integração
   */
  async getCacheStats(): Promise<{
    totalIntegrations: number;
    activeSyncs: number;
    failedSyncs: number;
    cacheHitRate: number;
  }> {
    // Implementação simplificada
    return {
      totalIntegrations: 0,
      activeSyncs: 0,
      failedSyncs: 0,
      cacheHitRate: 0,
    };
  }

  /**
   * Limpa cache de integrações antigas
   */
  async cleanOldIntegrationCache(): Promise<void> {
    // Implementação simplificada
    // Em produção, você usaria SCAN do Redis para encontrar e remover caches antigos
  }
}
