import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'دریافت پروفایل کاربر جاری' })
  @ApiResponse({ status: 200, description: 'پروفایل کاربر' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'ویرایش پروفایل کاربر جاری' })
  @ApiResponse({ status: 200, description: 'پروفایل با موفقیت ویرایش شد' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'دریافت لیست کاربران (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'لیست کاربران' })
  async findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAll(queryDto.page, queryDto.limit);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'دریافت اطلاعات یک کاربر (فقط ادمین)' })
  @ApiResponse({ status: 200, description: 'اطلاعات کاربر' })
  @ApiResponse({ status: 404, description: 'کاربر یافت نشد' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
