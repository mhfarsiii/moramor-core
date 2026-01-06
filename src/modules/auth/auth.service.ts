import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
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

  /**
   * Authenticate user with email and password
   * @param email - User email address
   * @param password - User password
   * @returns Promise with user data and tokens
   */
  async login(email: string, password: string) {
    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Check if user exists
    if (!user) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      throw new UnauthorizedException(
        'این حساب کاربری با رمز عبور قابل ورود نیست. لطفاً از روش دیگری استفاده کنید',
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    // Generate JWT tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    this.logger.log(`User logged in successfully: ${normalizedEmail}`);

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async googleLogin(profile: any) {
    const { email, displayName, id: googleId } = profile;

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase().trim();

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
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

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      // For security, always return success message
      // This prevents email enumeration attacks
      if (!user) {
        this.logger.warn(`Password reset requested for non-existent email: ${normalizedEmail}`);
        return { message: 'اگر ایمیل در سیستم موجود باشد، لینک بازیابی ارسال شد' };
      }

      // Check if user has password (not OAuth only)
      if (!user.password) {
        this.logger.warn(`Password reset requested for OAuth-only user: ${normalizedEmail}`);
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
   * Send OTP code to email for unified sign-in/sign-up
   * @param sendCodeDto - Contains email address
   * @returns Promise with success message
   */
  async sendOtpCode(sendCodeDto: SendCodeDto) {
    const { email } = sendCodeDto;

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase().trim();

    let isNewUser = false;
    let userId: string | null = null;
    let otpCodeId: string | null = null;

    try {
      // Use transaction to ensure atomicity and handle race conditions
      const result = await this.prisma.$transaction(
        async (tx) => {
          // Check if user exists or create new one
          // Using upsert to handle race conditions where multiple requests
          // might try to create the same user simultaneously
          let user = await tx.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!user) {
            try {
              user = await tx.user.create({
                data: {
                  email: normalizedEmail,
                  name: normalizedEmail.split('@')[0], // Use email prefix as default name
                  isActive: true,
                  emailVerified: false,
                },
              });
              isNewUser = true;
              this.logger.log(`New user created for OTP flow: ${normalizedEmail}`);
            } catch (createError: any) {
              // Handle race condition: if user was created by another request
              if (createError?.code === 'P2002') {
                // Unique constraint violation - user was created by another request
                user = await tx.user.findUnique({
                  where: { email: normalizedEmail },
                });
                if (!user) {
                  throw new BadRequestException('خطا در ایجاد کاربر. لطفاً دوباره تلاش کنید');
                }
                this.logger.warn(
                  `User ${normalizedEmail} was created by concurrent request, using existing user`,
                );
              } else {
                throw createError;
              }
            }
          }

          userId = user.id;

          // Delete any existing OTP codes for this email
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await tx.otpCode.deleteMany({
            where: { email: normalizedEmail },
          });

          // Generate 6-digit random code
          const code = Math.floor(100000 + Math.random() * 900000).toString();

          // Store code with 5-minute expiration
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const otpCode = await tx.otpCode.create({
            data: {
              email: normalizedEmail,
              code,
              userId: user.id,
              expiresAt,
            },
          });

          return { user, code, otpCodeId: otpCode.id };
        },
        {
          maxWait: 5000, // Maximum time to wait for a transaction slot
          timeout: 10000, // Maximum time the transaction can run
        },
      );

      const { user, code } = result;
      otpCodeId = result.otpCodeId;

      // Send OTP code via email
      // If this fails, we need to clean up the newly created user and OTP code
      await this.mailService.sendOtpEmail(normalizedEmail, code, user.name);

      this.logger.log(`OTP code sent to: ${normalizedEmail}`);

      // Return consistent response for both new and returning users
      return {
        message: 'کد تأیید به ایمیل شما ارسال شد',
      };
    } catch (error) {
      this.logger.error(`Failed to send OTP code to ${normalizedEmail}:`, error);

      // Clean up: If we created a new user and OTP code, but email sending failed,
      // we need to delete them to maintain data consistency
      if (isNewUser && userId) {
        try {
          // Delete OTP code if it was created
          if (otpCodeId) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await this.prisma.otpCode
              .delete({
                where: { id: otpCodeId },
              })
              .catch(() => {
                // Ignore errors during cleanup
              });
          }

          // Delete the newly created user
          await this.prisma.user
            .delete({
              where: { id: userId },
            })
            .catch(() => {
              // Ignore errors during cleanup
            });

          this.logger.warn(
            `Cleaned up newly created user ${userId} due to email sending failure for ${normalizedEmail}`,
          );
        } catch (cleanupError) {
          this.logger.error(
            `Failed to clean up user ${userId} after email sending failure:`,
            cleanupError,
          );
        }
      } else if (otpCodeId) {
        // If user existed but OTP code was created, clean up the OTP code
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await this.prisma.otpCode
            .delete({
              where: { id: otpCodeId },
            })
            .catch(() => {
              // Ignore errors during cleanup
            });
        } catch (cleanupError) {
          this.logger.error(
            `Failed to clean up OTP code ${otpCodeId} after email sending failure:`,
            cleanupError,
          );
        }
      }

      // Re-throw BadRequestException if it was thrown in transaction
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('خطا در ارسال کد تأیید. لطفاً دوباره تلاش کنید');
    }
  }

  /**
   * Verify OTP code and authenticate user
   * @param verifyCodeDto - Contains email and code
   * @returns Promise with user data, tokens, and isNewUser flag
   */
  async verifyOtpCode(verifyCodeDto: VerifyCodeDto) {
    const { email, code } = verifyCodeDto;

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Find OTP code
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const otpCode = await this.prisma.otpCode.findFirst({
        where: {
          email: normalizedEmail,
          code,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!otpCode) {
        throw new BadRequestException('کد تأیید نامعتبر است');
      }

      // Check if code is expired
      if (new Date() > otpCode.expiresAt) {
        // Clean up expired code
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.prisma.otpCode.delete({
          where: { id: otpCode.id },
        });
        throw new BadRequestException('کد تأیید منقضی شده است');
      }

      // Find or get user
      const user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        throw new BadRequestException('کاربر یافت نشد');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است');
      }

      const isNewUser = !user.emailVerified;

      // Update email verification status and clean up OTP code in a transaction
      await this.prisma.$transaction(async (tx) => {
        // Set emailVerified to true
        await tx.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });

        // Delete OTP code
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await tx.otpCode.delete({
          where: { id: otpCode.id },
        });

        // Clean up any other expired OTP codes for this email
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await tx.otpCode.deleteMany({
          where: {
            email: normalizedEmail,
            expiresAt: {
              lt: new Date(),
            },
          },
        });
      });

      // Generate JWT tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role);

      // Store refresh token
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      this.logger.log(
        `OTP verification successful for user: ${normalizedEmail}, isNewUser: ${isNewUser}`,
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
      this.logger.error(`Failed to verify OTP code for ${normalizedEmail}:`, error);
      throw new BadRequestException('خطا در تأیید کد. لطفاً دوباره تلاش کنید');
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
