import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'تولید توکن جدید با استفاده از Refresh Token' })
  @ApiResponse({ status: 200, description: 'توکن جدید با موفقیت تولید شد' })
  @ApiResponse({ status: 401, description: 'توکن نامعتبر یا منقضی شده است' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'ورود به سیستم با ایمیل و رمز عبور (فقط پنل ادمین)',
    description:
      'این مسیر فقط برای کاربران با نقش ADMIN یا SUPER_ADMIN فعال است. کاربران عادی باید از OTP موبایل استفاده کنند.',
  })
  @ApiResponse({
    status: 200,
    description: 'ورود با موفقیت انجام شد',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'JWT Access Token' },
        refreshToken: { type: 'string', description: 'JWT Refresh Token' },
        user: { type: 'object', description: 'اطلاعات کاربر' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'ورود با رمز عبور مجاز نیست یا ایمیل/رمز اشتباه است' })
  @ApiResponse({ status: 400, description: 'داده‌های ورودی نامعتبر است' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'خروج از حساب کاربری' })
  @ApiResponse({ status: 200, description: 'خروج با موفقیت انجام شد' })
  async logout(@CurrentUser('id') userId: string, @Body() body: RefreshTokenDto) {
    return this.authService.logout(userId, body.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'دریافت اطلاعات کاربر جاری' })
  @ApiResponse({ status: 200, description: 'اطلاعات کاربر' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({
    summary: 'درخواست بازیابی رمز عبور',
    description:
      'ارسال لینک بازیابی رمز عبور به ایمیل کاربر. فقط برای حساب‌های ادمین که پسورد دارند.',
  })
  @ApiResponse({
    status: 200,
    description: 'لینک بازیابی ارسال شد (در صورت وجود ایمیل)',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'اگر ایمیل در سیستم موجود باشد، لینک بازیابی ارسال شد',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'داده‌های ورودی نامعتبر است' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({
    summary: 'بازیابی رمز عبور با توکن',
    description: 'تغییر رمز عبور با استفاده از توکن دریافتی از ایمیل بازیابی رمز عبور',
  })
  @ApiResponse({
    status: 200,
    description: 'رمز عبور با موفقیت تغییر کرد',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'رمز عبور با موفقیت تغییر کرد' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'توکن نامعتبر یا منقضی شده است' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('send-otp')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary: 'ارسال کد تأیید OTP به موبایل (Mock)',
    description:
      'ارسال کد Mock به شماره موبایل برای ورود/ثبت‌نام. در محیط تست، کد همیشه 12345 است و در لاگ سرور ثبت می‌شود.',
  })
  @ApiResponse({
    status: 200,
    description: 'کد تأیید با موفقیت ارسال شد',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'کد تأیید ارسال شد' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'شماره موبایل نامعتبر است' })
  @ApiResponse({ status: 429, description: 'تعداد درخواست بیش از حد مجاز' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Public()
  @Post('verify-otp')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'تأیید کد OTP و ورود',
    description:
      'تأیید کد Mock (12345) و دریافت توکن‌های دسترسی. در صورت موفقیت، کاربر (یا ایجاد می‌شود) و توکن‌ها برگردانده می‌شوند.',
  })
  @ApiResponse({
    status: 200,
    description: 'کد تأیید شد و کاربر احراز هویت شد',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object', description: 'اطلاعات کاربر' },
        accessToken: { type: 'string', description: 'JWT Access Token' },
        refreshToken: { type: 'string', description: 'JWT Refresh Token' },
        isNewUser: { type: 'boolean', description: 'آیا کاربر جدید است یا خیر', example: false },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'کد تأیید نامعتبر است' })
  @ApiResponse({ status: 401, description: 'حساب کاربری غیرفعال است' })
  @ApiResponse({ status: 429, description: 'تعداد درخواست بیش از حد مجاز' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }
}
