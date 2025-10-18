import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { CustomerModule } from './modules/customer/customer.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UserModule } from './modules/user/user.module';
import { NotificationModule } from './modules/notification/notification.module';
import { MinioModule } from './modules/minio/minio.module';
import { ImageModule } from './modules/image/image.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { SubscriptionPlanModule } from './modules/subscription-plan/subscription-plan.module';
import { ErrorLoggingModule } from './modules/error-logging/error-logging.module';
import { EmailModule } from './modules/email/email.module';
import { LocationModule } from './modules/location/location.module';
import { QualityModule } from './modules/quality/quality.module';
import { AdminModule } from './modules/admin/admin.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MetricsModule } from './common/modules/metrics.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuthContextInterceptor } from './common/interceptors/auth-context.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggerService } from './common/logger/logger.service';
import { DatabaseHealthCheckService } from './database/health-check.service';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: (configService.get('throttle.ttl') || 60) * 1000,
            limit: configService.get('throttle.limit') || 100,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    CompanyModule,
    ProductModule,
    CategoryModule,
    SupplierModule,
    CustomerModule,
    TransactionModule,
          UserModule,
          NotificationModule,
          MinioModule,
          ImageModule,
          StripeModule,
          PaymentModule,
          SubscriptionModule,
          SubscriptionPlanModule,
          ErrorLoggingModule,
          EmailModule,
          LocationModule,
          QualityModule,
          AdminModule,
          IntegrationModule,
          ReportsModule,
          MetricsModule,
        ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggerService,
    DatabaseHealthCheckService,
          {
            provide: APP_INTERCEPTOR,
            useClass: AuthContextInterceptor,
          },
          {
            provide: APP_INTERCEPTOR,
            useClass: MetricsInterceptor,
          },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ResponseInterceptor,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor,
    // },
    // {
    //   provide: APP_FILTER,
    //   useClass: GlobalExceptionFilter,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: CustomThrottlerGuard,
    // },
  ],
})
export class AppModule {}
