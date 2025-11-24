import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Shape the response to include only necessary product fields
    const cartWithShapedProducts = {
      ...cart,
      items: cart.items.map((item) => ({
        ...item,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          discount: item.product.discount,
          images: item.product.images || [],
          stock: item.product.stock,
        },
      })),
    };

    // Calculate totals
    const subtotal = cartWithShapedProducts.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const discount = cartWithShapedProducts.items.reduce((sum, item) => {
      const discountAmount = (item.product.price * item.product.discount) / 100;
      return sum + discountAmount * item.quantity;
    }, 0);

    const total = subtotal - discount;

    return {
      ...cartWithShapedProducts,
      subtotal,
      discount,
      total,
      itemCount: cartWithShapedProducts.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    // Check if product exists and is active
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('محصول یافت نشد یا غیرفعال است');
    }

    // Check stock
    const hasStock = await this.productsService.checkStock(productId, quantity);
    if (!hasStock) {
      throw new BadRequestException('موجودی کافی نیست');
    }

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Check if product already in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      // Check stock for new quantity
      const hasStockForNew = await this.productsService.checkStock(productId, newQuantity);
      if (!hasStockForNew) {
        throw new BadRequestException('موجودی کافی نیست');
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, updateDto: UpdateCartItemDto) {
    const { quantity } = updateDto;

    // Find cart item
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!item) {
      throw new NotFoundException('آیتم سبد خرید یافت نشد');
    }

    // Check if cart belongs to user
    if (item.cart.userId !== userId) {
      throw new BadRequestException('دسترسی غیرمجاز');
    }

    // Check stock
    const hasStock = await this.productsService.checkStock(item.productId, quantity);
    if (!hasStock) {
      throw new BadRequestException('موجودی کافی نیست');
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, itemId: string) {
    // Find cart item
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!item) {
      throw new NotFoundException('آیتم سبد خرید یافت نشد');
    }

    // Check if cart belongs to user
    if (item.cart.userId !== userId) {
      throw new BadRequestException('دسترسی غیرمجاز');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { message: 'سبد خرید خالی شد' };
  }
}
