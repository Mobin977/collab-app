import { Server, Socket } from 'socket.io';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 New client connected to event mesh cluster: ${socket.id}`);

    // --- 1. WORKSPACE PRESENCE ENGINES ---
    socket.on('user:online', (payload: { userId: string; organizationId: string }) => {
      socket.data.userId = payload.userId;
      socket.data.organizationId = payload.organizationId;
      
      console.log(`👤 User tracking identity marked online: ${payload.userId}`);
      io.emit('presence:updated', { userId: payload.userId, status: 'online' });
    });

    socket.on('project:join', (payload: { projectId: string }) => {
      socket.join(payload.projectId);
      console.log(`📁 Client ${socket.id} locked into room channel: ${payload.projectId}`);
    });

    // --- 2. REAL-TIME KANBAN MUTATION EVENTS ---
    socket.on('task:move', (payload: { projectId: string; taskId: string; sourceColumnId: string; destinationColumnId: string; newPosition: number }) => {
      console.log(`📦 Shifting card ${payload.taskId} inside project channel room ${payload.projectId}`);
      socket.to(payload.projectId).emit('task:moved', payload);
    });

    socket.on('task:add', (payload: { id: string; title: string; description?: string; columnId: string; position: number }) => {
      console.log(`➕ Injecting task card record onto channel room canvas: ${payload.title}`);
      socket.broadcast.emit('task:added', payload);
    });

    // --- 3. TEAM CHAT MESSAGING EVENTS & BROADCASTERS ---
    socket.on('chat:message:send', (payload: { projectId: string; text: string; authorName: string }) => {
      console.log(`💬 Broadcast chat message from ${payload.authorName} in project ${payload.projectId}`);
      
      const broadcastPayload = {
        messageId: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        text: payload.text,
        authorName: payload.authorName,
        timestamp: new Date()
      };

      io.to(payload.projectId).emit('chat:message:received', broadcastPayload);
    });

    // 🗑️ 1. Single Message Deletion Broadcaster
    socket.on('chat:message:delete', (payload: { projectId: string; messageId: string }) => {
      console.log(`🗑️ Deleting message ${payload.messageId} in project ${payload.projectId}`);
      io.to(payload.projectId).emit('chat:message:deleted', payload.messageId);
    });

    // 🧹 2. Full Room Clear Broadcaster
    socket.on('chat:message:clear_all', (projectId: string) => {
      console.log(`🧹 Clearing all chat messages in project ${projectId}`);
      io.to(projectId).emit('chat:message:cleared');
    });

    // --- 4. CLUSTER DISCONNECT CLEANUP RUNNERS ---
    socket.on('disconnect', () => {
      console.log(`❌ Client connection link dropped: ${socket.id}`);
      if (socket.data.userId) {
        io.emit('presence:updated', { userId: socket.data.userId, status: 'offline' });
      }
    });
  });
};
