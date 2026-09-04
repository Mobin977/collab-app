import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Prisma Client for PostgreSQL queries
export const prisma = new PrismaClient();

// Initialize the Redis Client for high-speed tracking and cache storage
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('📶 Core Redis Matrix Engine connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});
