import { Controller, Post, Body, Get, Query, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { VerifyPaymentQueryDto } from './dto/verify-payment-query.dto';
import { PaymentVerifyResponseDto } from './dto/payment-verify-response.dto';
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
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  @ApiOperation({
    summary: 'تایید پرداخت',
    description:
      'فرانت‌اند پس از بازگشت کاربر از درگاه (صفحه /checkout/verify) این endpoint را با Authority و Status فراخوانی می‌کند.',
  })
  @ApiResponse({ status: 200, description: 'نتیجه تایید پرداخت', type: PaymentVerifyResponseDto })
  @ApiResponse({ status: 400, description: 'پرداخت ناموفق بود' })
  verifyPayment(@Query() query: VerifyPaymentQueryDto): Promise<PaymentVerifyResponseDto> {
    return this.checkoutService.verifyPayment(query.Authority, query.Status);
  }
}
