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
      
      const originalJson = res.json;
      res.json = function(body: any): any {
        redis.set(key, JSON.stringify(body), 'EX', duration).catch(e => {
          console.error('Redis cache set error:', e);
        });
        return originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export const clearCache = async (pattern: string) => {
  try {
    const keys = await redis.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};
