const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@admin.com';
  const password = 'admin';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: 'OWNER' },
    create: {
      email,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'OWNER',
    }
  });
  
  console.log('User admin@admin.com with password "admin" created/updated successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
