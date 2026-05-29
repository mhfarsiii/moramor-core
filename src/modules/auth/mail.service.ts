import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

/**
 * Service for handling email operations (admin password reset only)
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send password reset email to admin user
   */
  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

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
}
