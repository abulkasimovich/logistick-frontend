import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('admin@fleetcommand.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.access_token, data.refresh_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div>
            <div className="login-title">Fleet Command</div>
            <div className="login-sub">Logistics Intelligence Platform</div>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-err">{error}</div>}
          <div className="login-field">
            <label className="login-label">Email</label>
            <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading && <span className="spinner" style={{ width: 14, height: 14, borderTopColor: '#0d0f14' }} />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="login-hint" style={{ marginTop: 16 }}>
          admin@fleetcommand.com · Admin123!<br />
          dispatcher@fleetcommand.com · Pass123!<br />
          analyst@fleetcommand.com · Pass123!
        </div>
      </div>
    </div>
  );
}
