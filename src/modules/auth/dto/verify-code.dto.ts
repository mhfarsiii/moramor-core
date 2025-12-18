import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  email: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsString({ message: 'کد باید رشته باشد' })
  @IsNotEmpty({ message: 'کد الزامی است' })
  @Length(6, 6, { message: 'کد باید ۶ رقم باشد' })
  @Matches(/^\d{6}$/, { message: 'کد باید فقط شامل اعداد باشد' })
  code: string;
}

