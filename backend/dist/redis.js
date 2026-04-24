"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
require("dotenv/config");
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = process.env.REDIS_URL;
// In-memory fallback when Redis is unavailable
const memStore = new Map();
const memGet = (key) => {
    const entry = memStore.get(key);
    if (!entry)
        return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
        memStore.delete(key);
        return null;
    }
    return entry.value;
};
const memSet = (key, value, ttlSeconds) => {
    memStore.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null });
};
const memDel = (key) => memStore.delete(key);
let redisClient = null;
let redisReady = false;
if (REDIS_URL) {
    try {
        redisClient = new ioredis_1.default(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 3000 });
        redisClient.on('ready', () => { redisReady = true; });
        redisClient.on('error', () => { redisReady = false; });
        redisClient.connect().catch(() => { redisReady = false; });
    }
    catch {
        redisClient = null;
    }
}
exports.redis = {
    async get(key) {
        if (redisClient && redisReady) {
            try {
                return await redisClient.get(key);
            }
            catch { /* fall through */ }
        }
        return memGet(key);
    },
    async set(key, value) {
        if (redisClient && redisReady) {
            try {
                await redisClient.set(key, value);
                return;
            }
            catch { /* fall through */ }
        }
        memSet(key, value);
    },
    async setex(key, seconds, value) {
        if (redisClient && redisReady) {
            try {
                await redisClient.setex(key, seconds, value);
                return;
            }
            catch { /* fall through */ }
        }
        memSet(key, value, seconds);
    },
    async del(key) {
        if (redisClient && redisReady) {
            try {
                await redisClient.del(key);
                return;
            }
            catch { /* fall through */ }
        }
        memDel(key);
    },
    // Cache middleware compatibility
    async keys(pattern) {
        if (redisClient && redisReady) {
            try {
                return await redisClient.keys(pattern);
            }
            catch { /* fall through */ }
        }
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return [...memStore.keys()].filter(k => regex.test(k));
    }
};
//# sourceMappingURL=redis.js.map