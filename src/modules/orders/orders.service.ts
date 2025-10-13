import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PaymentStatus, PaymentMethod, Prisma } from '@prisma/client';

export interface CreateOrderData {
  userId: string;
  items: Array<{ productId: string; quantity: number }>;
  addressId: string;
  paymentMethod: PaymentMethod;
  customerNote?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(data: CreateOrderData) {
    const { userId, items, addressId, paymentMethod, customerNote } = data;

    // Get address
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new BadRequestException('آدرس نامعتبر است');
    }

    // Validate products and calculate totals
    let subtotal = 0;
    let discount = 0;
    const orderItems: Array<{ productId: string; quantity: number; price: number; discount: number }> = [];

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        throw new BadRequestException(`محصول ${product?.name || item.productId} یافت نشد`);
      }

      // Check stock
      const hasStock = await this.productsService.checkStock(item.productId, item.quantity);
      if (!hasStock) {
        throw new BadRequestException(`موجودی محصول ${product.name} کافی نیست`);
      }

      const itemPrice = product.price * item.quantity;
      const itemDiscount = (product.price * product.discount / 100) * item.quantity;

      subtotal += itemPrice;
      discount += itemDiscount;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount,
      });
    }

    const totalPrice = subtotal - discount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          discount: Math.round(discount),
          totalPrice,
          shippingAddress: address,
          paymentMethod,
          customerNote,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  images: true,
                },
              },
            },
          },
        },
      });

      // Reduce stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return order;
  }

  async findAll(queryDto: QueryOrderDto, userId?: string) {
    const { page = 1, limit = 20, status, paymentStatus } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد');
    }

    // If userId provided, check ownership
    if (userId && order.userId !== userId) {
      throw new BadRequestException('دسترسی غیرمجاز');
    }

    return order;
  }

  async updateStatus(id: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد');
    }

    const updateData: any = {
      status: updateDto.status,
    };

    if (updateDto.trackingCode) {
      updateData.trackingCode = updateDto.trackingCode;
    }

    if (updateDto.adminNote) {
      updateData.adminNote = updateDto.adminNote;
    }

    if (updateDto.status === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    }

    if (updateDto.status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    return this.prisma.order.update({
      where: { id },
      data: updateData,
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, paymentId?: string) {
    const updateData: any = {
      paymentStatus,
    };

    if (paymentId) {
      updateData.paymentId = paymentId;
    }

    if (paymentStatus === PaymentStatus.PAID) {
      updateData.paidAt = new Date();
      updateData.status = OrderStatus.CONFIRMED;
    }

    return this.prisma.order.update({
      where: { id },
      data: updateData,
    });
  }

  async cancel(id: string, userId?: string) {
    const order = await this.findOne(id, userId);

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('سفارش ارسال شده یا تحویل داده شده را نمی‌توان لغو کرد');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('سفارش پرداخت شده را نمی‌توان لغو کرد. لطفاً درخواست مرجوعی ثبت کنید');
    }

    // Return stock
    await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });
    });

    return { message: 'سفارش با موفقیت لغو شد' };
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Count orders for today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const count = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const orderNum = String(count + 1).padStart(5, '0');

    return `ORD-${year}${month}${day}-${orderNum}`;
  }
}

