import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'شروع فرآیند خرید و پرداخت' })
  @ApiResponse({ status: 201, description: 'درخواست خرید با موفقیت ایجاد شد' })
  @ApiResponse({ status: 400, description: 'خطا در ایجاد درخواست' })
  checkout(@CurrentUser('id') userId: string, @Body() checkoutDto: CreateCheckoutDto) {
    return this.checkoutService.checkout(userId, checkoutDto);
  }

  @Public()
  @Get('verify')
  @ApiOperation({ summary: 'تایید پرداخت (callback از درگاه)' })
  @ApiResponse({ status: 200, description: 'پرداخت تایید شد' })
  @ApiResponse({ status: 400, description: 'پرداخت ناموفق بود' })
  async verifyPayment(@Query('Authority') authority: string, @Query('Status') status: string) {
    const result = await this.checkoutService.verifyPayment(authority, status);

    // In production, redirect to frontend with result
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>نتیجه پرداخت</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Vazir', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            text-align: center;
            padding: 50px;
          }
          .success {
            color: green;
          }
          .error {
            color: red;
          }
        </style>
      </head>
      <body>
        <h1 class="success">پرداخت موفق</h1>
        <p>شماره سفارش: ${result.orderNumber}</p>
        <p>کد پیگیری: ${result.refId}</p>
        <p>در حال انتقال به صفحه اصلی...</p>
        <script>
          setTimeout(() => {
            window.location.href = '${process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:3001'}/orders/${result.orderId}';
          }, 3000);
        </script>
      </body>
      </html>
    `;
  }
}
