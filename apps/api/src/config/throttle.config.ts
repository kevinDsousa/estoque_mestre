import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => ({
  ttl: parseInt(process.env.API_THROTTLE_TTL, 10) || 60,
  limit: parseInt(process.env.API_THROTTLE_LIMIT, 10) || 100,
}));
