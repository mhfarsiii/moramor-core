import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'شماره موبایل کاربر (فرمت ایرانی)',
    example: '09123456789',
  })
  @IsString({ message: 'شماره موبایل باید رشته باشد' })
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود' })
  phoneNumber: string;
}
