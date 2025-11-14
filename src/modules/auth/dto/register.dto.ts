import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'علی محمدی',
    description: 'نام کامل کاربر',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'ali@example.com',
    description: 'ایمیل کاربر',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    description: 'رمز عبور (حداقل 8 کاراکتر، شامل حروف بزرگ، کوچک و عدد)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'رمز عبور باید شامل حروف بزرگ، کوچک و عدد یا کاراکتر ویژه باشد',
  })
  password: string;

  @ApiProperty({
    example: '09123456789',
    description: 'شماره تلفن (اختیاری)',
    required: false,
  })
  @IsString()
  phone?: string;
}
