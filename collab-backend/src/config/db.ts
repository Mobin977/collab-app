import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

// Instantiate our Prisma client connection block
export const prisma = new PrismaClient();

// Connect seamlessly to your production environment secrets matrix
const REDIS_CONNECTION_STRING = process.env.REDIS_URL || 'redis://localhost:6379';

// Safe runtime instantiation strategy using 100% ESM compatible syntax rules
export const redis = new Redis(REDIS_CONNECTION_STRING);

console.log('🔗 Database connection wrappers initialized successfully.');
