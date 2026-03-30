"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
// Create gift option
router.post('/', async (req, res) => {
    try {
        const { occasion, message, scheduledFor, packaging } = req.body;
        const giftOption = await prisma_1.prisma.giftOption.create({
            data: {
                occasion,
                message,
                scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
                packaging
            }
        });
        res.status(201).json(giftOption);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=gift.js.map