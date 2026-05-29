import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { OrdersService } from '../orders/orders.service';
import { PaymentService } from '../payment/payment.service';
import { AddressesService } from '../addresses/addresses.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@prisma/client';
import { PaymentVerifyResponseDto } from './dto/payment-verify-response.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private ordersService: OrdersService,
    private paymentService: PaymentService,
    private addressesService: AddressesService,
  ) {}

  async checkout(userId: string, checkoutDto: CreateCheckoutDto) {
    const { addressId, paymentMethod, customerNote, items } = checkoutDto;

    await this.addressesService.findOne(addressId, userId);

    let orderItems;

    if (items && items.length > 0) {
      orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
    } else {
      const cart = await this.cartService.getCart(userId);

      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('سبد خرید خالی است');
      }

      orderItems = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
    }

    const order = await this.ordersService.create({
      userId,
      items: orderItems,
      addressId,
      paymentMethod,
      customerNote,
    });

    if (
      paymentMethod === PaymentMethod.CASH_ON_DELIVERY ||
      paymentMethod === PaymentMethod.BANK_TRANSFER
    ) {
      if (!items || items.length === 0) {
        await this.cartService.clearCart(userId);
      }

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        paymentMethod,
        message: 'سفارش با موفقیت ثبت شد',
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('کاربر یافت نشد');
    }

    const userEmail =
      user.email ??
      (user.phoneNumber ? `${user.phoneNumber}@moramor.local` : `${user.id}@moramor.local`);

    const paymentResult = await this.paymentService.requestPayment(paymentMethod, {
      amount: order.totalPrice,
      orderId: order.id,
      userEmail,
      description: `پرداخت سفارش ${order.orderNumber}`,
    });

    if (!paymentResult.success || !paymentResult.authority) {
      throw new BadRequestException(paymentResult.message || 'خطا در ایجاد درخواست پرداخت');
    }

    await this.ordersService.setPaymentAuthority(order.id, paymentResult.authority);

    if (!items || items.length === 0) {
      await this.cartService.clearCart(userId);
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      paymentUrl: paymentResult.paymentUrl,
      authority: paymentResult.authority,
    };
  }

  async verifyPayment(authority: string, status: string): Promise<PaymentVerifyResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { paymentAuthority: authority },
    });

    if (!order) {
      throw new BadRequestException('سفارش یافت نشد');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        refId: order.paymentId ?? undefined,
        message: 'پرداخت قبلاً تایید شده است',
      };
    }

    if (status !== 'OK') {
      await this.prisma.order.updateMany({
        where: { id: order.id, paymentStatus: PaymentStatus.UNPAID },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      throw new BadRequestException('پرداخت توسط کاربر لغو شد');
    }

    const verifyResult = await this.paymentService.verifyPayment(order.paymentMethod, {
      authority,
      amount: order.totalPrice,
    });

    if (!verifyResult.success) {
      await this.prisma.order.updateMany({
        where: { id: order.id, paymentStatus: PaymentStatus.UNPAID },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      throw new BadRequestException(verifyResult.message || 'تایید پرداخت ناموفق بود');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: {
          id: order.id,
          paymentStatus: PaymentStatus.UNPAID,
        },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paymentId: verifyResult.refId,
          paidAt: new Date(),
          status: OrderStatus.CONFIRMED,
        },
      });

      if (updated.count === 0) {
        const current = await tx.order.findUnique({ where: { id: order.id } });

        if (current?.paymentStatus === PaymentStatus.PAID) {
          return {
            success: true,
            orderId: current.id,
            orderNumber: current.orderNumber,
            refId: current.paymentId ?? undefined,
            message: 'پرداخت قبلاً تایید شده است',
          };
        }

        throw new BadRequestException('امکان به‌روزرسانی وضعیت پرداخت وجود ندارد');
      }

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        refId: verifyResult.refId,
        message: 'پرداخت با موفقیت انجام شد',
      };
    });
  }
}
