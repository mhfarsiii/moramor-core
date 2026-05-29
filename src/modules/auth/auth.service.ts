import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { MailService } from './mail.service';

const MOCK_OTP = '12345';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async refreshTokens(refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('توکن نامعتبر است');
      }

      if (new Date() > storedToken.expiresAt) {
        await this.prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new UnauthorizedException('توکن منقضی شده است');
      }

      const tokens = await this.generateTokens(
        storedToken.user.id,
        storedToken.user.phoneNumber,
        storedToken.user.role,
        storedToken.user.email,
      );

      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      await this.storeRefreshToken(storedToken.user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('توکن نامعتبر یا منقضی شده است');
    }
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return { message: 'خروج با موفقیت انجام شد' };
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authenticate user with email and password.
   * This flow is intended only for admin panel users (ADMIN/SUPER_ADMIN).
   */
  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException(
        'ورود با رمز عبور فقط برای پنل ادمین مجاز است. لطفاً از ورود با کد یک‌بارمصرف استفاده کنید.',
      );
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'این حساب کاربری با رمز عبور قابل ورود نیست. لطفاً از روش دیگری استفاده کنید',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    const tokens = await this.generateTokens(user.id, user.phoneNumber, user.role, user.email);

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    this.logger.log(`Admin user logged in successfully with password: ${normalizedEmail}`);

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        this.logger.warn(`Password reset requested for non-existent email: ${normalizedEmail}`);
        return { message: 'اگر ایمیل در سیستم موجود باشد، لینک بازیابی ارسال شد' };
      }

      if (!user.password) {
        this.logger.warn(`Password reset requested for user without password: ${normalizedEmail}`);
        return { message: 'اگر ایمیل در سیستم موجود باشد، لینک بازیابی ارسال شد' };
      }

      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        this.logger.warn(
          `Password reset requested for non-admin user via password flow: ${normalizedEmail}`,
        );
        return { message: 'اگر ایمیل در سیستم موجود باشد، لینک بازیابی ارسال شد' };
      }

      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      const resetToken = randomBytes(32).toString('hex');
      const expiresAt = this._parseExpirationToDate(
        this.configService.get<string>('PASSWORD_RESET_EXPIRATION', '2h'),
      );

      await this.prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt,
        },
      });

      await this.mailService.sendPasswordResetEmail(user.email!, resetToken, user.name);

      this.logger.log(`Password reset email sent to: ${email}`);

      return { message: 'اگر ایمیل در سیستم موجود باشد، لینک بازیابی ارسال شد' };
    } catch (error) {
      this.logger.error(`Failed to process forgot password request for ${email}:`, error);
      throw new BadRequestException('خطا در پردازش درخواست بازیابی رمز عبور');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    try {
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        throw new BadRequestException('توکن نامعتبر است');
      }

      if (new Date() > resetToken.expiresAt) {
        await this.prisma.passwordResetToken.delete({
          where: { id: resetToken.id },
        });
        throw new BadRequestException('توکن منقضی شده است');
      }

      if (resetToken.user.role !== 'ADMIN' && resetToken.user.role !== 'SUPER_ADMIN') {
        throw new BadRequestException('بازیابی رمز عبور برای این حساب از طریق این روش مجاز نیست');
      }

      if (!resetToken.user.isActive) {
        throw new BadRequestException('حساب کاربری غیرفعال است');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: resetToken.userId },
          data: { password: hashedPassword },
        });

        await tx.passwordResetToken.delete({
          where: { id: resetToken.id },
        });

        await tx.refreshToken.deleteMany({
          where: { userId: resetToken.userId },
        });
      });

      this.logger.log(`Password reset successful for user: ${resetToken.user.email}`);

      return { message: 'رمز عبور با موفقیت تغییر کرد' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to reset password with token ${token}:`, error);
      throw new BadRequestException('خطا در تغییر رمز عبور');
    }
  }

  /**
   * Send mock OTP to mobile number for unified sign-in/sign-up.
   * No SMS provider is integrated; OTP is always MOCK_OTP and logged.
   */
  async sendOtp(sendOtpDto: SendOtpDto) {
    const phoneNumber = sendOtpDto.phoneNumber.trim();

    this.logger.log(`Mock OTP ${MOCK_OTP} requested for ${phoneNumber}`);

    return {
      message: 'کد تأیید ارسال شد',
    };
  }

  /**
   * Verify mock OTP and authenticate user (find or create).
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const phoneNumber = verifyOtpDto.phoneNumber.trim();
    const { otp } = verifyOtpDto;

    if (otp !== MOCK_OTP) {
      throw new BadRequestException('کد تأیید نامعتبر است');
    }

    try {
      let isNewUser = false;

      let user = await this.prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            phoneNumber,
            name: phoneNumber,
            isActive: true,
            phoneVerified: true,
          },
        });
        isNewUser = true;
        this.logger.log(`New user created via OTP flow: ${phoneNumber}`);
      } else {
        if (!user.isActive) {
          throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است');
        }

        if (!user.phoneVerified) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { phoneVerified: true },
          });
          isNewUser = true;
        }
      }

      const tokens = await this.generateTokens(user.id, user.phoneNumber, user.role, user.email);

      await this.storeRefreshToken(user.id, tokens.refreshToken);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      this.logger.log(
        `OTP verification successful for user: ${phoneNumber}, isNewUser: ${isNewUser}`,
      );

      return {
        user: userWithoutPassword,
        ...tokens,
        isNewUser,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Failed to verify OTP for ${phoneNumber}:`, error);
      throw new BadRequestException('خطا در تأیید کد. لطفاً دوباره تلاش کنید');
    }
  }

  private async generateTokens(
    userId: string,
    phoneNumber: string,
    role: string,
    email?: string | null,
  ) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!jwtSecret || !jwtRefreshSecret) {
      this.logger.error(
        'JWT secrets are not configured. Please set JWT_SECRET and JWT_REFRESH_SECRET in your .env file.',
      );
      throw new BadRequestException('خطای پیکربندی سرور. لطفاً با پشتیبانی تماس بگیرید.');
    }

    const payload: JwtPayload = {
      sub: userId,
      phoneNumber,
      role,
      ...(email ? { email } : {}),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '24h'),
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private _parseExpirationToDate(expiresIn: string): Date {
    const expiresAt = new Date();
    const match = expiresIn.match(/(\d+)([smhd])/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];

      switch (unit) {
        case 's':
          expiresAt.setSeconds(expiresAt.getSeconds() + value);
          break;
        case 'm':
          expiresAt.setMinutes(expiresAt.getMinutes() + value);
          break;
        case 'h':
          expiresAt.setHours(expiresAt.getHours() + value);
          break;
        case 'd':
          expiresAt.setDate(expiresAt.getDate() + value);
          break;
      }
    }
    return expiresAt;
  }

  private async storeRefreshToken(userId: string, token: string) {
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d');
    const expiresAt = this._parseExpirationToDate(expiresIn);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }
}
