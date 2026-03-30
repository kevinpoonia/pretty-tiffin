"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Dashboard Stats
router.get('/stats', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const [totalUsers, totalOrders, totalProducts, allOrders] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.order.count(),
            prisma_1.prisma.product.count(),
            prisma_1.prisma.order.findMany({ select: { totalAmount: true } })
        ]);
        const revenue = allOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            revenue
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map