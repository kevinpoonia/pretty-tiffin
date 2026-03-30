import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// Get customizations for a product
router.get('/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const options = await prisma.customizationOption.findMany({
      where: { productId: productId as string }
    });
    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Add customization to a product
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, type, label, values, priceOffset } = req.body;
    const option = await prisma.customizationOption.create({
      data: {
        productId,
        type,
        label,
        values,
        priceOffset: priceOffset || 0
      }
    });
    res.status(201).json(option);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
