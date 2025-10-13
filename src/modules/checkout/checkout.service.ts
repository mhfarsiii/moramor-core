import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { OrdersService } from '../orders/orders.service';
import { PaymentService } from '../payment/payment.service';
import { AddressesService } from '../addresses/addresses.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

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

    // Verify address belongs to user
    await this.addressesService.findOne(addressId, userId);

    // Get items from cart or from provided items
    let orderItems;

    if (items && items.length > 0) {
      // Use provided items
      orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
    } else {
      // Get items from cart
      const cart = await this.cartService.getCart(userId);

      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('سبد خرید خالی است');
      }

      orderItems = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
    }

    // Create order
    const order = await this.ordersService.create({
      userId,
      items: orderItems,
      addressId,
      paymentMethod,
      customerNote,
    });

    // Handle payment based on method
    if (
      paymentMethod === PaymentMethod.CASH_ON_DELIVERY ||
      paymentMethod === PaymentMethod.BANK_TRANSFER
    ) {
      // No payment gateway needed
      // Clear cart if items were from cart
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

    // Request payment from gateway
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('کاربر یافت نشد');
    }

    const paymentResult = await this.paymentService.requestPayment(paymentMethod, {
      amount: order.totalPrice,
      orderId: order.id,
      userEmail: user.email,
      description: `پرداخت سفارش ${order.orderNumber}`,
    });

    if (!paymentResult.success) {
      throw new BadRequestException(paymentResult.message || 'خطا در ایجاد درخواست پرداخت');
    }

    // Clear cart if items were from cart
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

  async verifyPayment(authority: string, status: string) {
    // Find order by searching in recent orders
    // In production, you might want to store authority in order or use a cache
    const recentOrders = await this.prisma.order.findMany({
      where: {
        paymentStatus: PaymentStatus.UNPAID,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // For now, we'll assume the most recent unpaid order
    // In production, store authority with order or in Redis
    const order = recentOrders[0];

    if (!order) {
      throw new BadRequestException('سفارش یافت نشد');
    }

    if (status !== 'OK') {
      await this.ordersService.updatePaymentStatus(order.id, PaymentStatus.FAILED);
      throw new BadRequestException('پرداخت توسط کاربر لغو شد');
    }

    // Verify payment with gateway
    const verifyResult = await this.paymentService.verifyPayment(order.paymentMethod, {
      authority,
      amount: order.totalPrice,
    });

    if (!verifyResult.success) {
      await this.ordersService.updatePaymentStatus(order.id, PaymentStatus.FAILED);
      throw new BadRequestException(verifyResult.message || 'تایید پرداخت ناموفق بود');
    }

    // Update order payment status
    await this.ordersService.updatePaymentStatus(
      order.id,
      PaymentStatus.PAID,
      verifyResult.refId,
    );

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      refId: verifyResult.refId,
      message: 'پرداخت با موفقیت انجام شد',
    };
  }
}

