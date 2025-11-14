import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'علی محمدی',
    description: 'نام کامل کاربر',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: '09123456789',
    description: 'شماره تلفن',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
