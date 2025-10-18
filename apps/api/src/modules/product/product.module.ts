import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { DatabaseModule } from '../../database/database.module';
import { NotificationModule } from '../notification/notification.module';
import { AuthContextService } from '../../common/services/auth-context.service';
import { QueryCacheService } from '../../common/cache/query-cache.service';

@Module({
  imports: [DatabaseModule, NotificationModule],
  controllers: [ProductController],
  providers: [ProductService, AuthContextService, QueryCacheService],
  exports: [ProductService],
})
export class ProductModule {}
