import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'دریافت لیست کالکشن‌های فعال' })
  @ApiResponse({ status: 200, description: 'لیست کالکشن‌های فعال' })
  findAll() {
    return this.collectionsService.findAllPublic();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({
    summary: 'دریافت کالکشن فعال بر اساس slug همراه با محصولات',
  })
  @ApiResponse({ status: 200, description: 'جزئیات کالکشن' })
  @ApiResponse({ status: 404, description: 'کالکشن یافت نشد' })
  findOneBySlug(@Param('slug') slug: string) {
    return this.collectionsService.findOneBySlugPublic(slug);
  }
}
