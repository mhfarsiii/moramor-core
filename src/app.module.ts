import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

// Core Modules
import { PrismaModule } from './common/prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UploadModule } from './modules/upload/upload.module';
import { PaymentModule } from './modules/payment/payment.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: configService.get<number>('THROTTLE_LIMIT', 10),
        },
      ],
      inject: [ConfigService],
    }),

    // Email Configuration
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mailHost = configService.get<string>('MAIL_HOST', 'smtp.gmail.com');
        const mailPort = configService.get<number>('MAIL_PORT', 587);
        const mailUser = configService.get<string>('MAIL_USER');
        const mailPass = configService.get<string>('MAIL_PASS');
        const mailFromAddress = configService.get<string>(
          'MAIL_FROM_ADDRESS',
          mailUser || 'noreply@moramor.com',
        );
        const mailFromName = configService.get<string>('MAIL_FROM_NAME', 'Moramor Store');

        // Determine template directory path - works in both dev and production
        // Use project root to find src/templates, which works regardless of where code is running from
        const templateDir = join(process.cwd(), 'src', 'templates');

        // Set secure to true for port 465 (SSL/TLS), false for other ports (STARTTLS)
        const isSecure = mailPort === 465;

        return {
          transport: {
            host: mailHost,
            port: mailPort,
            secure: isSecure,
            connectionTimeout: 10000, // 10 seconds connection timeout
            greetingTimeout: 10000, // 10 seconds greeting timeout
            socketTimeout: 10000, // 10 seconds socket timeout
            ...(mailUser &&
              mailPass && {
                auth: {
                  user: mailUser,
                  pass: mailPass,
                },
              }),
          },
          defaults: {
            from: mailFromAddress
              ? `"${mailFromName}" <${mailFromAddress}>`
              : `"${mailFromName}" <noreply@moramor.com>`,
          },
          template: {
            dir: templateDir,
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),

    // Core
    PrismaModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    CheckoutModule,
    AddressesModule,
    WishlistModule,
    ReviewsModule,
    UploadModule,
    PaymentModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
