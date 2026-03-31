import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin } from '../middleware/auth';
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = Router();

// Get active banners (public)
router.get('/', cacheMiddleware(3600), async (req: Request, res: Response) => {
  try {
    const banners = await (prisma as any).banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create banner (Admin)
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, subtitle, imageUrl, link, order } = req.body;
    const banner = await (prisma as any).banner.create({
      data: { title, subtitle, imageUrl, link, order: Number(order) || 0 }
    });
    await clearCache('banners*');
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete banner (Admin)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    await (prisma as any).banner.delete({ where: { id: req.params.id } });
    await clearCache('banners*');
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
