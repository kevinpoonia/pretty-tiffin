import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { razorpay } from '../razorpay';
import crypto from 'crypto';

const router = Router();

// Create Payment Intent (Razorpay Order)
router.post('/create-intent', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    const options = {
      amount: parseInt(amount, 10) * 100, // amount in the smallest currency unit
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

// Verify Payment and Create DB Order
router.post('/verify', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      totalAmount,
      items, // array of { productId, quantity, price, customizationDetails }
      paymentMethod,
      shippingAddress,
      giftOptionId
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    
    if (paymentMethod === 'RAZORPAY') {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');

      if (digest !== razorpay_signature) {
        res.status(400).json({ error: 'Transaction not legit!' });
        return;
      }
    }

    const newOrder = await prisma.order.create({
      data: {
        userId: req.user!.id,
        totalAmount,
        paymentMethod,
        paymentRef: paymentMethod === 'RAZORPAY' ? razorpay_payment_id : null,
        shippingAddress: JSON.stringify(shippingAddress),
        giftOptionId: giftOptionId || null,
        status: 'CONFIRMED',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            customizationDetails: JSON.stringify(item.customizationDetails || {})
          }))
        }
      },
      include: { items: true }
    });

    res.json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get User Orders
router.get('/my-orders', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
