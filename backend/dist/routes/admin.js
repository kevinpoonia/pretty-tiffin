"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const email_1 = require("./email");
const notifications_1 = require("../notifications");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, auth_1.requireAdmin);
// ─── Stats (with trends + 7-day chart) ───────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const [totalUsers, totalOrders, totalProducts, thisMonthOrders, lastMonthOrders, thisMonthUsers, lastMonthUsers, recentOrdersRaw] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.order.count(),
            prisma_1.prisma.product.count(),
            prisma_1.prisma.order.findMany({ where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } }, select: { totalAmount: true, createdAt: true } }),
            prisma_1.prisma.order.findMany({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: 'CANCELLED' } }, select: { totalAmount: true } }),
            prisma_1.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma_1.prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
            prisma_1.prisma.order.findMany({
                where: { createdAt: { gte: sevenDaysAgo }, status: { not: 'CANCELLED' } },
                select: { totalAmount: true, createdAt: true }
            })
        ]);
        const revenue = thisMonthOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
        const lastRevenue = lastMonthOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
        const pct = (curr, prev) => prev === 0 ? 100 : Math.round(((curr - prev) / prev) * 100);
        // 7-day revenue chart
        const revenueByDay = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            const amount = recentOrdersRaw
                .filter(o => new Date(o.createdAt).toDateString() === d.toDateString())
                .reduce((s, o) => s + Number(o.totalAmount), 0);
            revenueByDay.push({ date: label, amount });
        }
        // Total all-time revenue
        const allOrders = await prisma_1.prisma.order.findMany({ where: { status: { not: 'CANCELLED' } }, select: { totalAmount: true } });
        const totalRevenue = allOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
        res.json({
            totalUsers, totalOrders, totalProducts,
            revenue: totalRevenue,
            monthRevenue: revenue,
            revenueChange: pct(revenue, lastRevenue),
            ordersChange: pct(thisMonthOrders.length, lastMonthOrders.length),
            usersChange: pct(thisMonthUsers, lastMonthUsers),
            avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
            revenueByDay
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ─── Orders ──────────────────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
    try {
        const { status, page = '1', limit = '50' } = req.query;
        const where = status ? { status: status } : {};
        const orders = await prisma_1.prisma.order.findMany({
            where,
            include: {
                user: { select: { name: true, email: true, phone: true } },
                items: { include: { product: { select: { name: true, images: true } } } },
                statusHistory: { orderBy: { createdAt: 'asc' } },
                giftOption: true
            },
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            skip: (Number(page) - 1) * Number(limit)
        });
        const total = await prisma_1.prisma.order.count({ where });
        res.json({ orders, total });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { status, trackingId, note, notify } = req.body;
        if (!status) {
            res.status(400).json({ error: 'status is required' });
            return;
        }
        const updateData = { status };
        if (trackingId)
            updateData.trackingNumber = trackingId;
        const order = await prisma_1.prisma.order.update({
            where: { id: String(req.params.id) },
            data: updateData,
            include: {
                user: { select: { name: true, email: true, phone: true } },
                items: { include: { product: { select: { name: true } } } },
                statusHistory: { orderBy: { createdAt: 'asc' } }
            }
        });
        // Record status history
        await prisma_1.prisma.orderStatusHistory.create({
            data: { orderId: order.id, status, trackingId: trackingId || null, note: note || null }
        });
        // Send notifications
        if (notify && order.user) {
            const message = (0, notifications_1.getStatusMessage)(status, order.id, trackingId);
            const subject = `Order Update: ${status.charAt(0) + status.slice(1).toLowerCase()} — Pretty Luxe Atelier`;
            Promise.allSettled([
                (0, email_1.sendEmail)(order.user.email, subject, (0, email_1.orderStatusUpdateEmail)(order.user.name, order.id, status, trackingId, note)),
                order.user.phone ? (0, notifications_1.sendSMS)(order.user.phone, message) : Promise.resolve(),
                order.user.phone ? (0, notifications_1.sendWhatsApp)(order.user.phone, message) : Promise.resolve()
            ]).catch(console.error);
        }
        // Re-fetch with updated history
        const updated = await prisma_1.prisma.order.findUnique({
            where: { id: order.id },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                items: { include: { product: { select: { name: true, images: true } } } },
                statusHistory: { orderBy: { createdAt: 'asc' } },
                giftOption: true
            }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update order' });
    }
});
// ─── Products ────────────────────────────────────────────────────────────────
router.get('/products', async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            include: { customizationOptions: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/products', async (req, res) => {
    try {
        const { name, description, price, compareAtPrice, slug, category, images, stock, isFeatured, seoTitle, seoDesc, customizationOptions } = req.body;
        const product = await prisma_1.prisma.product.create({
            data: {
                name, description, slug, category,
                price: Number(price),
                compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
                images: images || [],
                stock: Number(stock) || 0,
                isFeatured: Boolean(isFeatured),
                seoTitle: seoTitle || null,
                seoDesc: seoDesc || null,
                customizationOptions: {
                    create: (customizationOptions || []).map((opt) => ({
                        type: opt.type, label: opt.label,
                        values: opt.values || [], priceOffset: Number(opt.priceOffset) || 0
                    }))
                }
            },
            include: { customizationOptions: true }
        });
        await (0, cache_1.clearCache)('/api/products*');
        res.status(201).json(product);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to create product' });
    }
});
router.put('/products/:id', async (req, res) => {
    try {
        const { name, description, price, compareAtPrice, slug, category, images, stock, isFeatured, seoTitle, seoDesc, customizationOptions } = req.body;
        if (customizationOptions) {
            await prisma_1.prisma.customizationOption.deleteMany({ where: { productId: String(req.params.id) } });
        }
        const product = await prisma_1.prisma.product.update({
            where: { id: String(req.params.id) },
            data: {
                name, description, slug, category,
                price: Number(price),
                compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
                images, stock: Number(stock), isFeatured,
                seoTitle: seoTitle || null, seoDesc: seoDesc || null,
                customizationOptions: customizationOptions ? {
                    create: customizationOptions.map((opt) => ({
                        type: opt.type, label: opt.label,
                        values: opt.values || [], priceOffset: Number(opt.priceOffset) || 0
                    }))
                } : undefined
            },
            include: { customizationOptions: true }
        });
        await (0, cache_1.clearCache)('/api/products*');
        res.json(product);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update product' });
    }
});
router.delete('/products/:id', async (req, res) => {
    try {
        await prisma_1.prisma.product.delete({ where: { id: String(req.params.id) } });
        await (0, cache_1.clearCache)('/api/products*');
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/products/:id/featured', async (req, res) => {
    try {
        const { isFeatured } = req.body;
        const product = await prisma_1.prisma.product.update({ where: { id: String(req.params.id) }, data: { isFeatured } });
        await (0, cache_1.clearCache)('/api/products*');
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ─── Customers ───────────────────────────────────────────────────────────────
router.get('/customers', async (req, res) => {
    try {
        const { search } = req.query;
        const where = search ? {
            OR: [
                { name: { contains: String(search), mode: 'insensitive' } },
                { email: { contains: String(search), mode: 'insensitive' } }
            ]
        } : {};
        const customers = await prisma_1.prisma.user.findMany({
            where,
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true,
                orders: { select: { id: true, totalAmount: true, status: true, createdAt: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ─── Coupons ─────────────────────────────────────────────────────────────────
router.get('/coupons', async (req, res) => {
    try {
        const coupons = await prisma_1.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(coupons);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/coupons', async (req, res) => {
    try {
        const { code, type, value, expireAt, usageLimit } = req.body;
        if (!code || !type || !value) {
            res.status(400).json({ error: 'code, type, value required' });
            return;
        }
        const coupon = await prisma_1.prisma.coupon.create({
            data: { code: code.toUpperCase(), type, value: Number(value), expireAt: expireAt ? new Date(expireAt) : null, usageLimit: usageLimit ? Number(usageLimit) : null }
        });
        res.status(201).json(coupon);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to create coupon' });
    }
});
router.delete('/coupons/:id', async (req, res) => {
    try {
        await prisma_1.prisma.coupon.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ─── Cache ───────────────────────────────────────────────────────────────────
router.post('/clear-cache', async (req, res) => {
    try {
        await (0, cache_1.clearCache)('*');
        res.json({ success: true, message: 'Cache cleared' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to clear cache' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map