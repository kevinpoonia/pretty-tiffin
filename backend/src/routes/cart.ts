import { Router, Request, Response } from 'express';
import { redis } from '../redis';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Middleware to ensure session exists
const sessionMiddleware = (req: Request, res: Response, next: Function) => {
  let sessionId = req.headers['x-session-id'] as string;
  if (!sessionId) {
    sessionId = uuidv4();
    res.setHeader('x-session-id', sessionId);
  }
  (req as any).sessionId = sessionId;
  next();
};

router.use(sessionMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionId;
    const cart = await redis.get(`cart:${sessionId}`);
    res.json(cart ? JSON.parse(cart) : { items: [], total: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionId;
    const { productId, quantity, customization, price, name, imageUrl, updateOnly, id } = req.body;
    
    let cart = { items: [] as any[], total: 0 };
    const existingStr = await redis.get(`cart:${sessionId}`);
    if (existingStr) {
      cart = JSON.parse(existingStr);
    }

    if (updateOnly && id) {
      // Handle Quantity Update
      const itemIndex = cart.items.findIndex((i: any) => i.id === id);
      if (itemIndex > -1) {
        cart.total -= (cart.items[itemIndex].price * cart.items[itemIndex].quantity);
        cart.items[itemIndex].quantity = quantity;
        cart.total += (cart.items[itemIndex].price * quantity);
      }
    } else {
      // Handle New Item
      const newItem = {
        id: uuidv4(),
        productId,
        quantity,
        customization,
        price,
        name,
        imageUrl
      };

      cart.items.push(newItem);
      cart.total += (price * quantity);
    }

    await redis.setex(`cart:${sessionId}`, 60 * 60 * 24 * 7, JSON.stringify(cart)); // 7 days
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:itemId', async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionId;
    const { itemId } = req.params;
    
    const existingStr = await redis.get(`cart:${sessionId}`);
    if (!existingStr) {
      res.json({ items: [], total: 0 });
      return;
    }
    
    let cart = JSON.parse(existingStr);
    const itemIndex = cart.items.findIndex((i: any) => i.id === itemId);
    
    if (itemIndex > -1) {
      cart.total -= (cart.items[itemIndex].price * cart.items[itemIndex].quantity);
      cart.items.splice(itemIndex, 1);
      await redis.setex(`cart:${sessionId}`, 60 * 60 * 24 * 7, JSON.stringify(cart));
    }
    
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
