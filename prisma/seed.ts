import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@moramor.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'Administrator';
  
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: adminName,
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
      isActive: true,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created/updated:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name: ${admin.name}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   Email Verified: ${admin.emailVerified}`);
  console.log(`   Is Active: ${admin.isActive}`);
  console.log(`   Password: ${adminPassword} (hashed)`);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'necklaces' },
      update: {},
      create: {
        name: 'گردنبند',
        slug: 'necklaces',
        description: 'گردنبندهای زیبا و متنوع',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'bracelets' },
      update: {},
      create: {
        name: 'دستبند',
        slug: 'bracelets',
        description: 'دستبندهای شیک و مدرن',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'rings' },
      update: {},
      create: {
        name: 'انگشتر',
        slug: 'rings',
        description: 'انگشترهای زیبا',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'earrings' },
      update: {},
      create: {
        name: 'گوشواره',
        slug: 'earrings',
        description: 'گوشواره‌های متنوع',
        sortOrder: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'گردنبند چشم ببر',
        slug: 'tigers-eye-necklace',
        description: 'گردنبند زیبا با سنگ چشم ببر طبیعی',
        price: 2500000,
        discount: 10,
        categoryId: categories[0].id,
        materials: ['چشم ببر', 'نقره'],
        images: ['/products/sample-necklace-1.jpg'],
        stock: 15,
        sku: 'NEK-001',
        weight: 12.5,
        isFeatured: true,
        metaTitle: 'گردنبند چشم ببر - مُرامُر',
        metaDescription: 'خرید گردنبند چشم ببر با بهترین کیفیت',
      },
    }),
    prisma.product.create({
      data: {
        name: 'دستبند عقیق سرخ',
        slug: 'red-agate-bracelet',
        description: 'دستبند زیبا با سنگ عقیق سرخ اصل',
        price: 1800000,
        discount: 0,
        categoryId: categories[1].id,
        materials: ['عقیق سرخ', 'طلا'],
        images: ['/products/sample-bracelet-1.jpg'],
        stock: 20,
        sku: 'BRC-001',
        weight: 8.3,
        isFeatured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'انگشتر فیروزه نیشابوری',
        slug: 'turquoise-ring',
        description: 'انگشتر نقره با فیروزه نیشابوری اصل',
        price: 3200000,
        discount: 15,
        categoryId: categories[2].id,
        materials: ['فیروزه', 'نقره 925'],
        images: ['/products/sample-ring-1.jpg'],
        stock: 8,
        sku: 'RNG-001',
        weight: 6.2,
        isFeatured: false,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} sample products`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

