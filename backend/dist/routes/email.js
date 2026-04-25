"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.orderConfirmationEmail = orderConfirmationEmail;
exports.welcomeEmail = welcomeEmail;
exports.orderStatusUpdateEmail = orderStatusUpdateEmail;
const express_1 = require("express");
const router = (0, express_1.Router)();
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY || '';
const SENDER = {
    name: process.env.BREVO_SENDER_NAME || 'Pretty Luxe Atelier',
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@prettyluxeatelier.com'
};
async function sendEmail(to, subject, htmlContent) {
    if (!API_KEY) {
        console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
        return true;
    }
    try {
        const res = await fetch(BREVO_URL, {
            method: 'POST',
            headers: { 'api-key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: SENDER, to: [{ email: to }], subject, htmlContent })
        });
        return res.ok;
    }
    catch (err) {
        console.error('[Email] Send failed:', err);
        return false;
    }
}
function orderConfirmationEmail(name, orderId, total, items) {
    const itemRows = items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0ebe4;">${i.name || 'Item'}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0ebe4;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0ebe4;text-align:right;">₹${Number(i.price).toLocaleString('en-IN')}</td>
    </tr>`).join('');
    return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#faf8f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:#2a3d25;padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:-0.5px;">Pretty Luxe<span style="color:#83aa79;">Atelier</span></h1>
      <p style="color:#adc8a5;margin:8px 0 0;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;">Order Confirmed</p>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#2a3d25;font-size:22px;margin:0 0 8px;">Thank you, ${name}! 🎉</h2>
      <p style="color:#628f57;margin:0 0 24px;font-size:14px;">Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has been confirmed and is being prepared with care.</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="border-bottom:2px solid #e8f0e4;">
            <th style="text-align:left;padding:8px 0;font-size:12px;color:#628f57;text-transform:uppercase;letter-spacing:0.1em;">Item</th>
            <th style="text-align:center;padding:8px 0;font-size:12px;color:#628f57;text-transform:uppercase;letter-spacing:0.1em;">Qty</th>
            <th style="text-align:right;padding:8px 0;font-size:12px;color:#628f57;text-transform:uppercase;letter-spacing:0.1em;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="background:#f5f8f3;border-radius:12px;padding:16px 20px;margin-bottom:32px;display:flex;justify-content:space-between;">
        <span style="font-weight:700;color:#2a3d25;">Total Paid</span>
        <span style="font-weight:900;color:#2a3d25;font-size:18px;">₹${Number(total).toLocaleString('en-IN')}</span>
      </div>
      <a href="https://prettyluxeatelier.com/account/orders" style="display:inline-block;background:#628f57;color:#fff;padding:14px 32px;border-radius:999px;font-weight:700;text-decoration:none;font-size:14px;">Track Your Order →</a>
    </div>
    <div style="background:#f5f8f3;padding:24px 40px;text-align:center;border-top:1px solid #e8f0e4;">
      <p style="color:#83aa79;font-size:12px;margin:0;">Questions? <a href="mailto:support@prettyluxeatelier.com" style="color:#628f57;">support@prettyluxeatelier.com</a></p>
      <p style="color:#adc8a5;font-size:11px;margin:8px 0 0;">© ${new Date().getFullYear()} Pretty Luxe Atelier. Crafted with love in India.</p>
    </div>
  </div>
</body>
</html>`;
}
function welcomeEmail(name) {
    return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#faf8f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:#2a3d25;padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;">Pretty Luxe<span style="color:#83aa79;">Atelier</span></h1>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#2a3d25;">Welcome, ${name}! ✨</h2>
      <p style="color:#628f57;line-height:1.6;">Your account is ready. Explore our premium collection of personalized, laser-engraved stainless steel tiffins — perfect for gifting or everyday use.</p>
      <a href="https://prettyluxeatelier.com/shop" style="display:inline-block;background:#628f57;color:#fff;padding:14px 32px;border-radius:999px;font-weight:700;text-decoration:none;margin-top:16px;">Shop Now →</a>
    </div>
    <div style="background:#f5f8f3;padding:24px 40px;text-align:center;">
      <p style="color:#adc8a5;font-size:11px;margin:0;">© ${new Date().getFullYear()} Pretty Luxe Atelier. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}
const STATUS_LABEL = {
    PENDING: 'Order Placed', CONFIRMED: 'Order Confirmed', PROCESSING: 'Being Packed',
    SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled'
};
const STATUS_COLOR = {
    PENDING: '#d97706', CONFIRMED: '#2563eb', PROCESSING: '#7c3aed',
    SHIPPED: '#4f46e5', DELIVERED: '#16a34a', CANCELLED: '#dc2626'
};
function orderStatusUpdateEmail(name, orderId, status, trackingId, note) {
    const label = STATUS_LABEL[status] || status;
    const color = STATUS_COLOR[status] || '#4a7c59';
    const shortId = orderId.slice(-8).toUpperCase();
    return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#faf8f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:#2a3d25;padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:-0.5px;">Pretty Luxe<span style="color:#83aa79;">Atelier</span></h1>
      <p style="color:#adc8a5;margin:8px 0 0;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;">Order Update</p>
    </div>
    <div style="padding:40px;">
      <div style="display:inline-block;background:${color}20;border:1px solid ${color}40;border-radius:999px;padding:6px 20px;margin-bottom:20px;">
        <span style="color:${color};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">${label}</span>
      </div>
      <h2 style="color:#2a3d25;font-size:22px;margin:0 0 8px;">Hi ${name},</h2>
      <p style="color:#628f57;margin:0 0 24px;font-size:14px;">Your order <strong>#${shortId}</strong> status has been updated to <strong>${label}</strong>.</p>
      ${trackingId ? `<div style="background:#f5f8f3;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#628f57;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Tracking ID</p>
        <p style="margin:6px 0 0;font-size:20px;font-weight:900;color:#2a3d25;letter-spacing:0.05em;">${trackingId}</p>
      </div>` : ''}
      ${note ? `<p style="color:#628f57;font-size:14px;padding:12px 16px;background:#f5f8f3;border-radius:8px;margin-bottom:24px;">${note}</p>` : ''}
      <a href="https://prettyluxeatelier.com/account/orders" style="display:inline-block;background:#628f57;color:#fff;padding:14px 32px;border-radius:999px;font-weight:700;text-decoration:none;font-size:14px;">View Order Details →</a>
    </div>
    <div style="background:#f5f8f3;padding:24px 40px;text-align:center;border-top:1px solid #e8f0e4;">
      <p style="color:#83aa79;font-size:12px;margin:0;">Questions? <a href="mailto:support@prettyluxeatelier.com" style="color:#628f57;">support@prettyluxeatelier.com</a></p>
      <p style="color:#adc8a5;font-size:11px;margin:8px 0 0;">© ${new Date().getFullYear()} Pretty Luxe Atelier. Crafted with love in India.</p>
    </div>
  </div>
</body>
</html>`;
}
// POST /api/email/send
router.post('/send', async (req, res) => {
    try {
        const { to, subject, htmlContent } = req.body;
        if (!to || !subject || !htmlContent) {
            res.status(400).json({ error: 'to, subject, htmlContent are required' });
            return;
        }
        const success = await sendEmail(to, subject, htmlContent);
        res.json({ success });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=email.js.map