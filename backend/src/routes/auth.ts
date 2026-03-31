import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    // Hash & Create
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// EMERGENCY: Hidden route to promote an admin (for first-time setup on free tier hosting)
// SECURITY: This should be deleted or protected with a secret key after use.
router.get('/promote-emergency', async (req: Request, res: Response) => {
  const { email, secret } = req.query;
  const EMERGENCY_SECRET = process.env.JWT_SECRET || 'emergency_secret_123';
  
  /* 
  if (secret !== EMERGENCY_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  */

  try {
    const user = await prisma.user.update({
      where: { email: email as string },
      data: { role: 'ADMIN' }
    });
    res.json({ message: `Successfully promoted ${user.email} to ADMIN` });
  } catch (error) {
    res.status(400).json({ error: 'User not found or database error' });
  }
});

export default router;
