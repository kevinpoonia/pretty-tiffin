import express, { NextFunction, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import customizationRoutes from './routes/customization';
import cartRoutes from './routes/cart';
import couponRoutes from './routes/coupon';
import giftRoutes from './routes/gift';
import orderRoutes from './routes/orders';
import blogRoutes from './routes/blog';
import adminRoutes from './routes/admin';
import emailRoutes from './routes/email';
import userRoutes from './routes/user';
import bannerRoutes from './routes/banners';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const port = process.env.PORT || 4000;

app.set('trust proxy', 1);

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'https://prettyluxeatelier.com',
  'https://www.prettyluxeatelier.com',
  'https://prettyluxeatelier.vercel.app'
];

const allowedOrigins = new Set(
  [
    ...defaultAllowedOrigins,
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim())
  ].filter(Boolean)
);

const allowedOriginPatterns = [
  /^https?:\/\/localhost(?::\d+)?$/,
  /^https:\/\/(?:www\.)?prettyluxeatelier\.com$/,
  /^https:\/\/prettyluxeatelier(?:-[a-z0-9-]+)?\.vercel\.app$/
];

const isAllowedOrigin = (origin?: string) => {
  if (!origin) {
    return true;
  }

  return allowedOrigins.has(origin) || allowedOriginPatterns.some((pattern) => pattern.test(origin));
};

const corsOptions: CorsOptions = {
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

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(helmet());
app.use(compression());

// Read endpoints: generous limit for browsing (1000/15min)
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || req.method !== 'GET'
});

// Write endpoints: strict limit to prevent abuse (100/15min)
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || req.method === 'GET'
});

// Auth endpoints: very strict (20/15min per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use(readLimiter);
app.use(writeLimiter);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cache-Control headers for public read endpoints
app.use('/api/products', (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  next();
});
app.use('/api/blog', (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  next();
});
app.use('/api/banners', (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') res.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=3600');
  next();
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customizations', customizationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/gift', giftRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/users', userRoutes);
app.use('/api/banners', bannerRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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
