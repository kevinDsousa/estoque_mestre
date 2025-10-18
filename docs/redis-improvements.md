# 🚀 Melhorias com Redis - Estoque Mestre

## 📋 **Visão Geral**

O Redis será implementado para otimizar performance, escalabilidade e experiência do usuário através de cache inteligente e funcionalidades em tempo real.

## 🎯 **1. Cache de Sessões e Autenticação**

### **Problema Atual**
- Tokens JWT armazenados apenas no cliente
- Sem controle de sessões ativas
- Dificuldade para logout em massa
- Sem controle de dispositivos

### **Solução com Redis**
```typescript
// Cache de sessões ativas
interface UserSession {
  userId: string;
  companyId: string;
  deviceId: string;
  lastActivity: Date;
  permissions: string[];
}

// Implementação
@Injectable()
export class SessionService {
  async createSession(userId: string, deviceId: string): Promise<string> {
    const sessionId = generateUUID();
    const session: UserSession = {
      userId,
      companyId: user.companyId,
      deviceId,
      lastActivity: new Date(),
      permissions: user.permissions
    };
    
    await this.redis.setex(
      `session:${sessionId}`, 
      3600, // 1 hora
      JSON.stringify(session)
    );
    
    return sessionId;
  }
}
```

### **Benefícios**
- ✅ Controle total de sessões ativas
- ✅ Logout em massa por empresa
- ✅ Detecção de login suspeito
- ✅ Controle de dispositivos por usuário

## 🎯 **2. Cache de Consultas Frequentes**

### **Problema Atual**
- Consultas repetitivas ao banco
- Tempo de resposta lento para dados estáticos
- Sobrecarga no PostgreSQL

### **Solução com Redis**
```typescript
@Injectable()
export class CacheService {
  // Cache de produtos por categoria
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const cacheKey = `products:category:${categoryId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const products = await this.productService.findByCategory(categoryId);
    await this.redis.setex(cacheKey, 1800, JSON.stringify(products)); // 30 min
    
    return products;
  }
  
  // Cache de categorias hierárquicas
  async getCategoryTree(): Promise<Category[]> {
    const cacheKey = 'categories:tree';
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const tree = await this.categoryService.buildTree();
    await this.redis.setex(cacheKey, 3600, JSON.stringify(tree)); // 1 hora
    
    return tree;
  }
}
```

### **Dados para Cache**
- 📦 **Produtos**: Por categoria, fornecedor, status
- 🏢 **Empresas**: Dados básicos, configurações
- 👥 **Usuários**: Perfis, permissões
- 📊 **Categorias**: Árvore hierárquica
- 🏪 **Fornecedores**: Lista, dados básicos
- 📍 **Localizações**: Estrutura hierárquica

## 🎯 **3. Rate Limiting Inteligente**

### **Problema Atual**
- Rate limiting básico por IP
- Sem diferenciação por usuário/empresa
- Sem controle de endpoints específicos

### **Solução com Redis**
```typescript
@Injectable()
export class RedisRateLimitService {
  async checkRateLimit(
    key: string, 
    limit: number, 
    window: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current)
    };
  }
  
  // Rate limiting por usuário
  async checkUserRateLimit(userId: string, endpoint: string): Promise<boolean> {
    const key = `rate_limit:user:${userId}:${endpoint}`;
    const { allowed } = await this.checkRateLimit(key, 100, 3600); // 100 req/hora
    
    return allowed;
  }
  
  // Rate limiting por empresa
  async checkCompanyRateLimit(companyId: string): Promise<boolean> {
    const key = `rate_limit:company:${companyId}`;
    const { allowed } = await this.checkRateLimit(key, 1000, 3600); // 1000 req/hora
    
    return allowed;
  }
}
```

### **Benefícios**
- ✅ Controle granular por usuário/empresa
- ✅ Diferentes limites por endpoint
- ✅ Proteção contra abuso
- ✅ Métricas de uso em tempo real

## 🎯 **4. Notificações em Tempo Real**

### **Problema Atual**
- Notificações apenas por email
- Sem notificações push em tempo real
- Sem histórico de notificações

### **Solução com Redis**
```typescript
@Injectable()
export class RealTimeNotificationService {
  // Publicar notificação
  async publishNotification(notification: Notification): Promise<void> {
    const channel = `notifications:company:${notification.companyId}`;
    await this.redis.publish(channel, JSON.stringify(notification));
    
    // Cache da notificação
    await this.redis.lpush(
      `notifications:user:${notification.userId}`, 
      JSON.stringify(notification)
    );
    
    // Manter apenas últimas 100 notificações
    await this.redis.ltrim(`notifications:user:${notification.userId}`, 0, 99);
  }
  
