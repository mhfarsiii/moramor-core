import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'شماره موبایل کاربر (فرمت ایرانی)',
    example: '09123456789',
  })
  @IsString({ message: 'شماره موبایل باید رشته باشد' })
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود' })
  phoneNumber: string;

  @ApiProperty({
    description: 'کد یک‌بارمصرف (Mock: 12345)',
    example: '12345',
  })
  @IsString({ message: 'کد باید رشته باشد' })
  @IsNotEmpty({ message: 'کد الزامی است' })
  @Length(5, 5, { message: 'کد باید ۵ رقم باشد' })
  @Matches(/^\d{5}$/, { message: 'کد باید فقط شامل اعداد باشد' })
  otp: string;
}
