import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCollectionDto) {
    const slug = await this.generateUniqueSlug(dto.title);

    await this.ensureProductsExist(dto.productIds);

    const collection = await this.prisma.collection.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        coverImage: dto.coverImage,
        products: {
          create: dto.productIds.map((productId, index) => ({
            productId,
            sortOrder: index,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return collection;
  }

  async update(id: string, dto: UpdateCollectionDto) {
    const existing = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('کالکشن مورد نظر یافت نشد');
    }

    let slug = existing.slug;

    if (dto.title && dto.title !== existing.title) {
      slug = await this.generateUniqueSlug(dto.title, existing.id);
    }

    if (dto.productIds && dto.productIds.length > 0) {
      await this.ensureProductsExist(dto.productIds);
    }

    const updateData: Prisma.CollectionUpdateInput = {
      title: dto.title ?? existing.title,
      slug,
      description: dto.description !== undefined ? dto.description : existing.description,
      coverImage: dto.coverImage ?? existing.coverImage,
      isActive: dto.isActive ?? existing.isActive,
    };

    const transaction: Prisma.PrismaPromise<unknown>[] = [];

    if (dto.productIds) {
      transaction.push(
        this.prisma.productOnCollection.deleteMany({
          where: { collectionId: id },
        }),
      );

      if (dto.productIds.length > 0) {
        transaction.push(
          this.prisma.productOnCollection.createMany({
            data: dto.productIds.map((productId, index) => ({
              collectionId: id,
              productId,
              sortOrder: index,
            })),
          }),
        );
      }
    }

    transaction.push(
      this.prisma.collection.update({
        where: { id },
        data: updateData,
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      }),
    );

    const result = await this.prisma.$transaction(transaction);

    return result[result.length - 1];
  }

  async softDelete(id: string) {
    const existing = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('کالکشن مورد نظر یافت نشد');
    }

    await this.prisma.collection.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return { message: 'کالکشن با موفقیت حذف شد' };
  }

  async findAllPublic() {
    const collections = await this.prisma.collection.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return collections;
  }

  async findOneBySlugPublic(slug: string) {
    const collection = await this.prisma.collection.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        products: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            product: true,
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('کالکشن فعال با این slug یافت نشد');
    }

    return {
      id: collection.id,
      title: collection.title,
      slug: collection.slug,
      description: collection.description,
      coverImage: collection.coverImage,
      products: collection.products.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        thumbnail: Array.isArray(item.product.images) ? (item.product.images[0] ?? null) : null,
      })),
    };
  }

  private async generateUniqueSlug(title: string, ignoreId?: string) {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;
    let hasConflict = true;

    // Ensure uniqueness
    // If ignoreId is provided, we allow the existing collection with that id to keep the slug
    // This is useful during updates.
    // NOTE: This loop should converge quickly due to indexed slug column.
    // In extremely rare cases of many collisions, it will just increment the suffix further.
    while (hasConflict) {
      const existing = await this.prisma.collection.findFirst({
        where: {
          slug,
          ...(ignoreId && { id: { not: ignoreId } }),
        },
      });

      if (!existing) {
        hasConflict = false;
      } else {
        slug = `${baseSlug}-${counter++}`;
      }
    }

    return slug;
  }

  private slugify(value: string): string {
    return value
      .toString()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async ensureProductsExist(productIds: string[]) {
    if (!productIds || productIds.length === 0) {
      return;
    }

    const uniqueIds = Array.from(new Set(productIds));

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: uniqueIds,
        },
      },
      select: { id: true },
    });

    if (products.length !== uniqueIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = uniqueIds.filter((id) => !foundIds.has(id));
      throw new ConflictException(`برخی از شناسه‌های محصولات نامعتبر هستند: ${missing.join(', ')}`);
    }
  }
}
