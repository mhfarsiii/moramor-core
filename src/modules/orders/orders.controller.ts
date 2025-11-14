import { Controller, Get, Patch, Param, Query, Body, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'دریافت لیست سفارشات کاربر' })
  @ApiResponse({ status: 200, description: 'لیست سفارشات' })
  findAll(@CurrentUser('id') userId: string, @Query() queryDto: QueryOrderDto) {
    return this.ordersService.findAll(queryDto, userId);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'دریافت همه سفارشات (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'لیست همه سفارشات' })
  findAllAdmin(@Query() queryDto: QueryOrderDto) {
    return this.ordersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت جزئیات یک سفارش' })
  @ApiResponse({ status: 200, description: 'جزئیات سفارش' })
  @ApiResponse({ status: 404, description: 'سفارش یافت نشد' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser() user: any) {
    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
    return this.ordersService.findOne(id, isAdmin ? undefined : userId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'ویرایش وضعیت سفارش (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'وضعیت سفارش ویرایش شد' })
  @ApiResponse({ status: 404, description: 'سفارش یافت نشد' })
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'لغو سفارش' })
  @ApiResponse({ status: 200, description: 'سفارش لغو شد' })
  @ApiResponse({ status: 400, description: 'امکان لغو سفارش وجود ندارد' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser() user: any) {
    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
    return this.ordersService.cancel(id, isAdmin ? undefined : userId);
  }
}
