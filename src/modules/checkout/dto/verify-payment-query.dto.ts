import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentQueryDto {
  @ApiProperty({ description: 'کد Authority بازگشتی از درگاه زرین‌پال' })
  @IsString()
  @IsNotEmpty()
  Authority: string;

  @ApiProperty({ description: 'وضعیت بازگشت از درگاه (مثلاً OK یا NOK)' })
  @IsString()
  @IsNotEmpty()
  Status: string;
}
