import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting all sales data...');
  
  // 1. Delete order-related data in correct order
  const historyCount = await prisma.orderStatusHistory.deleteMany({});
  console.log(`Deleted ${historyCount.count} status history entries.`);
  
  const itemCount = await prisma.orderItem.deleteMany({});
  console.log(`Deleted ${itemCount.count} order items.`);
  
  const giftCount = await prisma.giftOption.deleteMany({});
  console.log(`Deleted ${giftCount.count} gift options.`);
  
  const orderCount = await prisma.order.deleteMany({});
  console.log(`Deleted ${orderCount.count} orders.`);
  
  // 2. Reset coupon usage
  await prisma.coupon.updateMany({
    data: { usageCount: 0 }
  });
  console.log('Reset coupon usage counts.');

  console.log('Sales data reset complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
