"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Mock Brevo email send
router.post('/send', async (req, res) => {
    try {
        const { to, subject, templateId, params } = req.body;
        // In a real implementation we would call:
        // fetch('https://api.brevo.com/v3/smtp/email', { ... })
        console.log(`[Email] Sending to ${to} | Subject: ${subject} | Template: ${templateId}`);
        res.json({ success: true, message: 'Email sent successfully (mock)' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=email.js.map