import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const stats = await prisma.order.groupBy({
    by: ['status'],
    _count: { id: true },
    _sum: { totalAmount: true }
  });
  console.log('Order Stats:', JSON.stringify(stats, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
