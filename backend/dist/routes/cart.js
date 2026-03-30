"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redis_1 = require("../redis");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// Middleware to ensure session exists
const sessionMiddleware = (req, res, next) => {
    let sessionId = req.headers['x-session-id'];
    if (!sessionId) {
        sessionId = (0, uuid_1.v4)();
        res.setHeader('x-session-id', sessionId);
    }
    req.sessionId = sessionId;
    next();
};
router.use(sessionMiddleware);
router.get('/', async (req, res) => {
    try {
        const sessionId = req.sessionId;
        const cart = await redis_1.redis.get(`cart:${sessionId}`);
        res.json(cart ? JSON.parse(cart) : { items: [], total: 0 });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', async (req, res) => {
    try {
        const sessionId = req.sessionId;
        const { productId, quantity, customization, price } = req.body;
        let cart = { items: [], total: 0 };
        const existingStr = await redis_1.redis.get(`cart:${sessionId}`);
        if (existingStr) {
            cart = JSON.parse(existingStr);
        }
        const newItem = {
            id: (0, uuid_1.v4)(),
            productId,
            quantity,
            customization,
            price
        };
        cart.items.push(newItem);
        cart.total += (price * quantity);
        await redis_1.redis.setex(`cart:${sessionId}`, 60 * 60 * 24 * 7, JSON.stringify(cart)); // 7 days
        res.json(cart);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:itemId', async (req, res) => {
    try {
        const sessionId = req.sessionId;
        const { itemId } = req.params;
        const existingStr = await redis_1.redis.get(`cart:${sessionId}`);
        if (!existingStr) {
            res.json({ items: [], total: 0 });
            return;
        }
        let cart = JSON.parse(existingStr);
        const itemIndex = cart.items.findIndex((i) => i.id === itemId);
        if (itemIndex > -1) {
            cart.total -= (cart.items[itemIndex].price * cart.items[itemIndex].quantity);
            cart.items.splice(itemIndex, 1);
            await redis_1.redis.setex(`cart:${sessionId}`, 60 * 60 * 24 * 7, JSON.stringify(cart));
        }
        res.json(cart);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=cart.js.map