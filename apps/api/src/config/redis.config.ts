import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  // Cache TTLs específicos
  cache: {
    products: parseInt(process.env.CACHE_TTL_PRODUCTS || '1800', 10), // 30 min
    categories: parseInt(process.env.CACHE_TTL_CATEGORIES || '3600', 10), // 1 hora
    users: parseInt(process.env.CACHE_TTL_USERS || '1800', 10), // 30 min
    companies: parseInt(process.env.CACHE_TTL_COMPANIES || '3600', 10), // 1 hora
    metrics: parseInt(process.env.CACHE_TTL_METRICS || '300', 10), // 5 min
    sessions: parseInt(process.env.CACHE_TTL_SESSIONS || '3600', 10), // 1 hora
    notifications: parseInt(process.env.CACHE_TTL_NOTIFICATIONS || '1800', 10), // 30 min
    integrations: parseInt(process.env.CACHE_TTL_INTEGRATIONS || '600', 10), // 10 min
  },
}));
