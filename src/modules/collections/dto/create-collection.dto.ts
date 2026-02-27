import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({ example: 'Pastel Vibes' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'A soft pastel themed collection',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://cdn.moramor.com/collections/pastel-vibes.jpg',
    description: 'Cover image URL for the collection',
  })
  @IsUrl()
  coverImage: string;

  @ApiProperty({
    example: ['prod_cuid_1', 'prod_cuid_2'],
    type: [String],
    description: 'List of product IDs to associate with this collection',
  })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}
