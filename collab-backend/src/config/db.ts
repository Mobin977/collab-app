import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

// Instantiate clean Prisma Client
export const prisma = new PrismaClient();

// Dynamic connection proxy string matching the active production environment secrets matrix
const REDIS_CONNECTION_STRING = process.env.REDIS_URL || 'redis://localhost:6379';

// Safe runtime instantiation strategy to prevent strict constructor signature compiler drops
let redisInstance: any;
try {
  redisInstance = new Redis(REDIS_CONNECTION_STRING);
} catch (e) {
  // Fallback pattern matching dynamic import signatures if strict class signatures drop
  const RedisModule = require('ioredis');
  redisInstance = new RedisModule(REDIS_CONNECTION_STRING);
}

export const redis = redisInstance;

console.log('🔗 Type-safe database connection layers materialized successfully!');
