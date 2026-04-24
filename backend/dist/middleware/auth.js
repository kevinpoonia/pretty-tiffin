"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticate = void 0;
const backend_1 = require("@clerk/backend");
const prisma_1 = require("../prisma");
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const payload = await (0, backend_1.verifyToken)(token, { secretKey: process.env.CLERK_SECRET_KEY });
        const clerkId = payload.sub;
        const user = await prisma_1.prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            res.status(401).json({ error: 'User not found. Please sync account.' });
            return;
        }
        req.user = { id: user.id, role: user.role };
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map