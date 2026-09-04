import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { LayoutGrid, Send, User as UserIcon, MessageSquare, Plus, X, Search, Filter } from 'lucide-react';

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

export const KanbanBoard: React.FC<{ projectId: string; user: any }> = ({ projectId, user }) => {
  const socket = useSocket();
  const [columns, setColumns] = useState<Column[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Real-Time Search Query States
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeFormColId, setActiveFormColId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // --- 1. BOOTSTRAP WORKSPACE DATA VIA REST API ---
  useEffect(() => {
    const fetchBoardData = async () => {
      const mockColumns: Column[] = [
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
      ];
      setColumns(mockColumns);
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
            sourceColumnId: movingTask.columnId,
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
          // Compute matching cards for keywords found inside descriptions or titles
          const filteredTasks = col.tasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            >
              {/* Title Section Accent */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f4f4f5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col.name}</span>
                <span style={{ backgroundColor: '#27272a', color: '#a1a1aa', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px' }}>
                  {filteredTasks.length} shown
                </span>
              </div>

              {/* Inner Tasks Stack Cards Row Group */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredTasks.length === 0 ? (
                  <div style={{ padding: '24px', fontStyle: 'italic', textAlign: 'center', fontSize: '12px', color: '#52525b', border: '1px dashed #27272a', borderRadius: '12px' }}>
                    {searchQuery ? 'No issues matching search criteria' : 'No open issues in this lane view'}
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', cursor: 'grab', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                    >
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5', margin: '0 0 4px 0' }}>{task.title}</h4>
                      {task.description && <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0, lineHeight: '1.5' }}>{task.description}</p>}
                    </div>
                  ))
                )}
              </div>

              {/* Task Generation Context Box Input Form Console */}
              <div>
                {activeFormColId === col.id ? (
                  <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Enter issue title... (Press Enter to Save)"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleCreateTask(col.id);
                        if (e.key === 'Escape') setActiveFormColId(null);
                      }}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#f4f4f5', outline: 'none' }}
                      autoFocus
                    />
                    <textarea
                      placeholder="Add extra description notes (optional)..."
                      value={newTaskDesc}
                      onChange={e => setNewTaskDesc(e.target.value)}
                      rows={2}
                      onKeyDown={e => {
                        if (e.key === 'Escape') setActiveFormColId(null);
                      }}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#f4f4f5', outline: 'none', resize: 'none' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                      <button type="button" onClick={() => setActiveFormColId(null)} style={{ padding: '6px 12px', backgroundColor: '#27272a', color: '#d4d4d8', fontSize: '11px', fontWeight: 500, borderRadius: '6px', cursor: 'pointer', border: 'none' }}>
                        Cancel
                      </button>
                      <button type="button" onClick={() => handleCreateTask(col.id)} style={{ padding: '6px 14px', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', border: 'none' }}>
                        Save Card
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveFormColId(col.id)}
                    style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: '1px dashed #27272a', color: '#71717a', borderRadius: '12px', fontSize: '12px', fontWeight: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    <Plus style={{ width: '14px', height: '14px' }} /> Add Task Card
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* TEAM DISCUSSION CHAT PLATFORM BOX PANEL */}
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '220px', marginTop: '12px' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #27272a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#a1a1aa', textTransform: 'uppercase', backgroundColor: '#1c1c1f' }}>
          Team Chat Channel Feed
        </div>

        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#09090b', minHeight: '100px' }}>
          {messages.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#52525b', fontSize: '12px', fontStyle: 'italic', padding: '30px 0' }}>
              No messages posted yet. Sync your teammates below.
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #27272a', backgroundColor: msg.authorName === user.fullName ? '#1e1b4b' : '#18181b', marginLeft: msg.authorName === user.fullName ? 'auto' : '0' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {msg.authorName}
                </div>
                <div style={{ fontSize: '12px', color: '#e4e4e7', lineHeight: '1.4' }}>{msg.text}</div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendChat} style={{ padding: '12px', backgroundColor: '#18181b', borderTop: '1px solid #27272a', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your alignment note message..."
            style={{ flex: 1, backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#f4f4f5', outline: 'none' }}
          />
          <button type="submit" style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Send style={{ width: '14px', height: '14px' }} />
          </button>
        </form>
      </div>

    </div>
  );
};
