import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { cacheMiddleware, clearCache } from '../middleware/cache';

const router = Router();

// Get all published posts
router.get('/', cacheMiddleware(3600), async (req: Request, res: Response) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post
router.get('/:slug', cacheMiddleware(3600), async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await prisma.blogPost.findUnique({
      where: { slug: slug as string }
    });
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create post
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, content, summary, coverImage, isPublished, seoTitle, seoDesc } = req.body;
    const post = await prisma.blogPost.create({
      data: {
        title, slug, content, summary, coverImage, isPublished, seoTitle, seoDesc
      }
    });
    await clearCache('blog*');
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
