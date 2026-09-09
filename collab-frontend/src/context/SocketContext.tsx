import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

// 🛠️ FIXED: Swapped generic domain out for your precise live cloud production backend endpoint link
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://collab-backend-api.onrender.com';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    console.log(`🌐 Connecting real-time Socket gateway channel node to: ${BACKEND_URL}`);

    // Open a resilient persistent WebSocket pipeline tracking cloud network paths safely
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket'],
      secure: true,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
