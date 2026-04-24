import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import bcrypt from 'bcrypt';

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

// GET /api/users/wishlist
router.get('/wishlist', authenticate, async (req: any, res: Response) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { customizationOptions: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/wishlist
router.post('/wishlist', authenticate, async (req: any, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) { res.status(400).json({ error: 'productId required' }); return; }
    const item = await prisma.wishlist.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: {},
      create: { userId: req.user.id, productId }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/wishlist/:productId
router.delete('/wishlist/:productId', authenticate, async (req: any, res: Response) => {
  try {
    await prisma.wishlist.deleteMany({
      where: { userId: req.user.id, productId: req.params.productId }
    });
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
