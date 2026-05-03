import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = Router();

// GET /api/products — list all products (public)
router.get('/', cacheMiddleware(3600), async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        customizationOptions: true,
        currencyPrices: true,
        reviews: { select: { rating: true } },
        adminReviews: { orderBy: { createdAt: 'desc' } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    const result = products.map(({ reviews, _count, ...p }) => ({
      ...p,
      reviewCount: _count.reviews,
      avgRating: reviews.length
        ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10
        : 0,
    }));
    res.json(result);
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

    const [reviews, adminReviews] = await Promise.all([
      prisma.review.findMany({
        where: { productId: product.id },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.adminReview.findMany({
        where: { productId: product.id },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const allRatings = [
      ...reviews.map((r: { rating: number }) => r.rating),
      ...adminReviews.map((r: { rating: number }) => r.rating)
    ];
    const avgRating = allRatings.length
      ? allRatings.reduce((s, r) => s + r, 0) / allRatings.length
      : 0;
    res.json({
      reviews,
      adminReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      total: allRatings.length
    });
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
        currencyPrices: true,
        adminReviews: { orderBy: { createdAt: 'desc' } },
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

// ─── Admin Product Routes ────────────────────────────────────────────────────

// POST /api/products — create product (admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name, description, price, compareAtPrice, slug, category, images, stock, isFeatured,
      seoTitle, seoDesc, customizationOptions,
      hasSteel, hasEngraving, featuresAndSpecs, shippingInfo, warrantyInfo,
      manualReviewCount, manualAvgRating,
      currencyPrices, adminReviews
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name, description, price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        slug, category, images: images || [],
        stock: Number(stock) || 0,
        isFeatured: Boolean(isFeatured),
        seoTitle, seoDesc,
        hasSteel: Boolean(hasSteel),
        hasEngraving: Boolean(hasEngraving),
        featuresAndSpecs: featuresAndSpecs || null,
        shippingInfo: shippingInfo || null,
        warrantyInfo: warrantyInfo || null,
        manualReviewCount: manualReviewCount ? Number(manualReviewCount) : null,
        manualAvgRating: manualAvgRating ? Number(manualAvgRating) : null,
        customizationOptions: {
          create: (customizationOptions || []).map((opt: any) => ({
            type: opt.type, label: opt.label, values: opt.values || [], priceOffset: Number(opt.priceOffset) || 0
          }))
        },
        currencyPrices: {
          create: (currencyPrices || []).filter((cp: any) => cp.currency && cp.price).map((cp: any) => ({
            currency: cp.currency.toUpperCase(),
            symbol: cp.symbol || cp.currency,
            price: Number(cp.price),
            compareAtPrice: cp.compareAtPrice ? Number(cp.compareAtPrice) : null
          }))
        },
        adminReviews: {
          create: (adminReviews || []).filter((ar: any) => ar.reviewerName && ar.rating && ar.comment).map((ar: any) => ({
            reviewerName: ar.reviewerName,
            location: ar.location || null,
            rating: Number(ar.rating),
            comment: ar.comment,
            isVerified: true
          }))
        }
      },
      include: { customizationOptions: true, currencyPrices: true, adminReviews: true }
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
    const {
      name, description, price, compareAtPrice, slug, category, images, stock, isFeatured,
      seoTitle, seoDesc, customizationOptions,
      hasSteel, hasEngraving, featuresAndSpecs, shippingInfo, warrantyInfo,
      manualReviewCount, manualAvgRating,
      currencyPrices, adminReviews
    } = req.body;
    const productId = req.params.id as string;

    // Replace customization options
    await prisma.customizationOption.deleteMany({ where: { productId } });
    // Replace currency prices
    await prisma.currencyPrice.deleteMany({ where: { productId } });
    // Replace admin reviews
    await prisma.adminReview.deleteMany({ where: { productId } });

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name, description, price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        slug, category, images: images || [],
        stock: Number(stock) || 0,
        isFeatured: Boolean(isFeatured),
        seoTitle, seoDesc,
        hasSteel: Boolean(hasSteel),
        hasEngraving: Boolean(hasEngraving),
        featuresAndSpecs: featuresAndSpecs || null,
        shippingInfo: shippingInfo || null,
        warrantyInfo: warrantyInfo || null,
        manualReviewCount: manualReviewCount ? Number(manualReviewCount) : null,
        manualAvgRating: manualAvgRating ? Number(manualAvgRating) : null,
        customizationOptions: {
          create: (customizationOptions || []).map((opt: any) => ({
            type: opt.type, label: opt.label, values: opt.values || [], priceOffset: Number(opt.priceOffset) || 0
          }))
        },
        currencyPrices: {
          create: (currencyPrices || []).filter((cp: any) => cp.currency && cp.price).map((cp: any) => ({
            currency: cp.currency.toUpperCase(),
            symbol: cp.symbol || cp.currency,
            price: Number(cp.price),
            compareAtPrice: cp.compareAtPrice ? Number(cp.compareAtPrice) : null
          }))
        },
        adminReviews: {
          create: (adminReviews || []).filter((ar: any) => ar.reviewerName && ar.rating && ar.comment).map((ar: any) => ({
            reviewerName: ar.reviewerName,
            location: ar.location || null,
            rating: Number(ar.rating),
            comment: ar.comment,
            isVerified: true
          }))
        }
      },
      include: { customizationOptions: true, currencyPrices: true, adminReviews: true }
    });
    await clearCache('products*');
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/products/:id — delete product (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const productId = req.params.id as string;
    // Clean up related records first
    await prisma.adminReview.deleteMany({ where: { productId } });
    await prisma.currencyPrice.deleteMany({ where: { productId } });
    await prisma.customizationOption.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
    await clearCache('products*');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
