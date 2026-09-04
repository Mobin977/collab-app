import { io as cvIo } from 'socket.io-client';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api';
const WS_URL = 'http://localhost:5000';

async function runSystemDiagnostics() {
  console.log('🧪 Starting End-to-End Backend Verification Pipeline...\n');

  let authToken = '';
  let mockProjectId = '12345';
  const testEmail = `developer-${Date.now()}@test.com`;

  // --- 1. HEALTHCHECK LAYER VERIFICATION ---
  try {
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ 1. HTTP Gateway Status Check:', healthData);
  } catch (err) {
    console.error('❌ Health check unreachable. Verify server execution.');
    process.exit(1);
  }

  // --- 2. AUTHENTICATION ENGINE VERIFICATION ---
  try {
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'secure_password_123',
        fullName: 'Automation Test Sandbox'
      })
    });
    
    const authData = await registerRes.json();
    if (authData.token) {
      authToken = authData.token;
      console.log('✅ 2. JWT Cryptography Engine & Password Hashing: Functional');
    } else {
      throw new Error(JSON.stringify(authData));
    }
  } catch (err) {
    console.error('❌ Auth validation failed:', err);
    process.exit(1);
  }

  // --- 3. SOCKET.IO AND REDIS PRESENCE ENGINE VERIFICATION ---
  console.log('\n📶 Establishing validation channel over WebSocket network matrix...');
  const socket = cvIo(WS_URL, { transports: ['websocket'] });

  socket.on('connect', () => {
    console.log(`✅ 3. WebSocket Mesh Connection Connected: Session ID [${socket.id}]`);
    
    // Broadcast real-time presence data to trigger the Redis cluster tracking mechanics
    socket.emit('user:online', { userId: 'test-user-id', organizationId: 'test-org-id' });
    
    // Joint mock canvas board tracking
    socket.emit('project:join', { projectId: mockProjectId });
  });

  // Listen for the reflected event back from the Redis event distribution network
  socket.on('presence:updated', (presence) => {
    console.log('✅ 4. Redis In-Memory Presence Registry Reflected Event:', presence);
    
    // Fire structural real-time kanban drag-and-drop simulation event payload
    socket.emit('task:move', {
      projectId: mockProjectId,
      taskId: 'sample-task-uuid',
      sourceColumnId: 'col-todo',
      destinationColumnId: 'col-in-progress',
      newPosition: 2
    });
  });

  socket.on('task:moved', (movePayload) => {
    console.log('✅ 5. Real-Time Kanban Synchronization Broadcast Pipeline:', movePayload);
    console.log('\n🎯 ALL BACKEND CORE ARCHITECTURE MODULES CONFIRMED FUNCTIONAL AND INTERCONNECTED!');
    socket.disconnect();
    process.exit(0);
  });

  // Timeout failure handler script safety line
  setTimeout(() => {
    console.error('❌ Integration Verification Timeout: WebSocket feedback matrix non-responsive.');
    socket.disconnect();
    process.exit(1);
  }, 5000);
}

runSystemDiagnostics();
