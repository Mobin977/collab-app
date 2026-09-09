import React, { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import { AuthPage } from './components/AuthPage';
import { KanbanBoard } from './components/KanbanBoard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('collab_token'));
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('collab_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  const handleAuthSuccess = (newToken: string, authenticatedUser: any) => {
    localStorage.setItem('collab_token', newToken);
    localStorage.setItem('collab_user', JSON.stringify(authenticatedUser));
    setToken(newToken);
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <SocketProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', paddingBottom: '48px' }}>
        
        {/* 🛠️ ROBUST FIXED HEADER BLOCK: Complete architectural inline alignment reset */}
        <header style={{ 
          height: '64px', 
          borderBottom: '1px solid #27272a', 
          backgroundColor: '#18181b', 
          padding: '0 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          {/* Left Side: Branding and Emblem */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)' }}>
              <span style={{ margin: 'auto' }}>Ω</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.025em', textTransform: 'uppercase', color: '#e4e4e7' }}>CollabMesh Board</span>
          </div>
          
          {/* Right Side: Identity Details & Actions Panel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', gap: '2px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#f4f4f5' }}>{user?.fullName || 'Active Collaborator'}</span>
              <span style={{ fontSize: '10px', color: '#71717a', fontFamily: 'monospace' }}>{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{ 
                fontSize: '11px', 
                backgroundColor: '#09090b', 
                color: '#a1a1aa', 
                padding: '6px 12px', 
                borderRadius: '8px', 
                border: '1px solid #27272a', 
                cursor: 'pointer', 
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#27272a';
                e.currentTarget.style.color = '#f4f4f5';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#09090b';
                e.currentTarget.style.color = '#a1a1aa';
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Workspace Canvas Container */}
        <div style={{ flex: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', padding: '0 16px' }}>
          
          <div style={{ paddingTop: '24px' }}>
            <AnalyticsDashboard />
          </div>

          <div style={{ flex: 1, width: '100%' }}>
            <KanbanBoard projectId="default-project-space" user={user || { fullName: 'Collaborator' }} />
          </div>

        </div>
      </div>
    </SocketProvider>
  );
}
