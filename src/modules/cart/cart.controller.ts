import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'دریافت سبد خرید کاربر' })
  @ApiResponse({ status: 200, description: 'سبد خرید' })
  getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post()
  @ApiOperation({ summary: 'افزودن محصول به سبد خرید' })
  @ApiResponse({ status: 200, description: 'محصول به سبد خرید اضافه شد' })
  @ApiResponse({ status: 404, description: 'محصول یافت نشد' })
  @ApiResponse({ status: 400, description: 'موجودی کافی نیست' })
  addToCart(@CurrentUser('id') userId: string, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Put(':itemId')
  @ApiOperation({ summary: 'ویرایش تعداد محصول در سبد خرید' })
  @ApiResponse({ status: 200, description: 'تعداد محصول ویرایش شد' })
  @ApiResponse({ status: 404, description: 'آیتم سبد خرید یافت نشد' })
  @ApiResponse({ status: 400, description: 'موجودی کافی نیست' })
  updateCartItem(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(userId, itemId, updateDto);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'حذف محصول از سبد خرید' })
  @ApiResponse({ status: 200, description: 'محصول از سبد خرید حذف شد' })
  @ApiResponse({ status: 404, description: 'آیتم سبد خرید یافت نشد' })
  removeFromCart(@CurrentUser('id') userId: string, @Param('itemId') itemId: string) {
    return this.cartService.removeFromCart(userId, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'خالی کردن سبد خرید' })
  @ApiResponse({ status: 200, description: 'سبد خرید خالی شد' })
  clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
