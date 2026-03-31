import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function promote(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log(`✅ User ${user.email} promoted to ADMIN successfully.`);
  } catch (err) {
    console.error("❌ Failed to promote user. Ensure the email exists.");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.log("Usage: npx ts-node scripts/promote-admin.ts <email>");
  process.exit(1);
}

promote(email);
