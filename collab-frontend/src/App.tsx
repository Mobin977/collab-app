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
      {/* 🚀 FIXED: Changed from a locked h-screen box to min-h-screen to allow natural downward vertical scrolling */}
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col pb-12">
        
        {/* Workspace Top Global Navigation Bar - Sticky position so it stays fixed while you scroll down */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 px-6 flex items-center justify-between backdrop-blur-md shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold tracking-wider text-sm shadow-indigo-500/20 shadow-md">Ω</div>
            <span className="font-bold tracking-tight text-sm uppercase text-zinc-200">CollabMesh Board</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-zinc-200">{user?.fullName || 'Active Collaborator'}</span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-tight">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all font-medium cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Unified Document Layout Structure Area */}
        <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col px-4">
          
          {/* Mount the Real-Time SQL Metrics Dashboard Grid */}
          <div className="pt-6 shrink-0">
            <AnalyticsDashboard />
          </div>

          {/* Mount the Interactive Team Task Columns & Chat Feed Container */}
          <div className="flex-1 w-full">
            <KanbanBoard projectId="default-project-space" user={user || { fullName: 'Collaborator' }} />
          </div>

        </div>
      </div>
    </SocketProvider>
  );
}
