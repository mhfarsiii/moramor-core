import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ثبت نظر برای محصول' })
  @ApiResponse({ status: 201, description: 'نظر با موفقیت ثبت شد' })
  @ApiResponse({ status: 404, description: 'محصول یافت نشد' })
  @ApiResponse({ status: 400, description: 'شما قبلاً نظر ثبت کرده‌اید' })
  create(@CurrentUser('id') userId: string, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(userId, createReviewDto);
  }

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'دریافت نظرات یک محصول' })
  @ApiResponse({ status: 200, description: 'لیست نظرات' })
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'دریافت همه نظرات (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'لیست نظرات' })
  findAll(@Query() queryDto: QueryReviewDto) {
    return this.reviewsService.findAll(queryDto.page, queryDto.limit, queryDto.approved);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'تایید نظر (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'نظر تایید شد' })
  @ApiResponse({ status: 404, description: 'نظر یافت نشد' })
  approve(@Param('id') id: string) {
    return this.reviewsService.approve(id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'حذف نظر' })
  @ApiResponse({ status: 200, description: 'نظر با موفقیت حذف شد' })
  @ApiResponse({ status: 404, description: 'نظر یافت نشد' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser() user: any) {
    // Admins can delete any review, users can only delete their own
    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
    return this.reviewsService.remove(id, isAdmin ? undefined : userId);
  }
}
