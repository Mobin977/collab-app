import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { initializeAnalyticsViews } from './config/analytics.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Dynamic CORS verification function for multiple environments
const whitelistChecker = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) return callback(null, true);
  
  // Accept any of your deployment subdomains ending in .vercel.app or local testing environments
  const isAllowed = /vercel\.app$/.test(origin) || origin.includes('localhost:');
  
  if (isAllowed) {
    callback(null, true);
  } else {
    callback(new Error('Blocked by security firewall (CORS Policy)'));
  }
};

// Mount dynamic validation to the Socket.io WebSocket network layer
const io = new Server(httpServer, {
  cors: { 
    origin: whitelistChecker, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
});

const PORT = process.env.PORT || 5000;

// Mount dynamic validation to the Express HTTP REST layer
app.use(cors({
  origin: whitelistChecker,
  credentials: true
}));

app.use(express.json());

// Mount our routing layout networks
app.use('/api/auth', authRoutes);
app.use('/api/workspace', boardRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected', websocket: 'active', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: 'Service down' });
  }
});

setupSocketHandlers(io);

// Bootstrap our custom SQL views cleanly into PostgreSQL container spaces
httpServer.listen(PORT, async () => {
  console.log(`🚀 Real-time architecture cluster operating flawlessly on port ${PORT}`);
  await initializeAnalyticsViews();
});
