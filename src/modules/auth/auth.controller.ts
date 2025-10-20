import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'ثبت‌نام کاربر جدید' })
  @ApiResponse({ status: 201, description: 'کاربر با موفقیت ثبت‌نام شد' })
  @ApiResponse({ status: 409, description: 'کاربر با این ایمیل قبلاً ثبت‌نام کرده است' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'ورود کاربر' })
  @ApiResponse({ status: 200, description: 'ورود موفقیت‌آمیز' })
  @ApiResponse({ status: 401, description: 'ایمیل یا رمز عبور اشتباه است' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'تولید توکن جدید با استفاده از Refresh Token' })
  @ApiResponse({ status: 200, description: 'توکن جدید با موفقیت تولید شد' })
  @ApiResponse({ status: 401, description: 'توکن نامعتبر یا منقضی شده است' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
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
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'ورود با Google OAuth' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth Callback' })
  async googleAuthCallback(@Req() req) {
    return this.authService.googleLogin(req.user);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({
    summary: 'درخواست بازیابی رمز عبور',
    description: 'ارسال لینک بازیابی رمز عبور به ایمیل کاربر'
  })
  @ApiResponse({
    status: 200,
    description: 'لینک بازیابی ارسال شد',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'اگر ایمیل در سیستم موجود باشد، لینک بازیابی ارسال شد'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'داده‌های ورودی نامعتبر است'
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({
    summary: 'بازیابی رمز عبور با توکن',
    description: 'تغییر رمز عبور با استفاده از توکن دریافتی از ایمیل'
  })
  @ApiResponse({
    status: 200,
    description: 'رمز عبور با موفقیت تغییر کرد',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'رمز عبور با موفقیت تغییر کرد'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'توکن نامعتبر یا منقضی شده است'
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}

