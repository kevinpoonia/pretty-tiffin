import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { prisma } from '../prisma';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const clerkId = payload.sub;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      res.status(401).json({ error: 'User not found. Please sync account.' });
      return;
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
};
