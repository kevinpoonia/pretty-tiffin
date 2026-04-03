"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Validate
        if (!email || !password || !name) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // Check if exists
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }
        // Hash & Create
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// EMERGENCY: Hidden route to promote an admin (for first-time setup on free tier hosting)
// SECURITY: This should be deleted or protected with a secret key after use.
router.get('/promote-emergency', async (req, res) => {
    const { email, secret } = req.query;
    const EMERGENCY_SECRET = process.env.JWT_SECRET || 'emergency_secret_123';
    /*
    if (secret !== EMERGENCY_SECRET) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    */
    try {
        const user = await prisma_1.prisma.user.update({
            where: { email: email },
            data: { role: 'ADMIN' }
        });
        res.json({ message: `Successfully promoted ${user.email} to ADMIN` });
    }
    catch (error) {
        res.status(400).json({ error: 'User not found or database error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map