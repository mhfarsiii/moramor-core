import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'گردنبند' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'necklaces' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'گردنبندهای زیبا و متنوع', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '/categories/necklaces.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 'parent-category-id', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

