"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
require("dotenv/config");
const ioredis_1 = __importDefault(require("ioredis"));
exports.redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
exports.redis.on('error', (err) => {
    const fs = require('fs');
    fs.appendFileSync('error_log.txt', `${new Date().toISOString()} - Redis Error: ${err.message}\n`);
    console.error('Redis Client Error', err);
});
//# sourceMappingURL=redis.js.map