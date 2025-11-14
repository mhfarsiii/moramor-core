import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsIn(Object.values(OrderStatus))
  status: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  trackingCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  adminNote?: string;
}
