"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
// Get customizations for a product
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const options = await prisma_1.prisma.customizationOption.findMany({
            where: { productId: productId }
        });
        res.json(options);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Admin: Add customization to a product
const auth_1 = require("../middleware/auth");
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { productId, type, label, values, priceOffset } = req.body;
        const option = await prisma_1.prisma.customizationOption.create({
            data: {
                productId,
                type,
                label,
                values,
                priceOffset: priceOffset || 0
            }
        });
        res.status(201).json(option);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=customization.js.map