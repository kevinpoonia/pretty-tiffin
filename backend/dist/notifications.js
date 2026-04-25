"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusMessage = getStatusMessage;
exports.sendSMS = sendSMS;
exports.sendWhatsApp = sendWhatsApp;
const STATUS_MESSAGES = {
    PENDING: (id) => `Your Pretty Luxe Atelier order #${id.slice(-8).toUpperCase()} has been placed! We'll confirm it shortly.`,
    CONFIRMED: (id) => `Great news! Your Pretty Luxe Atelier order #${id.slice(-8).toUpperCase()} is confirmed and being prepared.`,
    PROCESSING: (id) => `Your Pretty Luxe Atelier order #${id.slice(-8).toUpperCase()} is being packed with love and ships soon!`,
    SHIPPED: (id, t) => `Your Pretty Luxe Atelier order #${id.slice(-8).toUpperCase()} has shipped!${t ? ` Tracking: ${t}` : ''} Delivery in 3-5 business days.`,
    DELIVERED: (id) => `Your Pretty Luxe Atelier order #${id.slice(-8).toUpperCase()} has been delivered! We hope you love it. 🎉`,
    CANCELLED: (id) => `Your Pretty Luxe Atelier order #${id.slice(-8).toUpperCase()} was cancelled. Questions? Email support@prettyluxeatelier.com`,
};
function getStatusMessage(status, orderId, trackingId) {
    return (STATUS_MESSAGES[status] || STATUS_MESSAGES['CONFIRMED'])(orderId, trackingId);
}
async function sendSMS(phone, message) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey || !phone)
        return;
    const clean = phone.replace(/\D/g, '').replace(/^91/, '');
    if (clean.length !== 10)
        return;
    try {
        await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: { authorization: apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'q', sender_id: 'PLTFIN', message, language: 'english', flash: '0', numbers: clean })
        });
    }
    catch (err) {
        console.error('[SMS] Failed:', err);
    }
}
async function sendWhatsApp(phone, message) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. +14155238886
    if (!sid || !token || !from || !phone)
        return;
    const clean = phone.replace(/\D/g, '');
    const to = clean.startsWith('91') ? `+${clean}` : `+91${clean}`;
    try {
        const creds = Buffer.from(`${sid}:${token}`).toString('base64');
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
            method: 'POST',
            headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ From: `whatsapp:${from}`, To: `whatsapp:${to}`, Body: message }).toString()
        });
    }
    catch (err) {
        console.error('[WhatsApp] Failed:', err);
    }
}
//# sourceMappingURL=notifications.js.map