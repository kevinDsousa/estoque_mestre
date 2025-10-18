import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_SERVICE_HOST || process.env.SMTP_HOST,
  port: parseInt(process.env.EMAIL_SERVICE_PORT || process.env.SMTP_PORT || '587', 10),
  user: process.env.EMAIL_SERVICE_USER || process.env.SMTP_USER,
  password: process.env.EMAIL_SERVICE_PASSWORD || process.env.SMTP_PASS,
  from: process.env.EMAIL_FROM || process.env.SMTP_FROM || 'no-reply@estoquemestre.com',
  secure: process.env.EMAIL_SERVICE_SECURE === 'true' || process.env.SMTP_SECURE === 'true',
}));
