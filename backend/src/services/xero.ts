import { XeroClient, Invoice, LineItem, RequestEmpty } from 'xero-node';
import { prisma } from '../prisma';

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID || '',
  clientSecret: process.env.XERO_CLIENT_SECRET || '',
  redirectUris: [process.env.XERO_REDIRECT_URI || ''],
  scopes: 'openid profile email accounting.transactions accounting.contacts'.split(' '),
});

export async function syncOrderToXero(orderId: string) {
  if (!process.env.XERO_CLIENT_ID || !process.env.XERO_CLIENT_SECRET) {
    console.warn('Xero credentials not configured. Skipping sync.');
    return;
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        user: true,
        items: { include: { product: true } }
      }
    });

    if (!order) throw new Error('Order not found');

    // 1. Create/Get Contact in Xero
    // (Simplified: always try to create or find by email)
    
    // 2. Map items to LineItems
    const lineItems: LineItem[] = order.items.map(item => ({
      description: `${item.product.name} ${item.customizationDetails ? `(${item.customizationDetails})` : ''}`,
      quantity: item.quantity,
      unitAmount: Number(item.price),
      accountCode: '200', // Default sales account code, should be configurable
    }));

    const invoice: Invoice = {
      type: Invoice.TypeEnum.ACCREC,
      contact: {
        name: order.user.name,
        emailAddress: order.user.email,
      },
      lineItems: lineItems,
      date: order.createdAt.toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reference: `Order #${order.id.slice(0, 8)}`,
      status: Invoice.StatusEnum.AUTHORISED,
    };

    // Note: This requires a valid token which should be managed via OAuth flow
    // For now, this is a skeleton. Real implementation needs token management.
    console.log('Would sync invoice to Xero:', invoice);
    
    // const response = await xero.accountingApi.createInvoices(process.env.XERO_TENANT_ID!, { invoices: [invoice] });
    // return response.body.invoices?.[0];

  } catch (error) {
    console.error('Xero Sync Error:', error);
  }
}
