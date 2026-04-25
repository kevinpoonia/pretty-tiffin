import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { razorpay } from '../razorpay';
import crypto from 'crypto';
import { sendEmail, orderConfirmationEmail } from './email';

const router = Router();

const getUserOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: { select: { name: true, images: true, slug: true } } } },
      giftOption: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

// POST /api/orders/create-intent — Create Razorpay order
router.post('/create-intent', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating Razorpay order' });
  }
});

// POST /api/orders/verify — Verify payment & create DB order
router.post('/verify', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      totalAmount,
      items,
      paymentMethod,
      shippingAddress,
      giftDetails
    } = req.body;

    if (paymentMethod === 'RAZORPAY') {
      const secret = process.env.RAZORPAY_KEY_SECRET || '';
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      if (shasum.digest('hex') !== razorpay_signature) {
        res.status(400).json({ error: 'Payment signature mismatch' });
        return;
      }
    }

    let giftOptionId: string | null = null;
    if (giftDetails && (giftDetails.occasion || giftDetails.message)) {
      const go = await prisma.giftOption.create({
        data: {
          occasion: giftDetails.occasion,
          message: giftDetails.message,
          scheduledFor: giftDetails.scheduledFor ? new Date(giftDetails.scheduledFor) : null,
          packaging: giftDetails.packaging
        }
      });
      giftOptionId = go.id;
    }

    const newOrder = await prisma.order.create({
      data: {
        userId: req.user!.id,
        totalAmount: Number(totalAmount),
        paymentMethod,
        paymentRef: paymentMethod === 'RAZORPAY' ? razorpay_payment_id : null,
        shippingAddress: JSON.stringify(shippingAddress),
        giftOptionId,
        status: 'CONFIRMED',
        items: {
          create: (items || []).map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.price),
            customizationDetails: JSON.stringify(item.customizationDetails || {})
          }))
        }
      },
      include: { items: { include: { product: { select: { name: true } } } }, giftOption: true }
    });

    // Send order confirmation email (fire-and-forget)
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { email: true, name: true } });
    if (user) {
      const emailItems = newOrder.items.map((i: { product: { name: string }; quantity: number; price: unknown }) => ({ name: i.product.name, quantity: i.quantity, price: i.price }));
      sendEmail(
        user.email,
        'Your Pretty Luxe Atelier Order is Confirmed! 🎉',
        orderConfirmationEmail(user.name, newOrder.id, totalAmount, emailItems)
      ).catch(console.error);
    }

    res.json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders — current user's orders
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await getUserOrders(req.user!.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/my-orders — alias
router.get('/my-orders', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await getUserOrders(req.user!.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/orders/:id/status — admin update order status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, trackingNumber } = req.body;
    const updated = await prisma.order.update({
      where: { id: req.params.id as string },
      data: {
        ...(status && { status }),
        ...(trackingNumber !== undefined && { trackingNumber })
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
