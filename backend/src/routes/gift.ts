import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// Create gift option
router.post('/', async (req: Request, res: Response) => {
  try {
    const { occasion, message, scheduledFor, packaging } = req.body;
    
    const giftOption = await prisma.giftOption.create({
      data: {
        occasion,
        message,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        packaging
      }
    });
    
    res.status(201).json(giftOption);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
