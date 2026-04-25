"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const backend_1 = require("@clerk/backend");
const prisma_1 = require("../prisma");
const email_1 = require("./email");
const router = (0, express_1.Router)();
const clerk = (0, backend_1.createClerkClient)({ secretKey: process.env.CLERK_SECRET_KEY });
// POST /api/auth/sync — called after Clerk login/signup to create or fetch DB user
router.post('/sync', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const payload = await (0, backend_1.verifyToken)(token, { secretKey: process.env.CLERK_SECRET_KEY });
        const clerkId = payload.sub;
        const clerkUser = await clerk.users.getUser(clerkId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || '';
        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User';
        let user = await prisma_1.prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            // Also check by email (existing account migration)
            const byEmail = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (byEmail) {
                user = await prisma_1.prisma.user.update({ where: { email }, data: { clerkId } });
            }
            else {
                user = await prisma_1.prisma.user.create({ data: { clerkId, email, name, password: '' } });
                (0, email_1.sendEmail)(email, 'Welcome to Pretty Luxe Atelier! ✨', (0, email_1.welcomeEmail)(name)).catch(console.error);
            }
        }
        res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    }
    catch (error) {
        console.error('Auth sync error:', error);
        res.status(401).json({ error: 'Invalid token or sync failed' });
    }
});
// GET /api/auth/promote-emergency — promote a user to ADMIN (protected, use once)
router.get('/promote-emergency', async (req, res) => {
    const { email, secret } = req.query;
    if (secret !== process.env.JWT_SECRET) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const user = await prisma_1.prisma.user.update({
            where: { email: email },
            data: { role: 'ADMIN' }
        });
        res.json({ message: `Successfully promoted ${user.email} to ADMIN` });
    }
    catch {
        res.status(400).json({ error: 'User not found' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map