"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Validate coupon
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const coupon = await prisma_1.prisma.coupon.findUnique({ where: { code: code } });
        if (!coupon) {
            res.status(404).json({ error: 'Coupon not found' });
            return;
        }
        if (coupon.expireAt && coupon.expireAt < new Date()) {
            res.status(400).json({ error: 'Coupon expired' });
            return;
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            res.status(400).json({ error: 'Coupon usage limit reached' });
            return;
        }
        res.json(coupon);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Admin: Create coupon
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { code, type, value, expireAt, usageLimit } = req.body;
        const coupon = await prisma_1.prisma.coupon.create({
            data: {
                code,
                type,
                value,
                expireAt: expireAt ? new Date(expireAt) : null,
                usageLimit
            }
        });
        res.status(201).json(coupon);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=coupon.js.map