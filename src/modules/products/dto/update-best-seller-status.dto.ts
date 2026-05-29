import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateBestSellerStatusDto {
  @ApiProperty({ example: true, description: 'آیا این محصول پرفروش است؟' })
  @IsBoolean()
  isBestSeller: boolean;
}
