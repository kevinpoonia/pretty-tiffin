import { Router, Request, Response } from 'express';
import { redis } from '../redis';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth';

const router = Router();

// Middleware to resolve cart key (user:id or cart:session)
const resolveCartKey = async (req: Request) => {
  const sessionId = req.headers['x-session-id'] as string;
  const user = (req as any).user;

  if (user) {
    const userKey = `usercart:${user.id}`;
    // Merge guest cart if exists
    if (sessionId) {
      const guestKey = `cart:${sessionId}`;
      const guestCartStr = await redis.get(guestKey);
      if (guestCartStr) {
        const guestCart = JSON.parse(guestCartStr);
        const userCartStr = await redis.get(userKey);
        let userCart = userCartStr ? JSON.parse(userCartStr) : { items: [], total: 0 };
        
        // Simple merge: append items
        userCart.items = [...userCart.items, ...guestCart.items];
        userCart.total = userCart.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        
        await redis.setex(userKey, 60 * 60 * 24 * 30, JSON.stringify(userCart)); // 30 days for users
        await redis.del(guestKey);
      }
    }
    return userKey;
  }
  
  return sessionId ? `cart:${sessionId}` : null;
};

router.use(authenticate); // This middleware is soft, doesn't block if no token

router.get('/', async (req: Request, res: Response) => {
  try {
    const cartKey = await resolveCartKey(req);
    if (!cartKey) return res.json({ items: [], total: 0 });
    
    const cart = await redis.get(cartKey);
    res.json(cart ? JSON.parse(cart) : { items: [], total: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const cartKey = await resolveCartKey(req);
    if (!cartKey) {
      // Create a session if none exists
      const newSid = uuidv4();
      res.setHeader('x-session-id', newSid);
      const { productId, quantity, customization, giftOption, price, name, imageUrl } = req.body;
      const newItem = { id: uuidv4(), productId, quantity, customization, giftOption, price, name, imageUrl };
      const cart = { items: [newItem], total: price * quantity };
      await redis.setex(`cart:${newSid}`, 60 * 60 * 24 * 7, JSON.stringify(cart));
      return res.json(cart);
    }

    const { productId, quantity, customization, giftOption, price, name, imageUrl, updateOnly, id } = req.body;
    
    let cart = { items: [] as any[], total: 0 };
    const existingStr = await redis.get(cartKey);
    if (existingStr) {
      cart = JSON.parse(existingStr);
    }

    if (updateOnly && id) {
      const itemIndex = cart.items.findIndex((i: any) => i.id === id);
      if (itemIndex > -1) {
        cart.total -= (cart.items[itemIndex].price * cart.items[itemIndex].quantity);
        cart.items[itemIndex].quantity = quantity;
        cart.total += (cart.items[itemIndex].price * quantity);
      }
    } else {
      const newItem = {
        id: uuidv4(),
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
    await redis.setex(cartKey, ttl, JSON.stringify(cart));
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/', async (req: Request, res: Response) => {
  try {
    const cartKey = await resolveCartKey(req);
    if (cartKey) await redis.del(cartKey);
    res.json({ items: [], total: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:itemId', async (req: Request, res: Response) => {
  try {
    const cartKey = await resolveCartKey(req);
    if (!cartKey) return res.json({ items: [], total: 0 });
    
    const existingStr = await redis.get(cartKey);
    if (!existingStr) return res.json({ items: [], total: 0 });
    
    let cart = JSON.parse(existingStr);
    const itemIndex = cart.items.findIndex((i: any) => i.id === req.params.itemId);
    
    if (itemIndex > -1) {
      cart.total -= (cart.items[itemIndex].price * cart.items[itemIndex].quantity);
      cart.items.splice(itemIndex, 1);
      const ttl = cartKey.startsWith('usercart:') ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
      await redis.setex(cartKey, ttl, JSON.stringify(cart));
    }
    
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
