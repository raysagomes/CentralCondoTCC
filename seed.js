const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      accountType: 'COMPANY'
    }
  });
  
  console.log('Usuário criado: admin@admin.com / 123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());