import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = Router();

// GET /api/products — list all products (public)
router.get('/', cacheMiddleware(3600), async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { customizationOptions: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/:slug/reviews — product reviews (public) — MUST be before /:slug
router.get('/:slug/reviews', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug as string } });
    if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
    res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/products/:slug/reviews — add review (authenticated)
router.post('/:slug/reviews', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug as string } });
    if (!product) { res.status(404).json({ error: 'Product not found' }); return; }

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({
      where: { userId: req.user!.id, productId: product.id }
    });
    if (existing) {
      res.status(409).json({ error: 'You have already reviewed this product' });
      return;
    }

    const review = await prisma.review.create({
      data: { userId: req.user!.id, productId: product.id, rating: Number(rating), comment },
      include: { user: { select: { name: true } } }
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/:slug — single product (public)
router.get('/:slug', cacheMiddleware(3600), async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug as string },
      include: {
        customizationOptions: true,
        reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
      }
    });
    if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/products — create product (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, compareAtPrice, slug, category, images, stock, isFeatured, seoTitle, seoDesc, customizationOptions } = req.body;
    const product = await prisma.product.create({
      data: {
        name, description, price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        slug, category, images: images || [],
        stock: Number(stock) || 0,
        isFeatured: Boolean(isFeatured),
        seoTitle, seoDesc,
        customizationOptions: {
          create: (customizationOptions || []).map((opt: any) => ({
            type: opt.type, label: opt.label, values: opt.values || [], priceOffset: Number(opt.priceOffset) || 0
          }))
        }
      },
      include: { customizationOptions: true }
    });
    await clearCache('products*');
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/products/:id — update product (admin)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, compareAtPrice, slug, category, images, stock, isFeatured, seoTitle, seoDesc } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id as string },
      data: {
        name, description, price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        slug, category, images: images || [],
        stock: Number(stock) || 0,
        isFeatured: Boolean(isFeatured),
        seoTitle, seoDesc
      }
    });
    await clearCache('products*');
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/products/:id — delete product (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id as string } });
    await clearCache('products*');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
