import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.API_PORT!, 10),
  globalPrefix: 'api',
  version: 'v1',
  environment: process.env.NODE_ENV!,
  frontendUrl: process.env.FRONTEND_URL!,
  enableSwagger: true,
  prometheus: {
    username: 'prometheus',
    password: 'prometheus123',
  },
}));
