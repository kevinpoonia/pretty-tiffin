import { prisma } from '../prisma';

export async function cleanupStaleOrders() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  console.log('Cleaning up stale PENDING orders older than:', twentyFourHoursAgo);

  try {
    // 1. Find stale pending orders
    const staleOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: twentyFourHoursAgo }
      },
      select: { id: true }
    });

    if (staleOrders.length === 0) {
      console.log('No stale orders found.');
      return 0;
    }

    const orderIds = staleOrders.map(o => o.id);

    // 2. Delete related records first (Prisma doesn't always handle cascade for everything depending on DB setup)
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    
    // 3. Delete the orders
    const { count } = await prisma.order.deleteMany({
      where: {
        id: { in: orderIds }
      }
    });

    console.log(`Successfully deleted ${count} stale PENDING orders.`);
    return count;
  } catch (error) {
    console.error('Failed to cleanup orders:', error);
    throw error;
  }
}