  // Subscrever notificações
  async subscribeToNotifications(companyId: string): Promise<void> {
    const channel = `notifications:company:${companyId}`;
    this.redis.subscribe(channel);
  }
  
  // Alertas automáticos
  async checkLowStockAlerts(): Promise<void> {
    const lowStockProducts = await this.productService.getLowStockProducts();
    
    for (const product of lowStockProducts) {
      const alert = {
        type: 'LOW_STOCK',
        productId: product.id,
        productName: product.name,
        currentStock: product.currentStock,
        minStock: product.minStock,
        companyId: product.companyId
      };
      
      await this.publishNotification(alert);
    }
  }
}
```

### **Benefícios**
- ✅ Notificações instantâneas
- ✅ Histórico de notificações
- ✅ Alertas automáticos
- ✅ Integração com WebSocket

## 🎯 **5. Cache de Métricas e Dashboards**

### **Problema Atual**
- Métricas calculadas a cada requisição
- Dashboards lentos
- Sem cache de agregações

### **Solução com Redis**
```typescript
@Injectable()
export class MetricsCacheService {
  // Cache de métricas do dashboard
  async getDashboardMetrics(companyId: string): Promise<DashboardMetrics> {
    const cacheKey = `dashboard:metrics:${companyId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const metrics = await this.calculateDashboardMetrics(companyId);
    await this.redis.setex(cacheKey, 300, JSON.stringify(metrics)); // 5 min
    
    return metrics;
  }
  
  // Cache de relatórios
  async getSalesReport(companyId: string, period: string): Promise<SalesReport> {
    const cacheKey = `report:sales:${companyId}:${period}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const report = await this.generateSalesReport(companyId, period);
    await this.redis.setex(cacheKey, 1800, JSON.stringify(report)); // 30 min
    
    return report;
  }
  
