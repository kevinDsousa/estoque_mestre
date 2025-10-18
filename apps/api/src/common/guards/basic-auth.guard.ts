import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Basic authentication required');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    const expectedUsername = this.configService.get<string>('PROMETHEUS_USERNAME', 'prometheus');
    const expectedPassword = this.configService.get<string>('PROMETHEUS_PASSWORD', 'prometheus123');

    if (username !== expectedUsername || password !== expectedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }
}
