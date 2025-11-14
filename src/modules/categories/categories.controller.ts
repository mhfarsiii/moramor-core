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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ایجاد دسته‌بندی جدید (فقط ادمین)' })
  @ApiResponse({ status: 201, description: 'دسته‌بندی با موفقیت ایجاد شد' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'دریافت لیست دسته‌بندی‌ها' })
  @ApiResponse({ status: 200, description: 'لیست دسته‌بندی‌ها' })
  findAll(@Query('includeInactive') includeInactive?: boolean) {
    return this.categoriesService.findAll(includeInactive);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'دریافت دسته‌بندی بر اساس slug' })
  @ApiResponse({ status: 200, description: 'جزئیات دسته‌بندی' })
  @ApiResponse({ status: 404, description: 'دسته‌بندی یافت نشد' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'دریافت دسته‌بندی بر اساس ID' })
  @ApiResponse({ status: 200, description: 'جزئیات دسته‌بندی' })
  @ApiResponse({ status: 404, description: 'دسته‌بندی یافت نشد' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ویرایش دسته‌بندی (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'دسته‌بندی با موفقیت ویرایش شد' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'حذف دسته‌بندی (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'دسته‌بندی با موفقیت حذف شد' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
