import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Validate coupon
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const coupon = await prisma.coupon.findUnique({ where: { code: code as string } });
    
    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }
    
    if (coupon.expireAt && coupon.expireAt < new Date()) {
      res.status(400).json({ error: 'Coupon expired' });
      return;
    }
    
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      res.status(400).json({ error: 'Coupon usage limit reached' });
      return;
    }

    res.json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create coupon
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { code, type, value, expireAt, usageLimit } = req.body;
    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value,
        expireAt: expireAt ? new Date(expireAt) : null,
        usageLimit
      }
    });
    res.status(201).json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
