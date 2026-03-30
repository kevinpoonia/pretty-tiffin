import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Dashboard Stats
router.get('/stats', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalOrders, totalProducts, allOrders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({ select: { totalAmount: true } })
    ]);

    const revenue = allOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0);

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      revenue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
