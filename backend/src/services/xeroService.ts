import { XeroClient, Invoice, LineItem, Contact } from 'xero-node';
import { prisma } from '../prisma';

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID || '',
  clientSecret: process.env.XERO_CLIENT_SECRET || '',
  redirectUris: [process.env.XERO_REDIRECT_URI || ''],
  scopes: 'openid profile email accounting.transactions accounting.contacts'.split(' '),
});

export async function syncOrderToXero(orderId: string) {
  try {
    const config = await prisma.xeroConfig.findUnique({ where: { id: 'singleton' } });
    if (!config || !config.tokenSet) {
      console.log('[Xero] No config found, skipping sync');
      return;
    }

    const tokenSet = JSON.parse(config.tokenSet);
    xero.setTokenSet(tokenSet);

    if (tokenSet.expired()) {
      const refreshedTokenSet = await xero.refreshWithLocalStorage();
      await prisma.xeroConfig.update({
        where: { id: 'singleton' },
        data: { tokenSet: JSON.stringify(refreshedTokenSet) }
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } },
        user: true
      }
    });

    if (!order) return;

    const tenantId = config.tenantId!;

    // 1. Create or Find Contact
    const contact: Contact = {
      name: order.user.name,
      emailAddress: order.user.email,
    };

    const contactsResponse = await xero.accountingApi.getContacts(tenantId, undefined, `EmailAddress=="${order.user.email}"`);
    let xeroContactId = contactsResponse.body.contacts?.[0]?.contactID;

    if (!xeroContactId) {
      const createContactResponse = await xero.accountingApi.createContacts(tenantId, { contacts: [contact] });
      xeroContactId = createContactResponse.body.contacts?.[0]?.contactID;
    }

    // 2. Create Invoice
    const lineItems: LineItem[] = order.items.map(item => ({
      description: item.product.name,
      quantity: item.quantity,
      unitAmount: Number(item.price),
      accountCode: '200', // Default Sales Account Code for Xero
    }));

    const invoice: Invoice = {
      type: Invoice.TypeEnum.ACCREC,
      contact: { contactID: xeroContactId },
      lineItems,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      reference: `Order #${order.id.slice(-8).toUpperCase()}`,
      status: Invoice.StatusEnum.AUTHORISED,
    };

    await xero.accountingApi.createInvoices(tenantId, { invoices: [invoice] });
    console.log(`[Xero] Invoice created for order ${orderId}`);

  } catch (error) {
    console.error('[Xero] Sync Error:', error);
  }
}
