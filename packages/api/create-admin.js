const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@instapost.local';
  const password = 'admin123';
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    console.log('User already exists, updating password just in case...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role: 'OWNER' }
    });
    console.log('User updated successfully!');
  } else {
    console.log('User not found. Creating...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        name: 'Admin Instapost',
        password: hashedPassword,
        role: 'OWNER',
      }
    });
    console.log('User created successfully!');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
