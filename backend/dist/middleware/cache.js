"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.cacheMiddleware = void 0;
const redis_1 = require("../redis");
const cacheMiddleware = (duration) => {
    return async (req, res, next) => {
        const key = `cache:${req.originalUrl || req.url}`;
        try {
            const cached = await redis_1.redis.get(key);
            if (cached) {
                return res.json(JSON.parse(cached));
            }
            const originalJson = res.json.bind(res);
            res.json = function (body) {
                redis_1.redis.setex(key, duration, JSON.stringify(body)).catch(console.error);
                return originalJson(body);
            };
            next();
        }
        catch {
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
const clearCache = async (pattern) => {
    try {
        const keys = await redis_1.redis.keys(`cache:${pattern}`);
        for (const key of keys) {
            await redis_1.redis.del(key);
        }
    }
    catch (error) {
        console.error('Clear cache error:', error);
    }
};
exports.clearCache = clearCache;
//# sourceMappingURL=cache.js.map