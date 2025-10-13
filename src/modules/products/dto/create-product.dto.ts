import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  Max,
  IsNumber,
  IsObject,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'گردنبند چشم ببر' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'tigers-eye-necklace' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'گردنبند زیبا با سنگ چشم ببر طبیعی', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2500000, description: 'قیمت به ریال' })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({ example: 10, description: 'درصد تخفیف (0-100)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @ApiProperty({ example: 'category-id-here' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: ['چشم ببر', 'نقره'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @ApiProperty({ example: ['/products/image1.jpg'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ example: 15, description: 'موجودی انبار' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'NEK-001', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 12.5, description: 'وزن به گرم', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({
    example: { length: 50, width: 10, height: 5 },
    description: 'ابعاد محصول',
    required: false,
  })
  @IsOptional()
  @IsObject()
  dimensions?: any;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'گردنبند چشم ببر - مورامور', required: false })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({ example: 'خرید گردنبند چشم ببر با بهترین کیفیت', required: false })
  @IsOptional()
  @IsString()
  metaDescription?: string;
}

