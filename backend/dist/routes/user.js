"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const bcrypt_1 = __importDefault(require("bcrypt"));
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
        if (!street || !city || !state || !pincode) {
            res.status(400).json({ error: 'Street, city, state, and pincode are required' });
            return;
        }
        const existingAddresses = await prisma_1.prisma.address.findMany({
            where: { userId: req.user.id },
            select: { id: true }
        });
        const shouldBeDefault = !!isDefault || existingAddresses.length === 0;
        if (shouldBeDefault) {
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
                isDefault: shouldBeDefault
            }
        });
        res.status(201).json(address);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Update address
router.put('/addresses/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { street, city, state, pincode, country, isDefault } = req.body;
        if (!street || !city || !state || !pincode) {
            res.status(400).json({ error: 'Street, city, state, and pincode are required' });
            return;
        }
        const existingAddress = await prisma_1.prisma.address.findFirst({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!existingAddress) {
            res.status(404).json({ error: 'Address not found' });
            return;
        }
        if (isDefault) {
            await prisma_1.prisma.address.updateMany({
                where: { userId: req.user.id },
                data: { isDefault: false }
            });
        }
        const address = await prisma_1.prisma.address.update({
            where: { id: existingAddress.id },
            data: {
                street,
                city,
                state,
                pincode,
                country: country || 'India',
                isDefault: !!isDefault
            }
        });
        res.json(address);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Delete address
router.delete('/addresses/:id', auth_1.authenticate, async (req, res) => {
    try {
        const address = await prisma_1.prisma.address.findFirst({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!address) {
            res.status(404).json({ error: 'Address not found' });
            return;
        }
        await prisma_1.prisma.address.delete({
            where: { id: address.id }
        });
        if (address.isDefault) {
            const nextAddress = await prisma_1.prisma.address.findFirst({
                where: { userId: req.user.id },
                orderBy: { createdAt: 'asc' }
            });
            if (nextAddress) {
                await prisma_1.prisma.address.update({
                    where: { id: nextAddress.id },
                    data: { isDefault: true }
                });
            }
        }
        res.json({ message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Update profile
router.put('/profile', auth_1.authenticate, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        if (!name || !email) {
            res.status(400).json({ error: 'Name and email are required' });
            return;
        }
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: {
                email,
                NOT: { id: req.user.id }
            }
        });
        if (existingUser) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: req.user.id },
            data: {
                name,
                email,
                phone: phone || null
            }
        });
        const { password: _, ...userData } = updatedUser;
        res.json(userData);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── Wishlist ─────────────────────────────────────────────────────────────────
// GET /api/users/wishlist
router.get('/wishlist', auth_1.authenticate, async (req, res) => {
    try {
        const wishlist = await prisma_1.prisma.wishlist.findMany({
            where: { userId: req.user.id },
            include: { product: { include: { customizationOptions: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(wishlist);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/users/wishlist
router.post('/wishlist', auth_1.authenticate, async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            res.status(400).json({ error: 'productId required' });
            return;
        }
        const item = await prisma_1.prisma.wishlist.upsert({
            where: { userId_productId: { userId: req.user.id, productId } },
            update: {},
            create: { userId: req.user.id, productId }
        });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE /api/users/wishlist/:productId
router.delete('/wishlist/:productId', auth_1.authenticate, async (req, res) => {
    try {
        await prisma_1.prisma.wishlist.deleteMany({
            where: { userId: req.user.id, productId: req.params.productId }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── Password ─────────────────────────────────────────────────────────────────
// Update password
router.put('/password', auth_1.authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Current password and new password are required' });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ error: 'New password must be at least 6 characters' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isValidPassword = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            res.status(400).json({ error: 'Current password is incorrect' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map