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
   * Send email verification email
   * @param email - User's email address
   * @param verificationToken - Email verification token
   * @param userName - User's display name
   * @returns Promise<void>
   */
  async sendEmailVerificationEmail(
    email: string,
    verificationToken: string,
    userName: string,
  ): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

      // Add timeout to prevent hanging connections
      const sendMailPromise = this.mailerService.sendMail({
        to: email,
        subject: 'تأیید ایمیل - فروشگاه مُرامُر',
        template: 'email-verification',
        context: {
          userName,
          verificationUrl,
          verificationToken,
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

      this.logger.log(`Email verification email sent successfully to ${email}`);
    } catch (error) {
      // Log error but don't throw to prevent server crashes
      this.logger.error(`Failed to send email verification email to ${email}:`, error);
      // Don't rethrow - let the calling code handle it gracefully
    }
  }
}
