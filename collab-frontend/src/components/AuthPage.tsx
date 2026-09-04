import React, { useState } from 'react';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { email, password, fullName };

    try {
      // Connect smoothly to your production environment gateway variable layout
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication sequence failed');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Server connection timed out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b', fontFamily: 'system-ui, sans-serif', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', boxSizing: 'border-box' }}>
        
        {/* Workspace Brand Badge Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: '#ffffff', marginBottom: '12px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>Ω</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f4f4f5', margin: '0 0 6px 0', tracking: '-0.025em' }}>
            {isLogin ? 'Welcome Back' : 'Create Enterprise Account'}
          </h2>
          <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
            {isLogin ? 'Access your synchronized collaborative workspace' : 'Get started with real-time multi-tenant boards'}
          </p>
        </div>

        {/* Dynamic Exception Warning Error Alert */}
        {error && (
          <div style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '1px solid #f87171', color: '#f87171', borderRadius: '8px', padding: '12px', fontSize: '13px', marginBottom: '16px', textAlign: 'center', fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#a1a1aa' }}>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#f4f4f5', outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#a1a1aa' }}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#f4f4f5', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#a1a1aa' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#f4f4f5', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', transition: 'background-color 0.2s' }}
          >
            {loading ? 'Authenticating Profile...' : isLogin ? 'Sign In Workspace' : 'Register Identity'}
          </button>
        </form>

        {/* Dynamic Context Form Toggle Links */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#a1a1aa' }}>
          {isLogin ? "Don't have an enterprise account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#6366f1', fontWeight: 600, padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Sign up here' : 'Log in here'}
          </button>
        </div>

      </div>
    </div>
  );
};
