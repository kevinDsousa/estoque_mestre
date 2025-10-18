import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DatabaseModule } from '../../database/database.module';
import { AuthContextService } from '../../common/services/auth-context.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ReportsController],
  providers: [ReportsService, AuthContextService],
  exports: [ReportsService],
})
export class ReportsModule {}
