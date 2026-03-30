import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';

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
    
    if (isDefault) {
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
        isDefault: !!isDefault
      }
    });
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete address
router.delete('/addresses/:id', authenticate, async (req: any, res: Response) => {
  try {
    await prisma.address.delete({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
