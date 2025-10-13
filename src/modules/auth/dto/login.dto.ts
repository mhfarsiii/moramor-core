import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'ali@example.com',
    description: 'ایمیل کاربر',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    description: 'رمز عبور',
  })
  @IsString()
  @MinLength(6)
  password: string;
}

