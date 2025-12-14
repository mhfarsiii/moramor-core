import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Root')
@Controller()
export class RootController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'API root endpoint' })
  @ApiResponse({ status: 200, description: 'API information' })
  getRoot() {
    return {
      name: 'Moramor Accessory Store API',
      version: '1.0',
      status: 'running',
      documentation: '/api-docs',
      health: '/api/v1/health',
      endpoints: {
        base: '/api/v1',
        auth: '/api/v1/auth',
        products: '/api/v1/products',
        categories: '/api/v1/categories',
        cart: '/api/v1/cart',
        orders: '/api/v1/orders',
        checkout: '/api/v1/checkout',
        addresses: '/api/v1/addresses',
        wishlist: '/api/v1/wishlist',
        reviews: '/api/v1/reviews',
        upload: '/api/v1/upload',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
