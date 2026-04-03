"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All admin routes require auth + admin role
router.use(auth_1.authenticate, auth_1.requireAdmin);
// ─── Dashboard Stats ──────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalOrders, totalProducts, allOrders] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.order.count(),
            prisma_1.prisma.product.count(),
            prisma_1.prisma.order.findMany({ select: { totalAmount: true } })
        ]);
        const revenue = allOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        res.json({ totalUsers, totalOrders, totalProducts, revenue });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ─── Products ────────────────────────────────────────────────────────────────
router.get('/products', async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/products', async (req, res) => {
    try {
        const { name, description, price, compareAtPrice, slug, category, images, stock, customizationOptions } = req.body;
        const product = await prisma_1.prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
                slug,
                category,
                images: images || [],
                stock: Number(stock) || 0,
                customizationOptions: {
                    create: (customizationOptions || []).map((opt) => ({
                        type: opt.type,
                        label: opt.label,
                        values: opt.values || [],
                        priceOffset: Number(opt.priceOffset) || 0
                    }))
                }
            },
            include: { customizationOptions: true }
        });
        res.status(201).json(product);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message || 'Failed to create product' });
    }
});
router.put('/products/:id', async (req, res) => {
    try {
        const { name, description, price, compareAtPrice, slug, category, images, stock, isFeatured, customizationOptions } = req.body;
        // For simplicity, we delete and recreate customization options on update
        // A more robust approach would be to use upsert/deleteMany
        if (customizationOptions) {
            await prisma_1.prisma.customizationOption.deleteMany({
                where: { productId: String(req.params.id) }
            });
        }
        const product = await prisma_1.prisma.product.update({
            where: { id: String(req.params.id) },
            data: {
                name,
                description,
                price: Number(price),
                compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
                slug,
                category,
                images,
                stock: Number(stock),
                isFeatured,
                customizationOptions: customizationOptions ? {
                    create: customizationOptions.map((opt) => ({
                        type: opt.type,
                        label: opt.label,
                        values: opt.values || [],
                        priceOffset: Number(opt.priceOffset) || 0
                    }))
                } : undefined
            },
            include: { customizationOptions: true }
        });
        res.json(product);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update product' });
    }
});
router.delete('/products/:id', async (req, res) => {
    try {
        await prisma_1.prisma.product.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ─── Orders ──────────────────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
    try {
        const orders = await prisma_1.prisma.order.findMany({
            include: { user: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await prisma_1.prisma.order.update({
            where: { id: String(req.params.id) },
            data: { status }
        });
        res.json(order);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update order' });
    }
});
// ─── Customers ───────────────────────────────────────────────────────────────
router.get('/customers', async (req, res) => {
    try {
        const customers = await prisma_1.prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true, orders: { select: { id: true, totalAmount: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
const cache_1 = require("../middleware/cache");
// ... existing code ...
router.get('/clear-cache', async (req, res) => {
    try {
        await (0, cache_1.clearCache)('*');
        res.json({ success: true, message: 'Cache cleared successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to clear cache' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map