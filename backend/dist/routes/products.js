"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const router = (0, express_1.Router)();
// Get all products (public)
router.get('/', (0, cache_1.cacheMiddleware)(3600), async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            include: { customizationOptions: true }
        });
        res.json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get product by slug
router.get('/:slug', (0, cache_1.cacheMiddleware)(3600), async (req, res) => {
    try {
        const product = await prisma_1.prisma.product.findUnique({
            where: { slug: req.params.slug },
            include: { customizationOptions: true, reviews: true }
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
// Create product (Admin only)
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, price, slug, category, images } = req.body;
        const product = await prisma_1.prisma.product.create({
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
        await (0, cache_1.clearCache)('products*');
        res.status(201).json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map