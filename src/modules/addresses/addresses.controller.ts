import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Addresses')
@ApiBearerAuth('JWT-auth')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد آدرس جدید' })
  @ApiResponse({ status: 201, description: 'آدرس با موفقیت ایجاد شد' })
  create(@CurrentUser('id') userId: string, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت لیست آدرس‌های کاربر' })
  @ApiResponse({ status: 200, description: 'لیست آدرس‌ها' })
  findAll(@CurrentUser('id') userId: string) {
    return this.addressesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک آدرس' })
  @ApiResponse({ status: 200, description: 'جزئیات آدرس' })
  @ApiResponse({ status: 404, description: 'آدرس یافت نشد' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.addressesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ویرایش آدرس' })
  @ApiResponse({ status: 200, description: 'آدرس با موفقیت ویرایش شد' })
  @ApiResponse({ status: 404, description: 'آدرس یافت نشد' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, userId, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف آدرس' })
  @ApiResponse({ status: 200, description: 'آدرس با موفقیت حذف شد' })
  @ApiResponse({ status: 404, description: 'آدرس یافت نشد' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.addressesService.remove(id, userId);
  }
}

