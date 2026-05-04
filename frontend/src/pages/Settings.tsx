import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { fmtDate } from '../utils/formatters';

const TABS = ['General', 'Users', 'Notifications', 'Security'];

export default function Settings() {
  const [tab, setTab] = useState('General');
  const hasRole = useAuthStore(s => s.hasRole);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data),
    enabled: hasRole('admin'),
  });

  return (
    <>
      <div className="tab-group" style={{ marginBottom: 16, display: 'inline-flex' }}>
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'General' && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="card-header"><div className="card-title">General Settings</div></div>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Company Name</label>
              <input className="form-input" defaultValue="Fleet Command Inc." />
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select className="form-select">
                <option>UTC-5 (Eastern)</option>
                <option>UTC-6 (Central)</option>
                <option>UTC-7 (Mountain)</option>
                <option>UTC-8 (Pacific)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-select"><option>USD ($)</option></select>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>
      )}

      {tab === 'Users' && hasRole('admin') && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">User Management</div>
            <button className="btn btn-primary" style={{ fontSize: 11 }}>
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Invite User
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              {(users ?? []).map((u: any) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                  <td><span className={`pill ${u.role === 'admin' ? 'pill-red' : u.role === 'dispatcher' ? 'pill-blue' : 'pill-green'}`}>{u.role}</span></td>
                  <td><span className={`pill ${u.is_active ? 'pill-green' : 'pill-red'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ color: 'var(--muted)' }}>{fmtDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Notifications' && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="card-header"><div className="card-title">Notification Settings</div></div>
          {[
            { label: 'Load delivered alerts',   desc: 'Get notified when a load is marked delivered' },
            { label: 'New load created',         desc: 'Alert on each new load creation' },
            { label: 'Status change events',     desc: 'Real-time status updates via WebSocket' },
            { label: 'Daily summary email',      desc: 'Receive daily P&L summary at 8am' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.desc}</div>
              </div>
              <div style={{ width: 36, height: 20, background: 'var(--accent)', borderRadius: 10, position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ position: 'absolute', right: 2, top: 2, width: 16, height: 16, background: '#0d0f14', borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Security' && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="card-header"><div className="card-title">Security Settings</div></div>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
          </div>
          <div style={{ marginTop: 16 }}><button className="btn btn-primary">Update Password</button></div>
        </div>
      )}
    </>
  );
}
