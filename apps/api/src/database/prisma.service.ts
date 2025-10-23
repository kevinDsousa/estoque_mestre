import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      console.log('🔌 Connecting to database...');
      // Add timeout for connection
      const connectPromise = this.$connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 5000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Error connecting to database:', error.message);
      console.warn('⚠️  Application will start without database connection');
      // Don't throw - allow app to start even without DB
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }
}
