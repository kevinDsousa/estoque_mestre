import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('[DEBUG] Starting simple bootstrap...');
  
  try {
    const app = await NestFactory.create(AppModule);
    console.log('[DEBUG] App created successfully');
    
    const port = 3003;
    console.log('[DEBUG] About to listen on port:', port);
    
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}/api`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
    
  } catch (error) {
    console.error('[ERROR] Bootstrap failed:', error);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
