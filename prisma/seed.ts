import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  const adminPassword = await bcrypt.hash('Mahmoud@Admin123', saltRounds);
  await prisma.user.upsert({
    where: { phoneNumber: '09100000001' },
    update: {},
    create: {
      phoneNumber: '09100000001',
      email: 'muti@moramor.com',
      name: 'Main Admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      phoneVerified: true,
      emailVerified: true,
    },
  });

  const secondPassword = await bcrypt.hash('Sarah@Admin123', saltRounds);
  await prisma.user.upsert({
    where: { phoneNumber: '09100000002' },
    update: {},
    create: {
      phoneNumber: '09100000002',
      email: 'mySarah@moramor.com',
      name: 'Sales Manager',
      password: secondPassword,
      role: 'ADMIN',
      isActive: true,
      phoneVerified: true,
      emailVerified: true,
    },
  });

  console.log('Done! 2 admin accounts have been created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
