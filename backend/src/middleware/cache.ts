import { Request, Response, NextFunction } from 'express';
import { redis } from '../redis';

export const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      const cachedResponse = await redis.get(key);
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        redis.set(key, JSON.stringify(body), 'EX', duration);
        return originalJson(body);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export const clearCache = async (pattern: string) => {
  const keys = await redis.keys(`cache:${pattern}`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
