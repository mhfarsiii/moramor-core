import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 16 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 16;

  @ApiProperty({ required: false, description: 'جستجو در نام و توضیحات' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false, description: 'فیلتر بر اساس دسته‌بندی (slug)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false, description: 'حداقل قیمت' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  min?: number;

  @ApiProperty({ required: false, description: 'حداکثر قیمت' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  max?: number;

  @ApiProperty({
    required: false,
    description: 'مرتب‌سازی',
    enum: ['price-asc', 'price-desc', 'newest', 'oldest', 'popular'],
  })
  @IsOptional()
  @IsIn(['price-asc', 'price-desc', 'newest', 'oldest', 'popular'])
  sort?: string;

  @ApiProperty({ required: false, description: 'فقط محصولات ویژه' })
  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;
}
