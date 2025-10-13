import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'خانه' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'علی محمدی' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '09123456789' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'تهران' })
  @IsString()
  province: string;

  @ApiProperty({ example: 'تهران' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'خیابان ولیعصر، پلاک 123' })
  @IsString()
  address: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  postalCode: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

