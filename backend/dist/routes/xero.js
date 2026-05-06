"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const xero_node_1 = require("xero-node");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
const xero = new xero_node_1.XeroClient({
    clientId: process.env.XERO_CLIENT_ID || '',
    clientSecret: process.env.XERO_CLIENT_SECRET || '',
    redirectUris: [process.env.XERO_REDIRECT_URI || ''],
    scopes: 'openid profile email accounting.transactions accounting.contacts'.split(' '),
});
// Admin triggers Xero login
router.get('/auth', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const consentUrl = await xero.buildConsentUrl();
        res.json({ url: consentUrl });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to build consent URL' });
    }
});
// Callback from Xero
router.get('/callback', async (req, res) => {
    try {
        const tokenSet = await xero.apiCallback(req.url);
        await xero.updateTenants();
        const tenantId = xero.tenants[0]?.tenantId;
        await prisma_1.prisma.xeroConfig.upsert({
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
    }
    catch (error) {
        console.error('Xero Callback Error:', error);
        res.status(500).send('Authentication failed');
    }
});
exports.default = router;
//# sourceMappingURL=xero.js.map