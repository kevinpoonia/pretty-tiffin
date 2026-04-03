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
const router = (0, express_1.Router)();
const getUserOrders = async (userId) => {
    return prisma_1.prisma.order.findMany({
        where: { userId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
    });
};
// Create Payment Intent (Razorpay Order)
router.post('/create-intent', auth_1.authenticate, async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;
        const options = {
            amount: parseInt(amount, 10) * 100, // amount in the smallest currency unit
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
// Verify Payment and Create DB Order
router.post('/verify', auth_1.authenticate, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, totalAmount, items, // array of { productId, quantity, price, customizationDetails }
        paymentMethod, shippingAddress, giftDetails // { occasion, message, scheduledFor, packaging }
         } = req.body;
        const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
        if (paymentMethod === 'RAZORPAY') {
            const shasum = crypto_1.default.createHmac('sha256', secret);
            shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
            const digest = shasum.digest('hex');
            if (digest !== razorpay_signature) {
                res.status(400).json({ error: 'Transaction not legit!' });
                return;
            }
        }
        // Create GiftOption if details provided
        let giftOption = null;
        if (giftDetails && (giftDetails.occasion || giftDetails.message)) {
            giftOption = await prisma_1.prisma.giftOption.create({
                data: {
                    occasion: giftDetails.occasion,
                    message: giftDetails.message,
                    scheduledFor: giftDetails.scheduledFor ? new Date(giftDetails.scheduledFor) : null,
                    packaging: giftDetails.packaging
                }
            });
        }
        const newOrder = await prisma_1.prisma.order.create({
            data: {
                userId: req.user.id,
                totalAmount,
                paymentMethod,
                paymentRef: paymentMethod === 'RAZORPAY' ? razorpay_payment_id : null,
                shippingAddress: JSON.stringify(shippingAddress),
                giftOptionId: giftOption ? giftOption.id : null,
                status: 'CONFIRMED',
                items: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        customizationDetails: JSON.stringify(item.customizationDetails || {})
                    }))
                }
            },
            include: { items: true, giftOption: true }
        });
        res.json(newOrder);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get User Orders
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const orders = await getUserOrders(req.user.id);
        res.json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/my-orders', auth_1.authenticate, async (req, res) => {
    try {
        const orders = await getUserOrders(req.user.id);
        res.json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map