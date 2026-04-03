import 'dotenv/config';
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  const fs = require('fs');
  fs.appendFileSync('error_log.txt', `${new Date().toISOString()} - Redis Error: ${err.message}\n`);
  console.error('Redis Client Error', err);
});
