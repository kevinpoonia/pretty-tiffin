"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redis_1 = require("../redis");
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Middleware to resolve cart key (user:id or cart:session)
const resolveCartKey = async (req) => {
    const sessionId = req.headers['x-session-id'];
    const user = req.user;
    if (user) {
        const userKey = `usercart:${user.id}`;
        // Merge guest cart if exists
        if (sessionId) {
            const guestKey = `cart:${sessionId}`;
            const guestCartStr = await redis_1.redis.get(guestKey);
            if (guestCartStr) {
                const guestCart = JSON.parse(guestCartStr);
                const userCartStr = await redis_1.redis.get(userKey);
                let userCart = userCartStr ? JSON.parse(userCartStr) : { items: [], total: 0 };
                // Simple merge: append items
                userCart.items = [...userCart.items, ...guestCart.items];
                userCart.total = userCart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                await redis_1.redis.setex(userKey, 60 * 60 * 24 * 30, JSON.stringify(userCart)); // 30 days for users
                await redis_1.redis.del(guestKey);
            }
        }
        return userKey;
    }
    return sessionId ? `cart:${sessionId}` : null;
};
router.use(auth_1.authenticate); // This middleware is soft, doesn't block if no token
router.get('/', async (req, res) => {
    try {
        const cartKey = await resolveCartKey(req);
        if (!cartKey)
            return res.json({ items: [], total: 0 });
        const cart = await redis_1.redis.get(cartKey);
        res.json(cart ? JSON.parse(cart) : { items: [], total: 0 });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', async (req, res) => {
    try {
        const cartKey = await resolveCartKey(req);
        if (!cartKey) {
            // Create a session if none exists
            const newSid = (0, uuid_1.v4)();
            res.setHeader('x-session-id', newSid);
            const { productId, quantity, customization, giftOption, price, name, imageUrl } = req.body;
            const newItem = { id: (0, uuid_1.v4)(), productId, quantity, customization, giftOption, price, name, imageUrl };
            const cart = { items: [newItem], total: price * quantity };
            await redis_1.redis.setex(`cart:${newSid}`, 60 * 60 * 24 * 7, JSON.stringify(cart));
            return res.json(cart);
        }
        const { productId, quantity, customization, giftOption, price, name, imageUrl, updateOnly, id } = req.body;
        let cart = { items: [], total: 0 };
        const existingStr = await redis_1.redis.get(cartKey);
        if (existingStr) {
            cart = JSON.parse(existingStr);
        }
        if (updateOnly && id) {
            const itemIndex = cart.items.findIndex((i) => i.id === id);
            if (itemIndex > -1) {
                cart.total -= (cart.items[itemIndex].price * cart.items[itemIndex].quantity);
                cart.items[itemIndex].quantity = quantity;
                cart.total += (cart.items[itemIndex].price * quantity);
            }
        }
        else {
            const newItem = {
                id: (0, uuid_1.v4)(),
                productId,
                quantity,
                customization,
                giftOption,
                price,
                name,
                imageUrl
            };
            cart.items.push(newItem);
            cart.total += (price * quantity);
        }
        const ttl = cartKey.startsWith('usercart:') ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
        await redis_1.redis.setex(cartKey, ttl, JSON.stringify(cart));
        res.json(cart);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/', async (req, res) => {
    try {
        const cartKey = await resolveCartKey(req);
        if (cartKey)
            await redis_1.redis.del(cartKey);
        res.json({ items: [], total: 0 });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:itemId', async (req, res) => {
    try {
        const cartKey = await resolveCartKey(req);
        if (!cartKey)
            return res.json({ items: [], total: 0 });
        const existingStr = await redis_1.redis.get(cartKey);
        if (!existingStr)
            return res.json({ items: [], total: 0 });
        let cart = JSON.parse(existingStr);
        const itemIndex = cart.items.findIndex((i) => i.id === req.params.itemId);
        if (itemIndex > -1) {
            cart.total -= (cart.items[itemIndex].price * cart.items[itemIndex].quantity);
            cart.items.splice(itemIndex, 1);
            const ttl = cartKey.startsWith('usercart:') ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
            await redis_1.redis.setex(cartKey, ttl, JSON.stringify(cart));
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