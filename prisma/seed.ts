import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  // اکانت اول: Admin
  const adminPassword = await bcrypt.hash('Mahmoud@Admin123', saltRounds);
  await prisma.user.upsert({
    where: { email: 'muti@moramor.com' },
    update: {},
    create: {
      email: 'muti@moramor.com',
      name: 'Main Admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  // اکانت دوم: مثلاً ادمین دوم یا یک یوزر تست
  const secondPassword = await bcrypt.hash('Sarah@Admin123', saltRounds);
  await prisma.user.upsert({
    where: { email: 'mySarah@moramor.com' },
    update: {},
    create: {
      email: 'mySarah@moramor.com',
      name: 'Sales Manager',
      password: secondPassword,
      role: 'ADMIN', 
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('Done! 2 Accounts have been created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });