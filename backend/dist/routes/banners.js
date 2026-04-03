"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const router = (0, express_1.Router)();
// Get active banners (public)
router.get('/', (0, cache_1.cacheMiddleware)(3600), async (req, res) => {
    try {
        const banners = await prisma_1.prisma.banner.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        res.json(banners);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Create banner (Admin)
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { title, subtitle, imageUrl, link, order } = req.body;
        const banner = await prisma_1.prisma.banner.create({
            data: { title, subtitle, imageUrl, link, order: Number(order) || 0 }
        });
        await (0, cache_1.clearCache)('banners*');
        res.status(201).json(banner);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Delete banner (Admin)
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        await prisma_1.prisma.banner.delete({ where: { id: req.params.id } });
        await (0, cache_1.clearCache)('banners*');
        res.json({ message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=banners.js.map