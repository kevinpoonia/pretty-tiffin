import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import bcrypt from 'bcrypt';
import { redis } from '../redis';

const router = Router();

// Get user profile & addresses
router.get('/profile', authenticate, async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { addresses: true }
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get addresses
router.get('/addresses', authenticate, async (req: any, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' }
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add address
router.post('/addresses', authenticate, async (req: any, res: Response) => {
  try {
    const { street, city, state, pincode, country, isDefault } = req.body;
    if (!street || !city || !state || !pincode) {
      res.status(400).json({ error: 'Street, city, state, and pincode are required' });
      return;
    }

    const existingAddresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      select: { id: true }
    });

    const shouldBeDefault = !!isDefault || existingAddresses.length === 0;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
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
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update address
router.put('/addresses/:id', authenticate, async (req: any, res: Response) => {
  try {
    const { street, city, state, pincode, country, isDefault } = req.body;

    if (!street || !city || !state || !pincode) {
      res.status(400).json({ error: 'Street, city, state, and pincode are required' });
      return;
    }

    const existingAddress = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existingAddress) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
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
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete address
router.delete('/addresses/:id', authenticate, async (req: any, res: Response) => {
  try {
    const address = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!address) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    await prisma.address.delete({
      where: { id: address.id }
    });

    if (address.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'asc' }
      });

      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true }
        });
      }
    }

    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/profile', authenticate, async (req: any, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: req.user.id }
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        email,
        phone: phone || null
      }
    });

    const { password: _, ...userData } = updatedUser;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Wishlist ─────────────────────────────────────────────────────────────────

// GET /api/user/wishlist
router.get('/wishlist', authenticate, async (req: any, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    // If authenticated, merge guest wishlist first
    if (req.user && sessionId) {
      const guestKey = `wishlist:${sessionId}`;
      const guestWishlistStr = await redis.get(guestKey);
      if (guestWishlistStr) {
        const guestProductIds: string[] = JSON.parse(guestWishlistStr);
        for (const pid of guestProductIds) {
          await prisma.wishlist.upsert({
            where: { userId_productId: { userId: req.user.id, productId: pid } },
            update: {},
            create: { userId: req.user.id, productId: pid }
          });
        }
        await redis.del(guestKey);
      }
    }

    if (req.user) {
      const wishlist = await prisma.wishlist.findMany({
        where: { userId: req.user.id },
        include: { product: { include: { customizationOptions: true, currencyPrices: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(wishlist.map(w => w.product));
    }

    // Guest wishlist from Redis
    if (sessionId) {
      const guestWishlistStr = await redis.get(`wishlist:${sessionId}`);
      if (guestWishlistStr) {
        const productIds: string[] = JSON.parse(guestWishlistStr);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          include: { customizationOptions: true, currencyPrices: true }
        });
        return res.json(products);
      }
    }

    res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/user/wishlist/:productId
router.post('/wishlist/:productId', authenticate, async (req: any, res: Response) => {
  try {
    const { productId } = req.params;
    const sessionId = req.headers['x-session-id'] as string;

    if (req.user) {
      await prisma.wishlist.upsert({
        where: { userId_productId: { userId: req.user.id, productId } },
        update: {},
        create: { userId: req.user.id, productId }
      });
      return res.json({ success: true });
    }

    if (sessionId) {
      const key = `wishlist:${sessionId}`;
      const existing = await redis.get(key);
      let list: string[] = existing ? JSON.parse(existing) : [];
      if (!list.includes(productId)) {
        list.push(productId);
        await redis.setex(key, 60 * 60 * 24 * 7, JSON.stringify(list));
      }
      return res.json({ success: true });
    }

    res.status(400).json({ error: 'Session ID or Auth required' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/user/wishlist/:productId
router.delete('/wishlist/:productId', authenticate, async (req: any, res: Response) => {
  try {
    const { productId } = req.params;
    const sessionId = req.headers['x-session-id'] as string;

    if (req.user) {
      await prisma.wishlist.deleteMany({
        where: { userId: req.user.id, productId }
      });
      return res.json({ success: true });
    }

    if (sessionId) {
      const key = `wishlist:${sessionId}`;
      const existing = await redis.get(key);
      if (existing) {
        let list: string[] = JSON.parse(existing);
        list = list.filter(id => id !== productId);
        await redis.setex(key, 60 * 60 * 24 * 7, JSON.stringify(list));
      }
      return res.json({ success: true });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Password ─────────────────────────────────────────────────────────────────

// Update password
router.put('/password', authenticate, async (req: any, res: Response) => {
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

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
