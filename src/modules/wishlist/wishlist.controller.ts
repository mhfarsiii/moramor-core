import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wishlist')
@ApiBearerAuth('JWT-auth')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'دریافت لیست علاقه‌مندی‌های کاربر' })
  @ApiResponse({ status: 200, description: 'لیست علاقه‌مندی‌ها' })
  findAll(@CurrentUser('id') userId: string) {
    return this.wishlistService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'افزودن محصول به علاقه‌مندی‌ها' })
  @ApiResponse({ status: 201, description: 'محصول به علاقه‌مندی‌ها اضافه شد' })
  @ApiResponse({ status: 404, description: 'محصول یافت نشد' })
  @ApiResponse({ status: 409, description: 'محصول قبلاً اضافه شده است' })
  add(@CurrentUser('id') userId: string, @Body() addToWishlistDto: AddToWishlistDto) {
    return this.wishlistService.add(userId, addToWishlistDto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'حذف محصول از علاقه‌مندی‌ها' })
  @ApiResponse({ status: 200, description: 'محصول از علاقه‌مندی‌ها حذف شد' })
  @ApiResponse({ status: 404, description: 'آیتم در علاقه‌مندی‌ها یافت نشد' })
  remove(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.remove(userId, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'بررسی وجود محصول در علاقه‌مندی‌ها' })
  @ApiResponse({ status: 200, description: 'وضعیت محصول در علاقه‌مندی‌ها' })
  check(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.check(userId, productId);
  }
}
