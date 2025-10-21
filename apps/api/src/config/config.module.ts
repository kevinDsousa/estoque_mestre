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
        NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
        // App
        API_PORT: Joi.number().required(),
        FRONTEND_URL: Joi.string().uri().required(),
        // Database
        DATABASE_URL: Joi.string().uri().required(),
        ERROR_LOGS_DB_URL: Joi.string().uri().required(),
        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
      }),
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
