import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = Router();

// Get all products (public)
router.get('/', cacheMiddleware(3600), async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { customizationOptions: true }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by slug
router.get('/:slug', cacheMiddleware(3600), async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug as string },
      include: { customizationOptions: true, reviews: true }
    });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product (Admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, slug, category, images } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        slug,
        category,
        images: images || [],
      }
    });
    // Clear cache after creation
    await clearCache('products*');
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
