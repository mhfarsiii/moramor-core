import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for forgot password request
 * @description Contains email address for password reset request
 */
export class ForgotPasswordDto {
  @ApiProperty({
    description: 'ایمیل کاربر برای بازیابی رمز عبور',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail({}, { message: 'لطفاً یک ایمیل معتبر وارد کنید' })
  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  email: string;
}
