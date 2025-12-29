import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

// Handle unhandled promise rejections to prevent server crashes
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Handle uncaught exceptions to prevent server crashes
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global exception filter to catch all errors
  app.useGlobalFilters(new AllExceptionsFilter());

  // Security
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );
  app.use(compression());

  // CORS - Enhanced configuration for development and production
  const isDevelopment = configService.get('NODE_ENV') === 'development';
  const corsOrigin = configService.get('CORS_ORIGIN');

  // Build allowed origins list
  let allowedOrigins:
    | string[]
    | boolean
    | ((
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => void);

  if (isDevelopment) {
    // In development, allow common localhost ports
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite default
      'http://localhost:5174',
      'http://localhost:8080',
      'http://localhost:4200', // Angular default
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      ...(corsOrigin ? corsOrigin.split(',').map((origin) => origin.trim()) : []),
    ];
    allowedOrigins = devOrigins;
    console.log('🌍 CORS: Development mode - Allowed origins:', devOrigins);
  } else {
    // Production mode
    if (corsOrigin === '*') {
      allowedOrigins = true;
      console.log('🌍 CORS: Production mode - Allowing all origins (*)');
    } else if (corsOrigin) {
      const origins = corsOrigin
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
      allowedOrigins = origins;
      console.log('🌍 CORS: Production mode - Allowed origins:', origins);
    } else {
      // If CORS_ORIGIN is not set in production, use dynamic origin validation
      // This allows origins that match common patterns
      allowedOrigins = (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          return callback(null, true);
        }

        // Log the origin for debugging
        console.log('🌍 CORS: Checking origin:', origin);

        // In production without CORS_ORIGIN set, allow all origins
        // This is a fallback - ideally CORS_ORIGIN should be set
        console.warn(
          '⚠️  CORS_ORIGIN not set in production - allowing all origins. Please set CORS_ORIGIN for security.',
        );
        callback(null, true);
      };
    }
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Authorization', 'Content-Length', 'X-Foo', 'X-Bar'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  });

  // Validation
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

  // API Prefix & Versioning
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Moramor Accessory Store API')
    .setDescription(
      'Complete RESTful API for Moramor - An online accessory store with products, cart, checkout, payment, and admin features',
    )
    .setVersion('1.0')
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Products', 'Product management and listing')
    .addTag('Categories', 'Category management')
    .addTag('Cart', 'Shopping cart operations')
    .addTag('Orders', 'Order management and history')
    .addTag('Checkout', 'Checkout and payment processing')
    .addTag('Addresses', 'User address management')
    .addTag('Wishlist', 'User wishlist management')
    .addTag('Reviews', 'Product reviews and ratings')
    .addTag('Admin', 'Admin panel operations')
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Moramor API Docs',
    customfavIcon: 'https://moramor.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`
  🚀 Application is running on: http://localhost:${port}
  📚 API Documentation: http://localhost:${port}/api-docs
  🔗 API Endpoint: http://localhost:${port}/${apiPrefix}
  `);
}

bootstrap();
