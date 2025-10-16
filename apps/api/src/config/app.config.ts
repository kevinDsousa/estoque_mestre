import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.API_PORT || '3003', 10),
  globalPrefix: process.env.API_GLOBAL_PREFIX || 'api',
  version: process.env.API_VERSION || 'v1',
  environment: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  enableSwagger: (process.env.ENABLE_SWAGGER || 'true') === 'true',
}));
