import 'dotenv/config';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

// In-memory fallback when Redis is unavailable
const memStore = new Map<string, { value: string; expiresAt: number | null }>();

const memGet = (key: string): string | null => {
  const entry = memStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) { memStore.delete(key); return null; }
  return entry.value;
};
const memSet = (key: string, value: string, ttlSeconds?: number) => {
  memStore.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null });
};
const memDel = (key: string) => memStore.delete(key);

let redisClient: Redis | null = null;
let redisReady = false;

if (REDIS_URL) {
  try {
    redisClient = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 3000 });
    redisClient.on('ready', () => { redisReady = true; });
    redisClient.on('error', () => { redisReady = false; });
    redisClient.connect().catch(() => { redisReady = false; });
  } catch {
    redisClient = null;
  }
}

export const redis = {
  async get(key: string): Promise<string | null> {
    if (redisClient && redisReady) {
      try { return await redisClient.get(key); } catch { /* fall through */ }
    }
    return memGet(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (redisClient && redisReady) {
      try { await redisClient.set(key, value); return; } catch { /* fall through */ }
    }
    memSet(key, value);
  },
  async setex(key: string, seconds: number, value: string): Promise<void> {
    if (redisClient && redisReady) {
      try { await redisClient.setex(key, seconds, value); return; } catch { /* fall through */ }
    }
    memSet(key, value, seconds);
  },
  async del(key: string): Promise<void> {
    if (redisClient && redisReady) {
      try { await redisClient.del(key); return; } catch { /* fall through */ }
    }
    memDel(key);
  },
  // Cache middleware compatibility
  async keys(pattern: string): Promise<string[]> {
    if (redisClient && redisReady) {
      try { return await redisClient.keys(pattern); } catch { /* fall through */ }
    }
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return [...memStore.keys()].filter(k => regex.test(k));
  }
};
