import { Router, Request, Response } from 'express';
import { XeroClient } from 'xero-node';
import { authenticate, requireAdmin } from '../middleware/auth';

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
    const tokenSet = await xero.readTokenSet(); // This needs to be stored securely
    // In a real app, store tokenSet in DB linked to admin or global config
    console.log('Xero token set received:', tokenSet);
    
    await xero.updateTenants();
    const tenants = xero.tenants;
    console.log('Xero tenants:', tenants);

    res.send('Xero authentication successful! You can close this window.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Authentication failed');
  }
});

export default router;
