import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ErrorLogsPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.ERROR_LOGS_DB_URL || process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      console.log('🔌 Connecting to error logs database...');
      const connectPromise = this.$connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Error logs database connection timeout')), 5000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      console.log('✅ Error logs database connected successfully');
    } catch (error) {
      console.error('❌ Error connecting to error logs database:', error.message);
      console.warn('⚠️  Application will start without error logs database connection');
      // Don't throw - allow app to start even without DB
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      console.error('Error disconnecting from error logs database:', error);
    }
  }
}
