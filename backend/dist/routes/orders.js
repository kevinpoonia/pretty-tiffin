"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const razorpay_1 = require("../razorpay");
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("./email");
const router = (0, express_1.Router)();
const getUserOrders = async (userId) => {
    return prisma_1.prisma.order.findMany({
        where: { userId },
        include: {
            items: { include: { product: { select: { name: true, images: true, slug: true } } } },
            giftOption: true
        },
        orderBy: { createdAt: 'desc' }
    });
};
// POST /api/orders/create-intent — Create Razorpay order
router.post('/create-intent', auth_1.authenticate, async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;
        const options = {
            amount: Math.round(Number(amount) * 100),
            currency,
            receipt: receipt || `receipt_${Date.now()}`
        };
        const order = await razorpay_1.razorpay.orders.create(options);
        res.json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating Razorpay order' });
    }
});
// POST /api/orders/verify — Verify payment & create DB order
router.post('/verify', auth_1.authenticate, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, totalAmount, items, paymentMethod, shippingAddress, giftDetails } = req.body;
        if (paymentMethod === 'RAZORPAY') {
            const secret = process.env.RAZORPAY_KEY_SECRET || '';
            const shasum = crypto_1.default.createHmac('sha256', secret);
            shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
            if (shasum.digest('hex') !== razorpay_signature) {
                res.status(400).json({ error: 'Payment signature mismatch' });
                return;
            }
        }
        let giftOptionId = null;
        if (giftDetails && (giftDetails.occasion || giftDetails.message)) {
            const go = await prisma_1.prisma.giftOption.create({
                data: {
                    occasion: giftDetails.occasion,
                    message: giftDetails.message,
                    scheduledFor: giftDetails.scheduledFor ? new Date(giftDetails.scheduledFor) : null,
                    packaging: giftDetails.packaging
                }
            });
            giftOptionId = go.id;
        }
        const newOrder = await prisma_1.prisma.order.create({
            data: {
                userId: req.user.id,
                totalAmount: Number(totalAmount),
                paymentMethod,
                paymentRef: paymentMethod === 'RAZORPAY' ? razorpay_payment_id : null,
                shippingAddress: JSON.stringify(shippingAddress),
                giftOptionId,
                status: 'CONFIRMED',
                items: {
                    create: (items || []).map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: Number(item.price),
                        customizationDetails: JSON.stringify(item.customizationDetails || {})
                    }))
                }
            },
            include: { items: { include: { product: { select: { name: true } } } }, giftOption: true }
        });
        // Send order confirmation email (fire-and-forget)
        const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id }, select: { email: true, name: true } });
        if (user) {
            const emailItems = newOrder.items.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.price }));
            (0, email_1.sendEmail)(user.email, 'Your Pretty Tiffin Order is Confirmed! 🎉', (0, email_1.orderConfirmationEmail)(user.name, newOrder.id, totalAmount, emailItems)).catch(console.error);
        }
        res.json(newOrder);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/orders — current user's orders
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const orders = await getUserOrders(req.user.id);
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/orders/my-orders — alias
router.get('/my-orders', auth_1.authenticate, async (req, res) => {
    try {
        const orders = await getUserOrders(req.user.id);
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PATCH /api/orders/:id/status — admin update order status
router.patch('/:id/status', auth_1.authenticate, async (req, res) => {
    try {
        const { status, trackingNumber } = req.body;
        const updated = await prisma_1.prisma.order.update({
            where: { id: req.params.id },
            data: {
                ...(status && { status }),
                ...(trackingNumber !== undefined && { trackingNumber })
            }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map