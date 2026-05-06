import { Router, Request, Response } from 'express';
import { XeroClient } from 'xero-node';
import { authenticate, requireAdmin } from '../middleware/auth';
import { prisma } from '../prisma';

const router = Router();

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID || '',
  clientSecret: process.env.XERO_CLIENT_SECRET || '',
  redirectUris: [process.env.XERO_REDIRECT_URI || ''],
  scopes: 'openid profile email accounting.transactions accounting.contacts'.split(' '),
});

// Admin triggers Xero login
router.get('/auth', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const consentUrl = await xero.buildConsentUrl();
    res.json({ url: consentUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to build consent URL' });
  }
});

// Callback from Xero
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const tokenSet = await xero.apiCallback(req.url);
    await xero.updateTenants();
    
    const tenantId = xero.tenants[0]?.tenantId;
    
    await prisma.xeroConfig.upsert({
      where: { id: 'singleton' },
      update: { 
        tokenSet: JSON.stringify(tokenSet),
        tenantId
      },
      create: { 
        id: 'singleton',
        tokenSet: JSON.stringify(tokenSet),
        tenantId
      }
    });

    res.send('Xero authentication successful! You can close this window.');
  } catch (error) {
    console.error('Xero Callback Error:', error);
    res.status(500).send('Authentication failed');
  }
});

export default router;
