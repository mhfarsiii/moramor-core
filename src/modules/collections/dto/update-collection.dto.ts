import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateCollectionDto } from './create-collection.dto';

export class UpdateCollectionDto extends PartialType(CreateCollectionDto) {
  @ApiProperty({
    example: true,
    required: false,
    description: 'Whether the collection is active and visible in the storefront',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
