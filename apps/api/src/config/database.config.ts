import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  errorLogsUrl: process.env.ERROR_LOGS_DB_URL || process.env.DATABASE_URL,
}));
