import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => ({
  ttl: parseInt(process.env.API_THROTTLE_TTL || '60', 10),
  limit: parseInt(process.env.API_THROTTLE_LIMIT || '100', 10),
}));
