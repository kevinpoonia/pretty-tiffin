"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get user profile & addresses
router.get('/profile', auth_1.authenticate, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { addresses: true }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { password: _, ...userData } = user;
        res.json(userData);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Get addresses
router.get('/addresses', auth_1.authenticate, async (req, res) => {
    try {
        const addresses = await prisma_1.prisma.address.findMany({
            where: { userId: req.user.id },
            orderBy: { isDefault: 'desc' }
        });
        res.json(addresses);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Add address
router.post('/addresses', auth_1.authenticate, async (req, res) => {
    try {
        const { street, city, state, pincode, country, isDefault } = req.body;
        if (isDefault) {
            await prisma_1.prisma.address.updateMany({
                where: { userId: req.user.id },
                data: { isDefault: false }
            });
        }
        const address = await prisma_1.prisma.address.create({
            data: {
                userId: req.user.id,
                street,
                city,
                state,
                pincode,
                country: country || 'India',
                isDefault: !!isDefault
            }
        });
        res.status(201).json(address);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Delete address
router.delete('/addresses/:id', auth_1.authenticate, async (req, res) => {
    try {
        await prisma_1.prisma.address.delete({
            where: { id: req.params.id, userId: req.user.id }
        });
        res.json({ message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map