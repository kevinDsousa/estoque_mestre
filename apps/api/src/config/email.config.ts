import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_SERVICE_HOST,
  port: parseInt(process.env.EMAIL_SERVICE_PORT || '587', 10),
  user: process.env.EMAIL_SERVICE_USER,
  password: process.env.EMAIL_SERVICE_PASSWORD,
  from: process.env.EMAIL_FROM || 'no-reply@estoquemestre.com',
  secure: process.env.EMAIL_SERVICE_SECURE === 'true',
}));
