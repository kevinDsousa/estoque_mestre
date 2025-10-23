import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: configService.get<string>('app.frontendUrl'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  console.log('[SWAGGER] Setting up Swagger...');
  if (configService.get<boolean>('app.enableSwagger')) {
    try {
      console.log('[SWAGGER] Building Swagger config...');
      const config = new DocumentBuilder()
        .setTitle('Estoque Mestre API')
        .setDescription('API para sistema de gestão de estoque')
        .setVersion('1.0')
        .setContact('Estoque Mestre', 'contato@estoquemestre.com', '')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .addServer('http://localhost:3000/api', 'Development server')
        .build();

      console.log('[SWAGGER] Creating Swagger document...');
      const document = SwaggerModule.createDocument(app, config);
      console.log('[SWAGGER] Setting up Swagger UI...');
      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
      });
      console.log('[SWAGGER] Swagger setup complete');
    } catch (error) {
      console.error('[ERROR] Error setting up Swagger:', error);
    }
  }

  // Start server
  const port = configService.get<number>('app.port') || 3000;
  console.log('[SERVER] Starting server on port ' + port + '...');
  
  try {
    await app.listen(port, '0.0.0.0');
    console.log('[SERVER] Application is running on: http://localhost:' + port + '/api');
    if (configService.get<boolean>('app.enableSwagger')) {
      console.log('[SWAGGER] Documentation: http://localhost:' + port + '/api/docs');
    }
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('[ERROR] Failed to bootstrap application:', error);
  process.exit(1);
});
