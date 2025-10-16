import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ErrorLoggingService } from './error-logging.service';
import { ErrorLoggingController } from './error-logging.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ErrorLoggingService],
  controllers: [ErrorLoggingController],
  exports: [ErrorLoggingService],
})
export class ErrorLoggingModule {}
