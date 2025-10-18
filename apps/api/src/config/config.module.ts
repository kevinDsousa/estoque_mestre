import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import minioConfig from './minio.config';
import redisConfig from './redis.config';
import stripeConfig from './stripe.config';
import throttleConfig from './throttle.config';
import emailConfig from './email.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        minioConfig,
        redisConfig,
        stripeConfig,
        throttleConfig,
        emailConfig,
      ],
      envFilePath: ['.env.local', '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        // App
        API_PORT: Joi.number().default(3003),
        API_GLOBAL_PREFIX: Joi.string().default('api'),
        FRONTEND_URL: Joi.string().uri().default('http://localhost:4200'),
        ENABLE_SWAGGER: Joi.boolean().default(true),
        // Database
        DATABASE_URL: Joi.string().uri().required(),
        ERROR_LOGS_DB_URL: Joi.string().uri().required(),
        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
        // Throttle
        API_THROTTLE_TTL: Joi.number().default(60),
        API_THROTTLE_LIMIT: Joi.number().default(100),
        // MinIO
        MINIO_ENDPOINT: Joi.string().default('localhost'),
        MINIO_PORT: Joi.number().default(9000),
        MINIO_USE_SSL: Joi.boolean().default(false),
        MINIO_ACCESS_KEY: Joi.string().default('minioadmin'),
        MINIO_SECRET_KEY: Joi.string().default('minioadmin'),
        MINIO_BUCKET_NAME: Joi.string().default('estoque-mestre'),
        // Stripe (optional in dev)
        STRIPE_SECRET_KEY: Joi.string().allow('').default(''),
        STRIPE_PUBLISHABLE_KEY: Joi.string().allow('').default(''),
        STRIPE_WEBHOOK_SECRET: Joi.string().allow('').default(''),
        // Redis
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().allow('').default(''),
        REDIS_DB: Joi.number().default(0),
        REDIS_TTL: Joi.number().default(3600),
        CACHE_TTL_PRODUCTS: Joi.number().default(1800),
        CACHE_TTL_CATEGORIES: Joi.number().default(3600),
        CACHE_TTL_USERS: Joi.number().default(1800),
        CACHE_TTL_COMPANIES: Joi.number().default(3600),
        CACHE_TTL_METRICS: Joi.number().default(300),
        CACHE_TTL_SESSIONS: Joi.number().default(3600),
        CACHE_TTL_NOTIFICATIONS: Joi.number().default(1800),
        CACHE_TTL_INTEGRATIONS: Joi.number().default(600),
      }),
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
