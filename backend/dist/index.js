"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
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
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/customizations', customization_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/coupons', coupon_1.default);
app.use('/api/gift', gift_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/blog', blog_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/email', email_1.default);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map