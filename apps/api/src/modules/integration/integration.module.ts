import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { DatabaseModule } from '../../database/database.module';
import { AuthContextService } from '../../common/services/auth-context.service';

@Module({
  imports: [DatabaseModule],
  controllers: [IntegrationController],
  providers: [IntegrationService, AuthContextService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
