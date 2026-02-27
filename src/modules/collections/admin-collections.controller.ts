import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionsService } from './collections.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('admin/collections')
export class AdminCollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'ایجاد کالکشن جدید (فقط ادمین)' })
  @ApiResponse({ status: 201, description: 'کالکشن با موفقیت ایجاد شد' })
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'ویرایش کالکشن (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'کالکشن با موفقیت ویرایش شد' })
  update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'حذف (نرم) کالکشن (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'کالکشن با موفقیت حذف شد' })
  remove(@Param('id') id: string) {
    return this.collectionsService.softDelete(id);
  }
}
