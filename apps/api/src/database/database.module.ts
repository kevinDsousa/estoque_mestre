import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ErrorLogsPrismaService } from './error-logs-prisma.service';

@Global()
@Module({
  providers: [PrismaService, ErrorLogsPrismaService],
  exports: [PrismaService, ErrorLogsPrismaService],
})
export class DatabaseModule {}