  // Métricas em tempo real
  async updateRealTimeMetrics(companyId: string, metric: string, value: number): Promise<void> {
    const key = `metrics:realtime:${companyId}:${metric}`;
    await this.redis.incrbyfloat(key, value);
    await this.redis.expire(key, 3600); // 1 hora
  }
}
```

### **Benefícios**
- ✅ Dashboards instantâneos
- ✅ Relatórios pré-calculados
- ✅ Métricas em tempo real
- ✅ Redução de carga no banco

## 🎯 **6. Cache de Integrações**

### **Problema Atual**
- Dados de integrações sempre do banco
- Sem cache de respostas de APIs externas
- Sincronizações lentas

### **Solução com Redis**
```typescript
@Injectable()
export class IntegrationCacheService {
  // Cache de dados de integração
  async getIntegrationData(integrationId: string, entity: string): Promise<any> {
    const cacheKey = `integration:${integrationId}:${entity}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const data = await this.fetchFromExternalAPI(integrationId, entity);
    await this.redis.setex(cacheKey, 600, JSON.stringify(data)); // 10 min
    
    return data;
  }
  
  // Cache de status de sincronização
  async getSyncStatus(integrationId: string): Promise<SyncStatus> {
    const cacheKey = `sync:status:${integrationId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const status = await this.getSyncStatusFromDB(integrationId);
    await this.redis.setex(cacheKey, 60, JSON.stringify(status)); // 1 min
    
    return status;
  }
  
  // Queue de sincronização
  async queueSyncJob(integrationId: string, entity: string): Promise<void> {
    const job = {
      integrationId,
      entity,
      timestamp: new Date(),
      priority: 'normal'
    };
    
    await this.redis.lpush('sync:queue', JSON.stringify(job));
  }
}
```

### **Benefícios**
- ✅ Dados de integração em cache
- ✅ Status de sincronização em tempo real
- ✅ Queue de jobs de sincronização
- ✅ Redução de chamadas para APIs externas

## 🎯 **7. Cache de Configurações**

### **Problema Atual**
- Configurações sempre do banco
- Sem cache de preferências de usuário
- Configurações de empresa lentas

### **Solução com Redis**
```typescript
@Injectable()
export class ConfigCacheService {
  // Cache de configurações da empresa
  async getCompanyConfig(companyId: string): Promise<CompanyConfig> {
    const cacheKey = `config:company:${companyId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const config = await this.companyService.getConfig(companyId);
    await this.redis.setex(cacheKey, 3600, JSON.stringify(config)); // 1 hora
    
    return config;
  }
  
  // Cache de preferências do usuário
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const cacheKey = `preferences:user:${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const preferences = await this.userService.getPreferences(userId);
    await this.redis.setex(cacheKey, 1800, JSON.stringify(preferences)); // 30 min
    
    return preferences;
  }
  
  // Invalidação de cache
  async invalidateCompanyCache(companyId: string): Promise<void> {
    const keys = await this.redis.keys(`*:${companyId}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

## 📊 **Métricas de Performance Esperadas**

### **Antes do Redis**
- ⏱️ Tempo de resposta: 200-500ms
- 🗄️ Queries por segundo: 100-200
- 💾 Uso de memória: 2-4GB
- 🔄 Taxa de cache hit: 0%

### **Depois do Redis**
- ⏱️ Tempo de resposta: 50-100ms (60-80% melhoria)
- 🗄️ Queries por segundo: 500-1000 (5x melhoria)
- 💾 Uso de memória: 1-2GB (50% redução)
- 🔄 Taxa de cache hit: 70-90%

## 🚀 **Plano de Implementação**

### **Fase 1: Infraestrutura**
1. ✅ Instalar dependências Redis
2. ✅ Configurar Docker Redis
3. ✅ Implementar CacheModule
4. ✅ Configurar variáveis de ambiente

### **Fase 2: Cache Básico**
1. ✅ Cache de sessões JWT
2. ✅ Cache de produtos e categorias
3. ✅ Cache de configurações de empresa
4. ✅ Rate limiting com Redis

### **Fase 3: Cache Avançado**
1. ✅ Notificações em tempo real
2. ✅ Cache de métricas e dashboards
3. ✅ Cache de integrações
4. ✅ Invalidação inteligente

### **Fase 4: Otimização**
1. ✅ Monitoramento de cache
2. ✅ Métricas de performance
3. ✅ Tuning de TTL
4. ✅ Clustering Redis

## 🔧 **Configuração Técnica**

### **Docker Compose**
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}

volumes:
  redis_data:
```

### **Variáveis de Ambiente**
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password
REDIS_DB=0
REDIS_TTL=3600

# Cache Configuration
CACHE_TTL_PRODUCTS=1800
CACHE_TTL_CATEGORIES=3600
CACHE_TTL_USERS=1800
CACHE_TTL_COMPANIES=3600
CACHE_TTL_METRICS=300
```

## 📈 **ROI Esperado**

### **Benefícios Quantitativos**
- 🚀 **60-80% redução** no tempo de resposta
- 💰 **50% redução** no custo de infraestrutura
- 📊 **5x aumento** na capacidade de requisições
- 🔄 **70-90% cache hit rate**

### **Benefícios Qualitativos**
- 😊 **Melhor experiência** do usuário
- 🛡️ **Maior segurança** com controle de sessões
- 📱 **Notificações em tempo real**
- 🔧 **Facilidade de manutenção**

## 🎯 **Próximos Passos**

1. **Implementar infraestrutura Redis**
2. **Configurar CacheModule no NestJS**
3. **Implementar cache de sessões**
4. **Adicionar cache de consultas frequentes**
5. **Implementar rate limiting**
6. **Configurar notificações em tempo real**
7. **Adicionar métricas de cache**
8. **Otimizar TTLs baseado em uso**

---

**Resultado**: Sistema 5x mais rápido, com melhor experiência do usuário e maior escalabilidade! 🚀
