import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

class CheckoutItem {
  @IsString()
  productId: string;

  @IsString()
  quantity: number;
}

export class CreateCheckoutDto {
  @ApiProperty({ example: 'address-id-here' })
  @IsString()
  addressId: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.ZARINPAL })
  @IsIn(Object.values(PaymentMethod))
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerNote?: string;

  @ApiProperty({
    required: false,
    description: 'استفاده از سبد خرید فعلی یا آیتم‌های دستی',
    type: [CheckoutItem],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItem)
  items?: CheckoutItem[];
}
