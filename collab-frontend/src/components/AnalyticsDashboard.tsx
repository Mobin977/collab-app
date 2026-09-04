import React, { useEffect, useState } from 'react';
import { BarChart3, Clock, AlertTriangle, CheckSquare } from 'lucide-react';

interface MetricsPayload {
  projectId: string;
  projectName: string;
  columnId: string;
  columnName: string;
  totalTasks: number;
  urgentTasksCount: number;
  highTasksCount: number;
  mediumTasksCount: number;
  lowTasksCount: number;
  averageAgeHours: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('collab_token');
        const response = await fetch('http://localhost:5000/api/workspace/analytics/velocity', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to pull view layer metrics');

        setMetrics(data.metrics || []);
      } catch (err: any) {
        setError(err.message || 'Analytics gateway unreachable');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ color: '#a1a1aa', fontSize: '12px', padding: '16px', fontStyle: 'italic' }}>Calculating database metrics views...</div>;
  if (error) return <div style={{ color: '#f87171', fontSize: '12px', padding: '16px' }}>⚠️ Error: {error}</div>;

  return (
    <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#09090b', shrink: 0 }}>
      
      {/* Dashboard Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #27272a', paddingBottom: '12px' }}>
        <BarChart3 style={{ width: '16px', height: '16px', color: '#6366f1' }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#f4f4f5', textTransform: 'uppercase', tracking: '0.05em' }}>Real-Time Velocity Insights</span>
      </div>

      {/* Grid containing dynamic metric reporting rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {metrics.map((row, index) => (
          <div 
            key={index}
            style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}
          >
            {/* Project & Column Reference Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5' }}>{row.columnName}</span>
              <span style={{ fontSize: '10px', color: '#71717a', backgroundColor: '#09090b', padding: '2px 6px', borderRadius: '4px', border: '1px solid #27272a' }}>{row.projectName}</span>
            </div>

            {/* Metric Analytics Cards Wrapper row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
              
              {/* Total Active Items Tracking Card */}
              <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#71717a', fontWeight: 600 }}><CheckSquare style={{ width: '12px', height: '12px' }} /> TOTAL TASKS</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#f4f4f5' }}>{row.totalTasks}</div>
              </div>

              {/* Red-flag Blocking Bottleneck Warnings Count Card */}
              <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#f87171', fontWeight: 600 }}><AlertTriangle style={{ width: '12px', height: '12px' }} /> BLOCKERS (URGENT/HIGH)</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#f87171' }}>{Number(row.urgentTasksCount) + Number(row.highTasksCount)}</div>
              </div>

              {/* Task Cycle Longevity calculations derived via raw PostgreSQL epoch times */}
              <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#fbbf24', fontWeight: 600 }}><Clock style={{ width: '12px', height: '12px' }} /> AVG VELOCITY AGE</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fbbf24' }}>{row.averageAgeHours || 0} hrs</div>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
