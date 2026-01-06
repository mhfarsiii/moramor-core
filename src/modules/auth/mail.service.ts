import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

/**
 * Service for handling email operations
 * @description Handles sending various types of emails including password reset
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send password reset email to user
   * @param email - User's email address
   * @param resetToken - Password reset token
   * @param userName - User's display name
   * @returns Promise<void>
   */
  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      // Add timeout to prevent hanging connections
      const sendMailPromise = this.mailerService.sendMail({
        to: email,
        subject: 'بازیابی رمز عبور - فروشگاه مُرامُر',
        template: 'password-reset',
        context: {
          userName,
          resetUrl,
          resetToken,
          companyName: 'فروشگاه مُرامُر',
        },
      });

      // Set timeout of 10 seconds for email sending
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Email sending timeout after 10 seconds'));
        }, 10000);
      });

      await Promise.race([sendMailPromise, timeoutPromise]);

      this.logger.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   * @param email - User's email address
   * @param userName - User's display name
   * @returns Promise<void>
   */
  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'خوش آمدید به فروشگاه مُرامُر',
        template: 'welcome',
        context: {
          userName,
          companyName: 'فروشگاه مُرامُر',
        },
      });

      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      throw error;
    }
  }


  /**
   * Send OTP code email
   * @param email - User's email address
   * @param code - 6-digit OTP code
   * @param userName - User's display name (optional)
   * @returns Promise<void>
   */
  async sendOtpEmail(email: string, code: string, userName?: string): Promise<void> {
    try {
      // Validate email configuration before attempting to send
      const mailUser = this.configService.get<string>('MAIL_USER');
      const mailPass = this.configService.get<string>('MAIL_PASS');
      const mailHost = this.configService.get<string>('MAIL_HOST');

      if (!mailHost || !mailUser || !mailPass) {
        const missingConfigs: string[] = [];
        if (!mailHost) missingConfigs.push('MAIL_HOST');
        if (!mailUser) missingConfigs.push('MAIL_USER');
        if (!mailPass) missingConfigs.push('MAIL_PASS');

        this.logger.error(
          `Email configuration is missing: ${missingConfigs.join(', ')}`,
        );
        throw new Error(
          `پیکربندی ایمیل ناقص است. متغیرهای محیطی زیر تنظیم نشده‌اند: ${missingConfigs.join(', ')}`,
        );
      }

      // Add timeout to prevent hanging connections
      const sendMailPromise = this.mailerService.sendMail({
        to: email,
        subject: 'کد تأیید ورود - فروشگاه مُرامُر',
        template: 'otp-code',
        context: {
          userName: userName || 'کاربر عزیز',
          code,
          companyName: 'فروشگاه مُرامُر',
        },
      });

      // Set timeout of 10 seconds for email sending
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Email sending timeout after 10 seconds'));
        }, 10000);
      });

      await Promise.race([sendMailPromise, timeoutPromise]);

      this.logger.log(`OTP code email sent successfully to ${email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'خطای نامشخص در ارسال ایمیل';
      this.logger.error(
        `Failed to send OTP code email to ${email}. Error: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
