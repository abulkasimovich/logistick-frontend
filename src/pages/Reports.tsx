// Reports.tsx
export default function Reports() {
  const reports = [
    { title: 'Monthly P&L Report', desc: 'Revenue, profit, expenses breakdown', type: 'PDF' },
    { title: 'Driver Performance', desc: 'RPM, loads, fuel per driver', type: 'Excel' },
    { title: 'Customer Revenue', desc: 'Revenue share and load volume', type: 'PDF' },
    { title: 'Fuel Efficiency', desc: 'Cost per mile trend analysis', type: 'Excel' },
    { title: 'Load Status Summary', desc: 'Delivered, in-transit, cancelled', type: 'PDF' },
    { title: 'Dispatcher KPIs', desc: 'Revenue and profit per dispatcher', type: 'Excel' },
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {reports.map(r => (
          <div className="card" key={r.title} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div className="card-title">{r.title}</div>
              <div className="card-subtitle" style={{ marginTop: 4 }}>{r.desc}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <span className={`pill ${r.type === 'PDF' ? 'pill-red' : 'pill-green'}`}>{r.type}</span>
              <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>
                <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Scheduled Reports</div></div>
        <div style={{ color: 'var(--muted)', fontSize: 12, padding: '20px 0' }}>No scheduled reports configured yet.</div>
      </div>
    </>
  );
}
