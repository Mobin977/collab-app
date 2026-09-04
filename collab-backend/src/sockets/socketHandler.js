import { redis } from '../config/db.js';
export const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 New client socket connection established: ${socket.id}`);
        // --- 1. USER ONLINE / OFFLINE STATUS PRESENCE ENGINE ---
        socket.on('user:online', async (data) => {
            const { userId, organizationId } = data;
            socket.data.userId = userId;
            socket.data.organizationId = organizationId;
            // Store active user session inside Redis set for the organization
            const presenceKey = `org:${organizationId}:online_users`;
            await redis.sadd(presenceKey, userId);
            // Broadcast updated online presence to the organization room channel
            io.to(`org:${organizationId}`).emit('presence:updated', {
                userId,
                status: 'online',
            });
            // Join the organization scope channel
            socket.join(`org:${organizationId}`);
        });
        // --- 2. PROJECT ROOMS MESH CHANNELS ---
        socket.on('project:join', (data) => {
            socket.join(`project:${data.projectId}`);
            console.log(`📁 Socket ${socket.id} joined Project Channel: project:${data.projectId}`);
        });
        socket.on('project:leave', (data) => {
            socket.leave(`project:${data.projectId}`);
            console.log(`📁 Socket ${socket.id} left Project Channel: project:${data.projectId}`);
        });
        // --- 3. REAL-TIME KANBAN DRAG-AND-DROP SYNCING ---
        socket.on('task:move', (payload) => {
            // Broadcast structural changes to everyone in the project workspace room except the sender
            socket.to(`project:${payload.projectId}`).emit('task:moved', payload);
        });
        // --- 4. REAL-TIME TEAM CHAT BROADCASTING ---
        socket.on('chat:message:send', (payload) => {
            // Dispatch the new text frame message across the project channel payload
            io.to(`project:${payload.projectId}`).emit('chat:message:received', {
                ...payload,
                createdAt: new Date(),
            });
        });
        // --- 5. DISCONNECTION PRESENCE CLEANUP ---
        socket.on('disconnect', async () => {
            const { userId, organizationId } = socket.data;
            if (userId && organizationId) {
                const presenceKey = `org:${organizationId}:online_users`;
                // Evict the session identifier token from the Redis tracker list
                await redis.srem(presenceKey, userId);
                io.to(`org:${organizationId}`).emit('presence:updated', {
                    userId,
                    status: 'offline',
                });
                console.log(`🔌 Client disconnected. Presence removed for User: ${userId}`);
            }
        });
    });
};
