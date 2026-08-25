import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global prefix: all routes under /api/v1
  app.setGlobalPrefix('api/v1');

  // Security headers
  app.use(helmet());

  // CORS
  const allowedOrigins = configService.get<string[]>('cors.allowedOrigins') || [
    'http://localhost:5173',
  ];
  app.enableCors({
    origin: allowedOrigins,
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

  const port = configService.get<number>('port') || 4000;
  await app.listen(port);

  console.log(`🏛️  CoalMine Governance API running on http://localhost:${port}/api/v1`);
}

bootstrap();
