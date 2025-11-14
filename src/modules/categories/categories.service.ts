import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Check if slug already exists
    const existing = await this.prisma.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (existing) {
      throw new ConflictException('دسته‌بندی با این slug قبلاً ایجاد شده است');
    }

    // If parentId provided, check if it exists
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('دسته‌بندی والد یافت نشد');
      }
    }

    return this.prisma.category.create({
      data: createCategoryDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };

    return this.prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: {
          where: { isActive: true },
          take: 10,
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        products: {
          where: { isActive: true },
          take: 10,
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }

    // If slug is being updated, check for conflicts
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: updateCategoryDto.slug },
      });

      if (existing) {
        throw new ConflictException('دسته‌بندی با این slug قبلاً ایجاد شده است');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }

    if (category.products.length > 0) {
      throw new ConflictException('این دسته‌بندی دارای محصول است و نمی‌توان آن را حذف کرد');
    }

    if (category.children.length > 0) {
      throw new ConflictException('این دسته‌بندی دارای زیردسته است و نمی‌توان آن را حذف کرد');
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'دسته‌بندی با موفقیت حذف شد' };
  }
}
