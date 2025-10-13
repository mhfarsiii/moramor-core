import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { CartModule } from '../cart/cart.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentModule } from '../payment/payment.module';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [CartModule, OrdersModule, PaymentModule, AddressesModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}

