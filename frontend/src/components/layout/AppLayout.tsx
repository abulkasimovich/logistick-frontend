import { useLocation, NavLink } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import type { Period } from '../../types';

const NAV = [
  { to: '/',            label: 'Overview',    icon: (<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>) },
  { to: '/loads',       label: 'Loads',       icon: (<svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>) },
  { to: '/drivers',     label: 'Drivers',     icon: (<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>) },
  { to: '/dispatchers', label: 'Dispatchers', icon: (<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>) },
  { to: '/customers',   label: 'Customers',   icon: (<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>) },
  { to: '/financials',  label: 'Financials',  icon: (<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>) },
  { to: '/fuel',        label: 'Fuel',        icon: (<svg viewBox="0 0 24 24"><path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16M3 22h12M13 8h2a2 2 0 012 2v3a1 1 0 001 1h1a1 1 0 001-1V9.83a2 2 0 00-.59-1.42L18 6"/></svg>) },
  { to: '/reports',     label: 'Reports',     icon: (<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>) },
  { to: '/settings',    label: 'Settings',    icon: (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>) },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview', '/loads': 'Loads', '/drivers': 'Drivers',
  '/dispatchers': 'Dispatchers', '/customers': 'Customers',
  '/financials': 'Financials', '/fuel': 'Fuel',
  '/reports': 'Reports', '/settings': 'Settings',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useSocket();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, period, setPeriod, notifications } = useUiStore();
  const { user, logout } = useAuthStore();
  const title = PAGE_TITLES[location.pathname] ?? 'Fleet Command';
  const showPeriod = ['/', '/financials', '/fuel'].includes(location.pathname);

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="logo-wrap">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span className="logo-text">FleetCommand</span>
        </div>

        <nav className="nav">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            <span className="footer-label" style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', transition: 'opacity .2s' }}>Collapse</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div><div className="page-title">{title}</div></div>
          <div className="topbar-right">
            {showPeriod && (
              <div className="tab-group">
                {(['3M', '6M', '12M'] as Period[]).map(p => (
                  <button key={p} className={`tab-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
                ))}
              </div>
            )}
            <button className="notif-btn" title="Notifications">
              <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              {notifications.length > 0 && <span className="notif-dot" />}
            </button>
            <div className="live-badge">Live</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 500, color: 'var(--text)' }}>{user?.name}</span>
              <span style={{ padding: '2px 6px', background: 'rgba(0,200,150,.1)', color: 'var(--accent)', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{user?.role?.toUpperCase()}</span>
              <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 11 }}>Logout</button>
            </div>
          </div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
