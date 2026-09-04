import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

// 1. Initialize Prisma client connection block
export const prisma = new PrismaClient();

// 2. Fetch connection strings safely from Render environment variables
const rawRedisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// 3. Robust parsing logic to intercept and sanitize invalid connection targets
let redisConnectionString = rawRedisUrl.trim();

// Ensure the connection string matches strict URL formatting rules required by modern ioredis packages
if (!redisConnectionString.startsWith('redis://') && !redisConnectionString.startsWith('rediss://')) {
  redisConnectionString = `redis://${redisConnectionString}`;
}

console.log('🔄 Attaching network cluster connection gateway node target...');

// 4. Instantiate our safe Redis cache server layer instance
export const redis = new Redis(redisConnectionString, {
  maxRetriesPerRequest: null,
  connectTimeout: 10000,
});

redis.on('connect', () => {
  console.log('✅ Real-time volatile memory cache cluster connected safely!');
});

redis.on('error', (err) => {
  console.error('⚠️ Secondary internal cache network connection dropped:', err.message);
});

console.log('🔗 Database connection wrappers initialized successfully.');
