import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentVerifyResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'clxyz123' })
  orderId: string;

  @ApiProperty({ example: 'ORD-20250528-00001' })
  orderNumber: string;

  @ApiPropertyOptional({ example: '123456789' })
  refId?: string;

  @ApiPropertyOptional({ example: 'پرداخت با موفقیت انجام شد' })
  message?: string;
}
