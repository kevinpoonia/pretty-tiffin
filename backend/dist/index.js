"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const customization_1 = __importDefault(require("./routes/customization"));
const cart_1 = __importDefault(require("./routes/cart"));
const coupon_1 = __importDefault(require("./routes/coupon"));
const gift_1 = __importDefault(require("./routes/gift"));
const orders_1 = __importDefault(require("./routes/orders"));
const blog_1 = __importDefault(require("./routes/blog"));
const admin_1 = __importDefault(require("./routes/admin"));
const email_1 = __importDefault(require("./routes/email"));
const user_1 = __importDefault(require("./routes/user"));
const banners_1 = __importDefault(require("./routes/banners"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.set('trust proxy', 1);
const defaultAllowedOrigins = [
    'http://localhost:3000',
    'https://prettyluxeatelier.com',
    'https://www.prettyluxeatelier.com',
    'https://prettyluxeatelier.vercel.app'
];
const allowedOrigins = new Set([
    ...defaultAllowedOrigins,
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim())
].filter(Boolean));
const allowedOriginPatterns = [
    /^https?:\/\/localhost(?::\d+)?$/,
    /^https:\/\/(?:www\.)?prettyluxeatelier\.com$/,
    /^https:\/\/prettyluxeatelier(?:-[a-z0-9-]+)?\.vercel\.app$/
];
const isAllowedOrigin = (origin) => {
    if (!origin) {
        return true;
    }
    return allowedOrigins.has(origin) || allowedOriginPatterns.some((pattern) => pattern.test(origin));
};
const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
    optionsSuccessStatus: 204
};
app.use((0, cors_1.default)(corsOptions));
app.options(/.*/, (0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
// Read endpoints: generous limit for browsing (1000/15min)
const readLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS' || req.method !== 'GET'
});
// Write endpoints: strict limit to prevent abuse (100/15min)
const writeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS' || req.method === 'GET'
});
// Auth endpoints: very strict (20/15min per IP)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use(readLimiter);
app.use(writeLimiter);
app.use(express_1.default.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Cache-Control headers for public read endpoints
app.use('/api/products', (req, res, next) => {
    if (req.method === 'GET')
        res.set('Cache-Control', 'private, max-age=60');
    next();
});
app.use('/api/blog', (req, res, next) => {
    if (req.method === 'GET')
        res.set('Cache-Control', 'private, max-age=300');
    next();
});
app.use('/api/banners', (req, res, next) => {
    if (req.method === 'GET')
        res.set('Cache-Control', 'private, max-age=60');
    next();
});
app.use('/api/auth', authLimiter, auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/customizations', customization_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/coupons', coupon_1.default);
app.use('/api/gift', gift_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/blog', blog_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/email', email_1.default);
app.use('/api/users', user_1.default);
app.use('/api/banners', banners_1.default);
app.use((err, req, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }
    console.error(err);
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({ error: err.message });
        return;
    }
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map