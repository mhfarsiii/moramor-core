import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for password reset request
 * @description Contains reset token and new password
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: 'توکن بازیابی رمز عبور',
    example: 'abc123def456ghi789',
    type: String,
  })
  @IsString({ message: 'توکن باید رشته باشد' })
  @IsNotEmpty({ message: 'توکن الزامی است' })
  token: string;

  @ApiProperty({
    description: 'رمز عبور جدید',
    example: 'newPassword123',
    minLength: 6,
    maxLength: 128,
    type: String,
  })
  @IsString({ message: 'رمز عبور باید رشته باشد' })
  @IsNotEmpty({ message: 'رمز عبور الزامی است' })
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  @MaxLength(128, { message: 'رمز عبور نمی‌تواند بیش از ۱۲۸ کاراکتر باشد' })
  newPassword: string;
}
