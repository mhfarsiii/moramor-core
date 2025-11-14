import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ZarinpalService } from './services/zarinpal.service';

@Module({
  providers: [PaymentService, ZarinpalService],
  exports: [PaymentService],
})
export class PaymentModule {}
