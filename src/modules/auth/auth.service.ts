import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, phone } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('کاربر با این ایمیل قبلاً ثبت‌نام کرده است');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and send verification email in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          emailVerified: false, // Explicitly set to false
        },
      });

      // Generate verification token
      const verificationToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification token
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await tx.emailVerificationToken.create({
        data: {
          token: verificationToken,
          userId: user.id,
          expiresAt,
        },
      });

      return { user, verificationToken };
    });

    // Send verification email
    await this.mailService.sendEmailVerificationEmail(
      result.user.email,
      result.verificationToken,
      result.user.name,
    );

    this.logger.log(
      `Registration successful for user: ${result.user.email}, verification email sent`,
    );

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = result.user;

    return {
      message: 'ثبت‌نام با موفقیت انجام شد. لطفاً ایمیل خود را برای تأیید بررسی کنید',
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است');
    }

    // Email verification is optional - users can login with correct email/password
    // or with Google OAuth regardless of email verification status

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verify refresh token
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token exists in DB
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('توکن نامعتبر است');
      }

      // Check if token is expired
      if (new Date() > storedToken.expiresAt) {
        await this.prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new UnauthorizedException('توکن منقضی شده است');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(
        storedToken.user.id,
        storedToken.user.email,
        storedToken.user.role,
      );

      // Delete old refresh token and store new one
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
    // Delete refresh token
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

  async googleLogin(profile: any) {
    const { email, displayName, id: googleId } = profile;

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: displayName,
          googleId,
          emailVerified: true,
        },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user (if user registered with email/password first)
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است');
    }

    // Email verification is optional - users can login with Google OAuth
    // regardless of email verification status

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Handle forgot password request
   * @param forgotPasswordDto - Contains user email
   * @returns Promise with success message
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      // For security, always return success message
      // This prevents email enumeration attacks
      if (!user) {
        this.logger.warn(`Password reset requested for non-existent email: ${email}`);
        return { message: 'اگر ایمیل در سیستم موجود باشد، لینک بازیابی ارسال شد' };
      }

      // Check if user has password (not OAuth only)
      if (!user.password) {
        this.logger.warn(`Password reset requested for OAuth-only user: ${email}`);
        return { message: 'اگر ایمیل در سیستم موجود باشد، لینک بازیابی ارسال شد' };
      }

      // Delete existing reset tokens for this user
      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Generate new reset token
      const resetToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await this.prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt,
        },
      });

      // Send reset email
      await this.mailService.sendPasswordResetEmail(user.email, resetToken, user.name);

      this.logger.log(`Password reset email sent to: ${email}`);

      return { message: 'اگر ایمیل در سیستم موجود باشد، لینک بازیابی ارسال شد' };
    } catch (error) {
      this.logger.error(`Failed to process forgot password request for ${email}:`, error);
      throw new BadRequestException('خطا در پردازش درخواست بازیابی رمز عبور');
    }
  }

  /**
   * Handle password reset with token
   * @param resetPasswordDto - Contains reset token and new password
   * @returns Promise with success message
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    try {
      // Find reset token
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        throw new BadRequestException('توکن نامعتبر است');
      }

      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        // Clean up expired token
        await this.prisma.passwordResetToken.delete({
          where: { id: resetToken.id },
        });
        throw new BadRequestException('توکن منقضی شده است');
      }

      // Check if user still exists and is active
      if (!resetToken.user.isActive) {
        throw new BadRequestException('حساب کاربری غیرفعال است');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password and clean up reset token in a transaction
      await this.prisma.$transaction(async (tx) => {
        // Update password
        await tx.user.update({
          where: { id: resetToken.userId },
          data: { password: hashedPassword },
        });

        // Delete reset token
        await tx.passwordResetToken.delete({
          where: { id: resetToken.id },
        });

        // Delete all refresh tokens for security
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
   * Handle email verification with token
   * @param verifyEmailDto - Contains verification token
   * @returns Promise with success message
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto;

    try {
      // Find verification token
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const verificationToken = await this.prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!verificationToken) {
        throw new BadRequestException('توکن تأیید نامعتبر است');
      }

      // Check if token is expired
      if (new Date() > verificationToken.expiresAt) {
        // Clean up expired token
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.prisma.emailVerificationToken.delete({
          where: { id: verificationToken.id },
        });
        throw new BadRequestException('توکن تأیید منقضی شده است');
      }

      // Check if user still exists and is active
      if (!verificationToken.user.isActive) {
        throw new BadRequestException('حساب کاربری غیرفعال است');
      }

      // Check if email is already verified
      if (verificationToken.user.emailVerified) {
        // Clean up token since it's no longer needed
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.prisma.emailVerificationToken.delete({
          where: { id: verificationToken.id },
        });
        throw new BadRequestException('ایمیل قبلاً تأیید شده است');
      }

      // Update user email verification status and clean up token in a transaction
      await this.prisma.$transaction(async (tx) => {
        // Update email verification status
        await tx.user.update({
          where: { id: verificationToken.userId },
          data: { emailVerified: true },
        });

        // Delete verification token
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await tx.emailVerificationToken.delete({
          where: { id: verificationToken.id },
        });
      });

      this.logger.log(`Email verification successful for user: ${verificationToken.user.email}`);

      return { message: 'ایمیل شما با موفقیت تأیید شد' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to verify email with token ${token}:`, error);
      throw new BadRequestException('خطا در تأیید ایمیل');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
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
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
    const expiresAt = new Date();

    // Parse expiration time
    const match = expiresIn.match(/(\d+)([smhd])/);
    if (match) {
      const value = parseInt(match[1]);
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

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }
}
