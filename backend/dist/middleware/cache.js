"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.cacheMiddleware = void 0;
const redis_1 = require("../redis");
const cacheMiddleware = (duration) => {
    return async (req, res, next) => {
        const key = `cache:${req.originalUrl || req.url}`;
        try {
            const cachedResponse = await redis_1.redis.get(key);
            if (cachedResponse) {
                return res.json(JSON.parse(cachedResponse));
            }
            const originalJson = res.json;
            res.json = function (body) {
                redis_1.redis.set(key, JSON.stringify(body), 'EX', duration).catch(e => {
                    console.error('Redis cache set error:', e);
                });
                return originalJson.call(this, body);
            };
            next();
        }
        catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
const clearCache = async (pattern) => {
    try {
        const keys = await redis_1.redis.keys(`cache:${pattern}`);
        if (keys.length > 0) {
            await redis_1.redis.del(...keys);
        }
    }
    catch (error) {
        console.error('Clear cache error:', error);
    }
};
exports.clearCache = clearCache;
//# sourceMappingURL=cache.js.map