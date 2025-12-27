import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for login request
 * @description Contains email and password for user authentication
 */
export class LoginDto {
  @ApiProperty({
    description: 'ایمیل کاربر',
    example: 'admin@moramor.com',
    type: String,
  })
  @IsEmail({}, { message: 'لطفاً یک ایمیل معتبر وارد کنید' })
  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  email: string;

  @ApiProperty({
    description: 'رمز عبور کاربر',
    example: 'Admin@123456',
    type: String,
    minLength: 6,
  })
  @IsString({ message: 'رمز عبور باید رشته باشد' })
  @IsNotEmpty({ message: 'رمز عبور الزامی است' })
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  password: string;
}

