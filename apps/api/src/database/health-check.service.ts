import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class DatabaseHealthCheckService {
  constructor(private prisma: PrismaService) {}

  async check(): Promise<{ ok: boolean }> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  }
}



