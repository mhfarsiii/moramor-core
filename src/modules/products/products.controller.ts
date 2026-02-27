import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { UpdateBestSellerStatusDto } from './dto/update-best-seller-status.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ایجاد محصول جدید (فقط ادمین)' })
  @ApiResponse({ status: 201, description: 'محصول با موفقیت ایجاد شد' })
  @ApiResponse({ status: 409, description: 'محصول با این slug قبلاً ایجاد شده است' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'دریافت لیست محصولات با فیلتر و جستجو' })
  @ApiResponse({ status: 200, description: 'لیست محصولات' })
  findAll(@Query() queryDto: QueryProductDto) {
    return this.productsService.findAll(queryDto);
  }

  @Public()
  @Get('flash-sales')
  @ApiOperation({ summary: 'دریافت محصولات فروش ویژه (فلش سیل)' })
  @ApiResponse({ status: 200, description: 'لیست محصولات فروش ویژه' })
  getFlashSales() {
    return this.productsService.getFlashSales();
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'دریافت محصول بر اساس slug' })
  @ApiResponse({ status: 200, description: 'جزئیات محصول' })
  @ApiResponse({ status: 404, description: 'محصول یافت نشد' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'دریافت محصول بر اساس ID' })
  @ApiResponse({ status: 200, description: 'جزئیات محصول' })
  @ApiResponse({ status: 404, description: 'محصول یافت نشد' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ویرایش محصول (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'محصول با موفقیت ویرایش شد' })
  @ApiResponse({ status: 404, description: 'محصول یافت نشد' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/best-seller')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'به‌روزرسانی وضعیت پرفروش بودن محصول (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'وضعیت پرفروش بودن محصول با موفقیت به‌روزرسانی شد' })
  @ApiResponse({ status: 404, description: 'محصول یافت نشد' })
  updateBestSellerStatus(
    @Param('id') id: string,
    @Body() body: UpdateBestSellerStatusDto,
  ) {
    return this.productsService.updateBestSellerStatus(id, body.isBestSeller);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'حذف محصول (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'محصول با موفقیت حذف شد' })
  @ApiResponse({ status: 404, description: 'محصول یافت نشد' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
