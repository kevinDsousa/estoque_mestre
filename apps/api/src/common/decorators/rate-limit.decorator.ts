import { SetMetadata } from '@nestjs/common';
import { RateLimitOptions } from '../guards/redis-rate-limit.guard';

export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Decorator para configurar rate limiting em endpoints específicos
 * 
 * @param options Configurações do rate limit
 * @example
 * @RateLimit({ limit: 10, windowSeconds: 60 }) // 10 requisições por minuto
 * @RateLimit({ 
 *   limit: 5, 
 *   windowSeconds: 900,
 *   keyGenerator: (context) => `custom:${context.switchToHttp().getRequest().ip}`
 * })
 */
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

/**
 * Rate limit para endpoints de autenticação
 */
export const AuthRateLimit = () => RateLimit({
  limit: 5,
  windowSeconds: 900, // 15 minutos
});

/**
 * Rate limit para endpoints de registro
 */
export const RegisterRateLimit = () => RateLimit({
  limit: 3,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de reset de senha
 */
export const PasswordResetRateLimit = () => RateLimit({
  limit: 3,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de upload de arquivos
 */
export const FileUploadRateLimit = () => RateLimit({
  limit: 10,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de relatórios
 */
export const ReportRateLimit = () => RateLimit({
  limit: 20,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de integração
 */
export const IntegrationRateLimit = () => RateLimit({
  limit: 100,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de notificação
 */
export const NotificationRateLimit = () => RateLimit({
  limit: 50,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de API externa
 */
export const ExternalApiRateLimit = () => RateLimit({
  limit: 1000,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de webhook
 */
export const WebhookRateLimit = () => RateLimit({
  limit: 100,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de métricas
 */
export const MetricsRateLimit = () => RateLimit({
  limit: 200,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de admin
 */
export const AdminRateLimit = () => RateLimit({
  limit: 50,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de usuário
 */
export const UserRateLimit = () => RateLimit({
  limit: 100,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de produto
 */
export const ProductRateLimit = () => RateLimit({
  limit: 100,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de categoria
 */
export const CategoryRateLimit = () => RateLimit({
  limit: 50,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de fornecedor
 */
export const SupplierRateLimit = () => RateLimit({
  limit: 50,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de cliente
 */
export const CustomerRateLimit = () => RateLimit({
  limit: 50,
  windowSeconds: 3600, // 1 hora
});

/**
 * Rate limit para endpoints de transação
 */
export const TransactionRateLimit = () => RateLimit({
  limit: 200,
  windowSeconds: 3600, // 1 hora
});
