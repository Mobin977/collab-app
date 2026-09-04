import { PrismaClient } from '@prisma/client';
import RedisPkg from 'ioredis';

// Instantiate Prisma client
export const prisma = new PrismaClient();

// Instantiate Redis using default safe import resolution fallbacks
// @ts-ignore
const RedisConstructor = RedisPkg.default || RedisPkg;
export const redis = new RedisConstructor(process.env.REDIS_URL || 'redis://localhost:6379');

console.log('🔗 Database connection wrappers initialized successfully.');
