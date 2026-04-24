import { Router, Request, Response } from 'express';
import { verifyToken, createClerkClient } from '@clerk/backend';
import { prisma } from '../prisma';
import { sendEmail, welcomeEmail } from './email';

const router = Router();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY as string });

// POST /api/auth/sync — called after Clerk login/signup to create or fetch DB user
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const clerkId = payload.sub;

    const clerkUser = await clerk.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User';

    let user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) {
      // Also check by email (existing account migration)
      const byEmail = await prisma.user.findUnique({ where: { email } });
      if (byEmail) {
        user = await prisma.user.update({ where: { email }, data: { clerkId } });
      } else {
        user = await prisma.user.create({ data: { clerkId, email, name, password: '' } });
        sendEmail(email, 'Welcome to Pretty Tiffin! ✨', welcomeEmail(name)).catch(console.error);
      }
    }

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    console.error('Auth sync error:', error);
    res.status(401).json({ error: 'Invalid token or sync failed' });
  }
});

// GET /api/auth/promote-emergency — promote a user to ADMIN (protected, use once)
router.get('/promote-emergency', async (req: Request, res: Response) => {
  const { email, secret } = req.query;
  if (secret !== process.env.JWT_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const user = await prisma.user.update({
      where: { email: email as string },
      data: { role: 'ADMIN' }
    });
    res.json({ message: `Successfully promoted ${user.email} to ADMIN` });
  } catch {
    res.status(400).json({ error: 'User not found' });
  }
});

export default router;
