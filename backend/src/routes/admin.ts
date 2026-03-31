import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalOrders, totalProducts, allOrders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({ select: { totalAmount: true } })
    ]);
    const revenue = allOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0);
    res.json({ totalUsers, totalOrders, totalProducts, revenue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Products ────────────────────────────────────────────────────────────────
router.get('/products', async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/products', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, compareAtPrice, slug, category, images, stock, customizationOptions } = req.body;
    const product = await prisma.product.create({
      data: { 
        name, 
        description, 
        price: Number(price), 
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null, 
        slug, 
        category, 
        images: images || [], 
        stock: Number(stock) || 0,
        customizationOptions: {
          create: (customizationOptions || []).map((opt: any) => ({
            type: opt.type,
            label: opt.label,
            values: opt.values || [],
            priceOffset: Number(opt.priceOffset) || 0
          }))
        }
      },
      include: { customizationOptions: true }
    });
    res.status(201).json(product);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Failed to create product' });
  }
});

router.put('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, compareAtPrice, slug, category, images, stock, isFeatured, customizationOptions } = req.body;
    
    // For simplicity, we delete and recreate customization options on update
    // A more robust approach would be to use upsert/deleteMany
    if (customizationOptions) {
      await (prisma as any).customizationOption.deleteMany({
        where: { productId: String(req.params.id) }
      });
    }

    const product = await prisma.product.update({
      where: { id: String(req.params.id) },
      data: { 
        name, 
        description, 
        price: Number(price), 
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null, 
        slug, 
        category, 
        images, 
        stock: Number(stock), 
        isFeatured,
        customizationOptions: customizationOptions ? {
          create: customizationOptions.map((opt: any) => ({
            type: opt.type,
            label: opt.label,
            values: opt.values || [],
            priceOffset: Number(opt.priceOffset) || 0
          }))
        } : undefined
      },
      include: { customizationOptions: true }
    });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Orders ──────────────────────────────────────────────────────────────────
router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/orders/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { status }
    });
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update order' });
  }
});

// ─── Customers ───────────────────────────────────────────────────────────────
router.get('/customers', async (req: AuthRequest, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, orders: { select: { id: true, totalAmount: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
