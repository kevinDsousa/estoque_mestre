import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get('redis');
        
        try {
          // Tenta usar Redis se disponível
          const { redisStore } = await import('cache-manager-redis-store');
          
          return {
            store: redisStore as any,
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password || undefined,
            db: redisConfig.db,
            ttl: redisConfig.ttl,
            // Configurações adicionais
            retryDelayOnFailover: 100,
            enableReadyCheck: false,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
          };
        } catch (error) {
          // Fallback para cache em memória se Redis não estiver disponível
          console.warn('Redis not available, using in-memory cache');
          return {
            ttl: redisConfig.ttl,
            max: 100,
          };
        }
      },
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
