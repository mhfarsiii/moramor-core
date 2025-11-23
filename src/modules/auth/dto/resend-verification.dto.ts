import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for resend email verification request
 * @description Contains email address for resending verification email
 */
export class ResendVerificationDto {
  @ApiProperty({
    description: 'ایمیل کاربر برای ارسال مجدد ایمیل تأیید',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail({}, { message: 'لطفاً یک ایمیل معتبر وارد کنید' })
  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  email: string;
}




