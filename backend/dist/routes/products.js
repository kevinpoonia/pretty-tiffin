"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const router = (0, express_1.Router)();
// GET /api/products — list all products (public)
router.get('/', (0, cache_1.cacheMiddleware)(3600), async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            include: {
                customizationOptions: true,
                reviews: { select: { rating: true } },
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/products/:slug/reviews — product reviews (public) — MUST be before /:slug
router.get('/:slug/reviews', async (req, res) => {
    try {
        const product = await prisma_1.prisma.product.findUnique({ where: { slug: req.params.slug } });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        const reviews = await prisma_1.prisma.review.findMany({
            where: { productId: product.id },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const avgRating = reviews.length
            ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
            : 0;
        res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/products/:slug/reviews — add review (authenticated)
router.post('/:slug/reviews', auth_1.authenticate, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ error: 'Rating must be between 1 and 5' });
            return;
        }
        const product = await prisma_1.prisma.product.findUnique({ where: { slug: req.params.slug } });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        // Check if user already reviewed this product
        const existing = await prisma_1.prisma.review.findFirst({
            where: { userId: req.user.id, productId: product.id }
        });
        if (existing) {
            res.status(409).json({ error: 'You have already reviewed this product' });
            return;
        }
        const review = await prisma_1.prisma.review.create({
            data: { userId: req.user.id, productId: product.id, rating: Number(rating), comment },
            include: { user: { select: { name: true } } }
        });
        res.status(201).json(review);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/products/:slug — single product (public)
router.get('/:slug', (0, cache_1.cacheMiddleware)(3600), async (req, res) => {
    try {
        const product = await prisma_1.prisma.product.findUnique({
            where: { slug: req.params.slug },
            include: {
                customizationOptions: true,
                reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
            }
        });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/products — create product (admin)
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, price, compareAtPrice, slug, category, images, stock, isFeatured, seoTitle, seoDesc, customizationOptions } = req.body;
        const product = await prisma_1.prisma.product.create({
            data: {
                name, description, price: Number(price),
                compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
                slug, category, images: images || [],
                stock: Number(stock) || 0,
                isFeatured: Boolean(isFeatured),
                seoTitle, seoDesc,
                customizationOptions: {
                    create: (customizationOptions || []).map((opt) => ({
                        type: opt.type, label: opt.label, values: opt.values || [], priceOffset: Number(opt.priceOffset) || 0
                    }))
                }
            },
            include: { customizationOptions: true }
        });
        await (0, cache_1.clearCache)('products*');
        res.status(201).json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/products/:id — update product (admin)
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, price, compareAtPrice, slug, category, images, stock, isFeatured, seoTitle, seoDesc } = req.body;
        const product = await prisma_1.prisma.product.update({
            where: { id: req.params.id },
            data: {
                name, description, price: Number(price),
                compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
                slug, category, images: images || [],
                stock: Number(stock) || 0,
                isFeatured: Boolean(isFeatured),
                seoTitle, seoDesc
            }
        });
        await (0, cache_1.clearCache)('products*');
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/products/:id — delete product (admin)
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        await prisma_1.prisma.product.delete({ where: { id: req.params.id } });
        await (0, cache_1.clearCache)('products*');
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map