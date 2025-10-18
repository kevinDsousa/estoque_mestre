import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitCacheService } from '../cache/rate-limit-cache.service';
import { AuthContextService } from '../services/auth-context.service';

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
  keyGenerator?: (context: ExecutionContext) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

@Injectable()
export class RedisRateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rateLimitService: RateLimitCacheService,
    private authContextService: AuthContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Obter configurações de rate limit
    const options = this.getRateLimitOptions(context);
    if (!options) {
      return true; // Sem rate limit configurado
    }

    // Gerar chave única para o rate limit
    const key = this.generateKey(context, options);
    
    // Verificar rate limit
    const result = await this.rateLimitService.checkRateLimit(
      key,
      options.limit,
      options.windowSeconds,
    );

    // Adicionar headers de rate limit
    response.setHeader('X-RateLimit-Limit', options.limit);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      throw new HttpException(
        {
          message: 'Rate limit exceeded',
          limit: options.limit,
          remaining: result.remaining,
          resetTime: result.resetTime,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getRateLimitOptions(context: ExecutionContext): RateLimitOptions | null {
    // Verificar se há decorator de rate limit no método
    const methodOptions = this.reflector.get<RateLimitOptions>('rateLimit', context.getHandler());
    if (methodOptions) {
      return methodOptions;
    }

    // Verificar se há decorator de rate limit na classe
    const classOptions = this.reflector.get<RateLimitOptions>('rateLimit', context.getClass());
    if (classOptions) {
      return classOptions;
    }

    // Rate limit padrão baseado no endpoint
    const request = context.switchToHttp().getRequest();
    const endpoint = request.route?.path || request.url;
    
    return this.getDefaultRateLimit(endpoint);
  }

  private getDefaultRateLimit(endpoint: string): RateLimitOptions | null {
    // Rate limits padrão por endpoint
    const defaultLimits: Record<string, RateLimitOptions> = {
      '/auth/login': { limit: 5, windowSeconds: 900 }, // 5 tentativas em 15 minutos
      '/auth/register': { limit: 3, windowSeconds: 3600 }, // 3 tentativas em 1 hora
      '/auth/forgot-password': { limit: 3, windowSeconds: 3600 }, // 3 tentativas em 1 hora
      '/auth/reset-password': { limit: 3, windowSeconds: 3600 }, // 3 tentativas em 1 hora
      '/auth/verify-email': { limit: 5, windowSeconds: 3600 }, // 5 tentativas em 1 hora
      '/products': { limit: 100, windowSeconds: 3600 }, // 100 requisições em 1 hora
      '/categories': { limit: 50, windowSeconds: 3600 }, // 50 requisições em 1 hora
      '/suppliers': { limit: 50, windowSeconds: 3600 }, // 50 requisições em 1 hora
      '/customers': { limit: 50, windowSeconds: 3600 }, // 50 requisições em 1 hora
      '/transactions': { limit: 200, windowSeconds: 3600 }, // 200 requisições em 1 hora
      '/reports': { limit: 20, windowSeconds: 3600 }, // 20 requisições em 1 hora
      '/integrations': { limit: 100, windowSeconds: 3600 }, // 100 requisições em 1 hora
      '/notifications': { limit: 50, windowSeconds: 3600 }, // 50 requisições em 1 hora
    };

    // Encontrar o rate limit mais específico
    for (const [pattern, options] of Object.entries(defaultLimits)) {
      if (endpoint.startsWith(pattern)) {
        return options;
      }
    }

    // Rate limit padrão para outros endpoints
    return { limit: 100, windowSeconds: 3600 };
  }

  private generateKey(context: ExecutionContext, options: RateLimitOptions): string {
    const request = context.switchToHttp().getRequest();
    
    // Se há um gerador de chave customizado, usar ele
    if (options.keyGenerator) {
      return options.keyGenerator(context);
    }

    // Tentar obter contexto de autenticação
    const authContext = this.authContextService.getAuthContext();
    
    if (authContext?.userId) {
      // Rate limit por usuário
      const endpoint = request.route?.path || request.url;
      return `rate_limit:user:${authContext.userId}:${endpoint}`;
    } else if (authContext?.companyId) {
      // Rate limit por empresa
      const endpoint = request.route?.path || request.url;
      return `rate_limit:company:${authContext.companyId}:${endpoint}`;
    } else {
      // Rate limit por IP
      const ip = request.ip || request.connection.remoteAddress;
      const endpoint = request.route?.path || request.url;
      return `rate_limit:ip:${ip}:${endpoint}`;
    }
  }
}
