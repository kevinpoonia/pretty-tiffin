import { Request, Response, NextFunction } from 'express';
import { redis } from '../redis';

export const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl || req.url}`;
    try {
      const cached = await redis.get(key);
      if (cached) { return res.json(JSON.parse(cached)); }

      const originalJson = res.json.bind(res);
      res.json = function (body: any): Response {
        redis.setex(key, duration, JSON.stringify(body)).catch(console.error);
        return originalJson(body);
      };
      next();
    } catch {
      next();
    }
  };
};

export const clearCache = async (pattern: string) => {
  try {
    const keys = await redis.keys(`cache:${pattern}`);
    for (const key of keys) { await redis.del(key); }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};
