import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';
import { sendEmail, orderConfirmationEmail, invoiceHtml } from './email';
import { generatePayFastSignature, verifyPayFastNotification } from '../payfast';
import { sendWhatsApp, getStatusMessage } from '../notifications';
import { syncOrderToXero } from '../services/xeroService';

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

// POST /api/orders/payfast-session — Generate PayFast request data
router.post('/payfast-session', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, items, shippingAddress, giftDetails } = req.body;
    
    // 1. Create a PENDING order in DB first
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
        totalAmount: Number(amount),
        paymentMethod: 'PAYFAST',
        shippingAddress: JSON.stringify(shippingAddress),
        giftOptionId,
        status: 'PENDING',
        items: {
          create: (items || []).map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.price),
            customizationDetails: JSON.stringify(item.customizationDetails || {})
          }))
        }
      }
    });

    // 2. Prepare PayFast data
    const payfastData: any = {
      merchant_id: String(process.env.PAYFAST_MERCHANT_ID || '').trim(),
      merchant_key: String(process.env.PAYFAST_MERCHANT_KEY || '').trim(),
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-confirmation?orderId=${newOrder.id}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout?error=cancelled`,
      notify_url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/orders/payfast-notify`,
      name_first: String(req.user?.name?.split(' ')[0] || 'Customer').trim(),
      name_last: String(req.user?.name?.split(' ')[1] || 'User').trim(),
      email_address: String(req.user?.email || '').trim(),
      m_payment_id: String(newOrder.id).trim(),
      amount: Number(amount).toFixed(2),
      item_name: `Order ${newOrder.id.slice(-8).toUpperCase()}`, // Removed '#' character
    };

    console.log('PayFast Session Data:', payfastData);

    const signature = generatePayFastSignature(payfastData, process.env.PAYFAST_PASSPHRASE);
    console.log('Generated Signature:', signature);
    
    // Sort fields alphabetically for the response to ensure form order matches signature order
    const sortedFields: any = {};
    Object.keys(payfastData).sort().forEach(key => {
      sortedFields[key] = payfastData[key];
    });
    sortedFields.signature = signature;

    res.json({
      url: process.env.PAYFAST_SANDBOX === 'true' ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process',
      fields: sortedFields
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error initializing PayFast session' });
  }
});

// POST /api/orders/payfast-notify — Handle PayFast ITN
router.post('/payfast-notify', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log('PayFast ITN Received:', data);

    if (!verifyPayFastNotification(data, process.env.PAYFAST_PASSPHRASE)) {
      console.error('PayFast Signature Verification Failed');
      return res.status(400).send('Invalid Signature');
    }

    if (data.payment_status === 'COMPLETE') {
      const orderId = data.m_payment_id;
      
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: { select: { name: true } } } }, user: { select: { email: true, name: true } } }
      });

      if (order && order.status === 'PENDING') {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'CONFIRMED',
            paymentRef: data.pf_payment_id
          },
          include: { items: { include: { product: { select: { name: true } } } } }
        });

        // Send emails
        const emailItems = updatedOrder.items.map((i: any) => ({ name: i.product.name, quantity: i.quantity, price: i.price }));
        const shippingAddress = JSON.parse(updatedOrder.shippingAddress);
        
        sendEmail(
          order.user.email,
          'Your Pretty Luxe Atelier Order is Confirmed! 🎉',
          orderConfirmationEmail(order.user.name, updatedOrder.id, Number(updatedOrder.totalAmount), emailItems)
        ).catch(console.error);

        const fullOrder = { ...updatedOrder, items: updatedOrder.items, shippingAddress, status: 'CONFIRMED' as const, paymentMethod: 'PAYFAST', trackingNumber: null };
        sendEmail(
          order.user.email,
          `Invoice #INV-${updatedOrder.id.slice(-8).toUpperCase()} — Pretty Luxe Atelier`,
          invoiceHtml(fullOrder as any, order.user as any)
        ).catch(console.error);

        // WhatsApp Notification
        if ((order.user as any).phone) {
          sendWhatsApp((order.user as any).phone, getStatusMessage('CONFIRMED', updatedOrder.id)).catch(console.error);
        }

        // Xero Sync
        syncOrderToXero(updatedOrder.id).catch(console.error);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast Notify Error:', error);
    res.status(500).send('Error');
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

    // Send order confirmation + invoice email (fire-and-forget)
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { email: true, name: true, phone: true } });
    if (user) {
      const emailItems = newOrder.items.map((i: { product: { name: string }; quantity: number; price: unknown }) => ({ name: i.product.name, quantity: i.quantity, price: i.price }));
      sendEmail(
        user.email,
        'Your Pretty Luxe Atelier Order is Confirmed! 🎉',
        orderConfirmationEmail(user.name, newOrder.id, totalAmount, emailItems)
      ).catch(console.error);
      // Send invoice email
      const fullOrder = { ...newOrder, items: newOrder.items, shippingAddress, status: 'CONFIRMED', paymentMethod, trackingNumber: null };
      sendEmail(
        user.email,
        `Invoice #INV-${newOrder.id.slice(-8).toUpperCase()} — Pretty Luxe Atelier`,
        invoiceHtml(fullOrder, user)
      ).catch(console.error);

      // WhatsApp Notification
      if (user.phone) {
        sendWhatsApp(user.phone, getStatusMessage('CONFIRMED', newOrder.id)).catch(console.error);
      }

      // Xero Sync
      syncOrderToXero(newOrder.id).catch(console.error);
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

// GET /api/orders/:id/invoice — get invoice HTML for an order
router.get('/:id/invoice', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
        user: { select: { name: true, email: true, phone: true } }
      }
    });
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    if (order.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden' }); return;
    }
    const html = invoiceHtml(order, order.user);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
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
      },
      include: { user: { select: { phone: true, email: true, name: true } } }
    });

    // Send notification on status change
    if (status && updated.user.phone) {
      sendWhatsApp(updated.user.phone, getStatusMessage(status, updated.id, trackingNumber)).catch(console.error);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
