import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueryCacheService {
  private readonly cacheTtls: Record<string, number>;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.cacheTtls = {
      products: (this.configService.get<number>('redis.cache.products') || 1800) * 1000,
      categories: (this.configService.get<number>('redis.cache.categories') || 3600) * 1000,
      users: (this.configService.get<number>('redis.cache.users') || 1800) * 1000,
      companies: (this.configService.get<number>('redis.cache.companies') || 3600) * 1000,
    };
  }

  /**
   * Cache de produtos por categoria
   */
  async getProductsByCategory(categoryId: string): Promise<any[] | null> {
    const cacheKey = `products:category:${categoryId}`;
    return (await this.cacheManager.get<any[]>(cacheKey)) || null;
  }

  async setProductsByCategory(categoryId: string, products: any[]): Promise<void> {
    const cacheKey = `products:category:${categoryId}`;
    await this.cacheManager.set(cacheKey, products, this.cacheTtls.products);
  }

  /**
   * Cache de produtos por fornecedor
   */
  async getProductsBySupplier(supplierId: string): Promise<any[] | null> {
    const cacheKey = `products:supplier:${supplierId}`;
    return (await this.cacheManager.get<any[]>(cacheKey)) || null;
  }

  async setProductsBySupplier(supplierId: string, products: any[]): Promise<void> {
    const cacheKey = `products:supplier:${supplierId}`;
    await this.cacheManager.set(cacheKey, products, this.cacheTtls.products);
  }

  /**
   * Cache de produtos por status
   */
  async getProductsByStatus(status: string, companyId: string): Promise<any[] | null> {
    const cacheKey = `products:status:${status}:company:${companyId}`;
    return (await this.cacheManager.get<any[]>(cacheKey)) || null;
  }

  async setProductsByStatus(status: string, companyId: string, products: any[]): Promise<void> {
    const cacheKey = `products:status:${status}:company:${companyId}`;
    await this.cacheManager.set(cacheKey, products, this.cacheTtls.products);
  }

  /**
   * Cache de árvore de categorias
   */
  async getCategoryTree(companyId: string): Promise<any[] | null> {
    const cacheKey = `categories:tree:company:${companyId}`;
    return (await this.cacheManager.get<any[]>(cacheKey)) || null;
  }

  async setCategoryTree(companyId: string, tree: any[]): Promise<void> {
    const cacheKey = `categories:tree:company:${companyId}`;
    await this.cacheManager.set(cacheKey, tree, this.cacheTtls.categories);
  }

  /**
   * Cache de categorias por nível
   */
  async getCategoriesByLevel(level: number, companyId: string): Promise<any[] | null> {
    const cacheKey = `categories:level:${level}:company:${companyId}`;
    return (await this.cacheManager.get<any[]>(cacheKey)) || null;
  }

  async setCategoriesByLevel(level: number, companyId: string, categories: any[]): Promise<void> {
    const cacheKey = `categories:level:${level}:company:${companyId}`;
    await this.cacheManager.set(cacheKey, categories, this.cacheTtls.categories);
  }

  /**
   * Cache de dados da empresa
   */
  async getCompanyData(companyId: string): Promise<any | null> {
    const cacheKey = `company:${companyId}`;
    return await this.cacheManager.get<any>(cacheKey);
  }

  async setCompanyData(companyId: string, company: any): Promise<void> {
    const cacheKey = `company:${companyId}`;
    await this.cacheManager.set(cacheKey, company, this.cacheTtls.companies);
  }

  /**
   * Cache de configurações da empresa
   */
  async getCompanyConfig(companyId: string): Promise<any | null> {
    const cacheKey = `company:config:${companyId}`;
    return await this.cacheManager.get<any>(cacheKey);
  }

  async setCompanyConfig(companyId: string, config: any): Promise<void> {
    const cacheKey = `company:config:${companyId}`;
    await this.cacheManager.set(cacheKey, config, this.cacheTtls.companies);
  }

  /**
   * Cache de dados do usuário
   */
  async getUserData(userId: string): Promise<any | null> {
    const cacheKey = `user:${userId}`;
    return await this.cacheManager.get<any>(cacheKey);
  }

  async setUserData(userId: string, user: any): Promise<void> {
    const cacheKey = `user:${userId}`;
    await this.cacheManager.set(cacheKey, user, this.cacheTtls.users);
  }

  /**
   * Cache de preferências do usuário
   */
  async getUserPreferences(userId: string): Promise<any | null> {
    const cacheKey = `user:preferences:${userId}`;
    return await this.cacheManager.get<any>(cacheKey);
  }

  async setUserPreferences(userId: string, preferences: any): Promise<void> {
    const cacheKey = `user:preferences:${userId}`;
    await this.cacheManager.set(cacheKey, preferences, this.cacheTtls.users);
  }

  /**
   * Cache de fornecedores
   */
  async getSuppliers(companyId: string): Promise<any[] | null> {
    const cacheKey = `suppliers:company:${companyId}`;
    return (await this.cacheManager.get<any[]>(cacheKey)) || null;
  }

  async setSuppliers(companyId: string, suppliers: any[]): Promise<void> {
    const cacheKey = `suppliers:company:${companyId}`;
    await this.cacheManager.set(cacheKey, suppliers, this.cacheTtls.companies);
  }

  /**
   * Cache de clientes
   */
  async getCustomers(companyId: string): Promise<any[] | null> {
    const cacheKey = `customers:company:${companyId}`;
    return (await this.cacheManager.get<any[]>(cacheKey)) || null;
  }

  async setCustomers(companyId: string, customers: any[]): Promise<void> {
    const cacheKey = `customers:company:${companyId}`;
    await this.cacheManager.set(cacheKey, customers, this.cacheTtls.companies);
  }

  /**
   * Cache de localizações
   */
  async getLocations(companyId: string): Promise<any[] | null> {
    const cacheKey = `locations:company:${companyId}`;
    return (await this.cacheManager.get<any[]>(cacheKey)) || null;
  }

  async setLocations(companyId: string, locations: any[]): Promise<void> {
    const cacheKey = `locations:company:${companyId}`;
    await this.cacheManager.set(cacheKey, locations, this.cacheTtls.companies);
  }

  /**
   * Invalidação de cache por padrão
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    // Em uma implementação real, você usaria SCAN do Redis
    // Por simplicidade, não implementamos aqui
  }

  /**
   * Invalidação de cache de produtos
   */
  async invalidateProductCache(productId?: string, companyId?: string): Promise<void> {
    if (productId) {
      await this.cacheManager.del(`product:${productId}`);
    }
    
    if (companyId) {
      // Invalidar caches relacionados à empresa
      await this.invalidateByPattern(`products:*:company:${companyId}`);
      await this.invalidateByPattern(`products:category:*`);
      await this.invalidateByPattern(`products:supplier:*`);
      await this.invalidateByPattern(`products:status:*:company:${companyId}`);
    }
  }

  /**
   * Invalidação de cache de categorias
   */
  async invalidateCategoryCache(categoryId?: string, companyId?: string): Promise<void> {
    if (categoryId) {
      await this.cacheManager.del(`category:${categoryId}`);
      await this.invalidateByPattern(`products:category:${categoryId}`);
    }
    
    if (companyId) {
      await this.invalidateByPattern(`categories:*:company:${companyId}`);
    }
  }

  /**
   * Invalidação de cache de empresa
   */
  async invalidateCompanyCache(companyId: string): Promise<void> {
    await this.cacheManager.del(`company:${companyId}`);
    await this.cacheManager.del(`company:config:${companyId}`);
    await this.invalidateByPattern(`*:company:${companyId}`);
  }

  /**
   * Invalidação de cache de usuário
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.cacheManager.del(`user:${userId}`);
    await this.cacheManager.del(`user:preferences:${userId}`);
  }

  /**
   * Limpeza geral do cache
   */
  async clearAllCache(): Promise<void> {
    // Note: cache-manager v5+ doesn't have reset method
    // This would need to be implemented differently in production
    // For now, we'll leave this as a placeholder
  }

  /**
   * Obtém estatísticas do cache
   */
  async getCacheStats(): Promise<{
    hitRate: number;
    missRate: number;
    totalKeys: number;
  }> {
    // Implementação simplificada
    return {
      hitRate: 0,
      missRate: 0,
      totalKeys: 0,
    };
  }
}
