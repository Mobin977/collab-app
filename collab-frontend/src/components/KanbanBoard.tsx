import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Search, Plus, X, Send } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
}

interface Column {
  id: string;
  name: string;
  tasks: Task[];
}

interface ChatMessage {
  messageId: string;
  text: string;
  authorName: string;
}

// 🛠️ FIXED: Swapped generic placeholder out for your exact live production backend container link
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://collab-backend-api.onrender.com';

export const KanbanBoard: React.FC<{ projectId: string; user: any }> = ({ projectId, user }) => {
  const socket = useSocket();
  const [columns, setColumns] = useState<Column[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeFormColId, setActiveFormColId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // --- 1. BOOTSTRAP WORKSPACE DATA VIA REAL HTTP REST API ---
  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/workspace/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('collab_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setColumns(data.columns || data);
        } else {
          throw new Error('Database response not OK');
        }
      } catch (error) {
        console.warn('⚠️ Falling back to clean placeholder structure targets...');
        setColumns([
          {
            id: 'col-todo',
            name: 'To Do Inbox',
            tasks: [
              { id: 'task-1', title: 'Architect System Blueprint', description: 'Map out full Prisma relational database entities', columnId: 'col-todo', position: 1 },
              { id: 'task-2', title: 'Implement Socket Mesh Network', description: 'Configure Redis pub/sub real-time pipelines', columnId: 'col-todo', position: 2 }
            ]
          },
          { id: 'col-progress', name: 'In Progress Sprint', tasks: [] },
          { id: 'col-done', name: 'Completed Tasks', tasks: [] }
        ]);
      }
    };

    fetchBoardData();
  }, [projectId]);

  // --- 2. WEBSOCKET REAL-TIME COMMUNICATIONS EVENT HOOKS ---
  useEffect(() => {
    if (!socket) return;

    socket.emit('user:online', { userId: user.fullName, organizationId: 'default-org' });
    socket.emit('project:join', { projectId });

    socket.on('presence:updated', (data: { userId: string; status: string }) => {
      setOnlineUsers(prev => {
        if (data.status === 'online' && !prev.includes(data.userId)) return [...prev, data.userId];
        if (data.status === 'offline') return prev.filter(id => id !== data.userId);
        return prev;
      });
    });

    socket.on('task:moved', (payload: any) => {
      setColumns(prevColumns => {
        const updated = prevColumns.map(col => ({ ...col, tasks: [...col.tasks] }));
        let foundTask: Task | null = null;

        updated.forEach(col => {
          const index = col.tasks.findIndex(t => t.id === payload.taskId);
          if (index !== -1) {
            foundTask = col.tasks.splice(index, 1);
          }
        });

        if (foundTask) {
          (foundTask as Task).columnId = payload.destinationColumnId;
          const destCol = updated.find(c => c.id === payload.destinationColumnId);
          if (destCol) {
            destCol.tasks.splice(payload.newPosition, 0, foundTask);
          }
        }
        return updated;
      });
    });

    socket.on('task:added', (payload: Task) => {
      setColumns(prevColumns => 
        prevColumns.map(col => {
          if (col.id === payload.columnId) {
            return { ...col, tasks: [...col.tasks, payload] };
          }
          return col;
        })
      );
    });

    socket.on('chat:message:received', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('presence:updated');
      socket.off('task:moved');
      socket.off('task:added');
      socket.off('chat:message:received');
    };
  }, [socket, projectId, user]);
    // --- 3. HTML5 DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    setColumns(prevColumns => {
      const updated = prevColumns.map(col => ({ ...col, tasks: [...col.tasks] }));
      let movingTask: Task | null = null;

      updated.forEach(col => {
        const index = col.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          movingTask = col.tasks.splice(index, 1);
        }
      });

      if (movingTask) {
        (movingTask as Task).columnId = targetColumnId;
        const destCol = updated.find(c => c.id === targetColumnId);
        if (destCol) {
          destCol.tasks.push(movingTask);
          
          socket?.emit('task:move', {
            projectId,
            taskId,
            sourceColumnId: (movingTask as Task).columnId,
            destinationColumnId: targetColumnId,
            newPosition: destCol.tasks.length - 1
          });
        }
      }
      return updated;
    });
  };

  // --- 4. CREATE NEW KANBAN TASK CARDS ---
  const handleCreateTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDesc,
      columnId,
      position: 100
    };

    setColumns(prev => prev.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: [...col.tasks, newTask] };
      }
      return col;
    }));

    socket?.emit('task:add', newTask);

    setNewTaskTitle('');
    setNewTaskDesc('');
    setActiveFormColId(null);
  };

  // --- 5. TEAM CHAT MESSAGING ENGINE ---
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;

    const payload = {
      projectId,
      messageId: Math.random().toString(),
      text: chatInput,
      authorName: user.fullName
    };

    socket.emit('chat:message:send', payload);
    setChatInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#09090b', width: '100%', paddingBottom: '40px' }}>
      
      {/* REAL-TIME FILTER INPUT CONSOLE CONTROL BAR */}
      <div style={{ display: 'flex', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '10px 16px', alignItems: 'center', gap: '12px' }}>
        <Search style={{ width: '16px', height: '16px', color: '#71717a' }} />
        <input 
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter sprint issues by keywords..."
          style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#f4f4f5', fontSize: '13px', outline: 'none' }}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
          >
            Clear
          </button>
        )}
      </div>

      {/* VERTICAL BOARDS STACK */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {columns.map(col => {
          const filteredTasks = col.tasks?.filter(task => 
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
          ) || [];

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                <h3 style={{ color: '#e4e4e7', fontSize: '14px', fontWeight: 600 }}>{col.name}</h3>
                <span style={{ fontSize: '11px', backgroundColor: '#27272a', color: '#a1a1aa', padding: '2px 8px', borderRadius: '20px' }}>{filteredTasks.length}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', padding: '14px', cursor: 'grab' }}
                  >
                    <h4 style={{ color: '#f4f4f5', fontSize: '13px', fontWeight: 500, margin: '0 0 4px 0' }}>{task.title}</h4>
                    {task.description && <p style={{ color: '#71717a', fontSize: '11px', margin: 0 }}>{task.description}</p>}
                  </div>
                ))}
              </div>

              {activeFormColId === col.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#09090b', padding: '12px', borderRadius: '12px', border: '1px solid #27272a' }}>
                  <input
                    type="text"
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    style={{ backgroundColor: 'transparent', border: 'none', color: '#f4f4f5', fontSize: '12px', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Add description..."
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    style={{ backgroundColor: 'transparent', border: 'none', color: '#71717a', fontSize: '11px', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'end' }}>
                    <button onClick={() => setActiveFormColId(null)} style={{ backgroundColor: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => handleCreateTask(col.id)} style={{ backgroundColor: '#4f46e5', border: 'none', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Add Card</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActiveFormColId(col.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: 'none', color: '#71717a', fontSize: '12px', cursor: 'pointer', padding: '4px 0' }}
                >
                  <Plus size={14} /> Add Task Card
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 🚀 INJECTED CHAT CONTAINER UI BLOCK */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '400px', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '20px', gap: '12px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#e4e4e7' }}>📢 Live Team Workspace Feed</span>
          <span style={{ fontSize: '10px', backgroundColor: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: '20px', fontWeight: 'bold' }}>{messages.length}</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
          {messages.length === 0 ? (
            <div style={{ color: '#71717a', fontSize: '11px', fontStyle: 'italic', margin: 'auto' }}>No workspace announcements yet. Broadcast a sync alert below!</div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} style={{ backgroundColor: '#09090b', border: '1px solid #27272a', padding: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#818cf8' }}>{msg.authorName}</span>
                <p style={{ color: '#f4f4f5', fontSize: '12px', margin: 0 }}>{msg.text}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Type your real-time sync announcement..."
            style={{ flex: 1, backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', padding: '8px 12px', color: '#f4f4f5', fontSize: '12px', outline: 'none' }}
          />
          <button type="submit" style={{ backgroundColor: '#4f46e5', border: 'none', color: '#fff', padding: '0 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={14} />
          </button>
        </form>
      </div>

    </div>
  );
};
