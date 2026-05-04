import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useUiStore } from '../store/uiStore';
import { statsService, driversService, dispatchersService, customersService } from '../services/statsService';
import { loadsService } from '../services/loadsService';
import { fmt, fmtN, fmtDate } from '../utils/formatters';

// ── CSV export helper ─────────────────────────────────────────
function downloadCSV(filename: string, rows: any[], columns: { key: string; label: string }[]) {
  const header = columns.map(c => `"${c.label}"`).join(',');
  const body = rows.map(row =>
    columns.map(c => {
      const v = row[c.key] ?? '';
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Print / PDF helper ────────────────────────────────────────
function printReport(title: string, html: string) {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html><html><head>
    <title>${title}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:12px;color:#1a1f2e;padding:24px;background:#fff;}
      h1{font-size:18px;margin-bottom:4px;color:#16a34a;}
      .meta{font-size:11px;color:#888;margin-bottom:16px;}
      table{width:100%;border-collapse:collapse;}
      th{background:#16a34a;color:#fff;padding:7px 10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}
      td{padding:6px 10px;border-bottom:1px solid #e8e4da;font-size:12px;}
      tr:nth-child(even) td{background:#f9f6ef;}
      .num{font-family:monospace;}
      .green{color:#16a34a;font-weight:600;}
      .red{color:#ef4444;font-weight:600;}
      .summary{display:flex;gap:24px;margin-bottom:16px;flex-wrap:wrap;}
      .s-box{background:#f0ebe0;border-radius:8px;padding:10px 16px;min-width:120px;}
      .s-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.06em;}
      .s-val{font-size:20px;font-weight:700;color:#16a34a;}
    </style></head><body>
    <h1>${title}</h1>
    <div class="meta">Generated: ${new Date().toLocaleString()} · Fleet Command</div>
    ${html}
    </body></html>
  `);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}

// ── Modal ─────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 900, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Report card ───────────────────────────────────────────────
function ReportCard({ title, desc, type, updated, onView, onDownload, onPrint }: {
  title: string; desc: string; type: string; updated: string;
  onView: () => void; onDownload: () => void; onPrint: () => void;
}) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div className="card-title" style={{ fontSize: 14 }}>{title}</div>
          <div className="card-subtitle" style={{ marginTop: 4 }}>{desc}</div>
        </div>
        <span className={`pill ${type === 'PDF' ? 'pill-red' : 'pill-green'}`}>{type}</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 5, height: 5, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
        Updated: {updated}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
        <button className="btn btn-primary" style={{ flex: 1, fontSize: 11, padding: '5px 8px' }} onClick={onView}>
          <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View
        </button>
        <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 8px' }} onClick={onDownload}>
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </button>
        <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 8px' }} onClick={onPrint}>
          <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          PDF
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function Reports() {
  const period = useUiStore(s => s.period);
  const [modal, setModal] = useState<string | null>(null);
  const now = new Date().toLocaleString();

  const { data: overview, dataUpdatedAt: ou } = useQuery({
    queryKey: ['stats', 'overview', period],
    queryFn: () => statsService.getOverview(period),
    refetchInterval: 30_000,
  });

  const { data: monthly, dataUpdatedAt: mu } = useQuery({
    queryKey: ['stats', 'monthly', period],
    queryFn: () => statsService.getMonthly(period),
    refetchInterval: 30_000,
  });

  const { data: financials } = useQuery({
    queryKey: ['stats', 'financials', period],
    queryFn: () => statsService.getFinancials(period),
    refetchInterval: 30_000,
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversService.getAll('revenue', 'desc'),
    refetchInterval: 30_000,
  });

  const { data: dispatchers } = useQuery({
    queryKey: ['dispatchers'],
    queryFn: () => dispatchersService.getAll(),
    refetchInterval: 30_000,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll(),
    refetchInterval: 30_000,
  });

  const { data: loadsData } = useQuery({
    queryKey: ['loads', 'report'],
    queryFn: () => loadsService.getAll({ limit: 500 }),
    refetchInterval: 30_000,
  });

  const loads = loadsData?.data ?? [];
  const updatedTime = ou ? new Date(ou).toLocaleTimeString() : now;
  const monthlyUpdated = mu ? new Date(mu).toLocaleTimeString() : now;

  // ── Monthly P&L ───────────────────────────────────────────
  const monthlyRows = monthly ?? [];
  const handleViewPL = () => setModal('pl');
  const handleDownloadPL = () => downloadCSV('monthly-pl.csv', monthlyRows, [
    { key: 'month', label: 'Month' },
    { key: 'revenue', label: 'Revenue ($)' },
    { key: 'profit', label: 'Profit ($)' },
    { key: 'fuel', label: 'Fuel Cost ($)' },
    { key: 'driver_pay', label: 'Driver Pay ($)' },
    { key: 'miles', label: 'Miles' },
    { key: 'loads', label: 'Loads' },
  ]);
  const handlePrintPL = () => {
    const html = `
      <div class="summary">
        <div class="s-box"><div class="s-label">Total Revenue</div><div class="s-val">${fmt(overview?.revenue ?? 0)}</div></div>
        <div class="s-box"><div class="s-label">Gross Profit</div><div class="s-val">${fmt(overview?.profit ?? 0)}</div></div>
        <div class="s-box"><div class="s-label">Margin</div><div class="s-val">${overview?.margin ?? '-'}</div></div>
        <div class="s-box"><div class="s-label">Total Miles</div><div class="s-val">${fmtN(overview?.miles ?? 0)}</div></div>
      </div>
      <table><thead><tr><th>Month</th><th>Revenue</th><th>Profit</th><th>Fuel Cost</th><th>Driver Pay</th><th>Miles</th><th>Loads</th></tr></thead><tbody>
      ${monthlyRows.map(r => `<tr><td>${r.month}</td><td class="num green">$${r.revenue.toLocaleString()}</td><td class="num green">$${r.profit.toLocaleString()}</td><td class="num red">$${r.fuel.toLocaleString()}</td><td class="num">$${r.driver_pay.toLocaleString()}</td><td class="num">${r.miles.toLocaleString()}</td><td class="num">${r.loads}</td></tr>`).join('')}
      </tbody></table>`;
    printReport('Monthly P&L Report', html);
  };

  // ── Driver Performance ────────────────────────────────────
  const driverRows = drivers ?? [];
  const handleViewDrivers = () => setModal('drivers');
  const handleDownloadDrivers = () => downloadCSV('driver-performance.csv', driverRows, [
    { key: 'name', label: 'Driver' },
    { key: 'truck_type', label: 'Truck Type' },
    { key: 'terminal', label: 'Terminal' },
    { key: 'status', label: 'Status' },
    { key: 'loads', label: 'Loads' },
    { key: 'revenue', label: 'Revenue ($)' },
    { key: 'miles', label: 'Miles' },
    { key: 'rpm', label: 'RPM' },
  ]);
  const handlePrintDrivers = () => {
    const html = `<table><thead><tr><th>#</th><th>Driver</th><th>Truck</th><th>Terminal</th><th>Status</th><th>Loads</th><th>Revenue</th><th>Miles</th><th>RPM</th></tr></thead><tbody>
    ${driverRows.map((d, i) => `<tr><td>${i+1}</td><td>${d.name}</td><td>${d.truck_type}</td><td>${d.terminal}</td><td>${d.status}</td><td>${d.loads ?? 0}</td><td class="num green">${fmt(d.revenue ?? 0)}</td><td class="num">${fmtN(d.miles ?? 0)}</td><td class="num">${d.rpm ?? '-'}</td></tr>`).join('')}
    </tbody></table>`;
    printReport('Driver Performance Report', html);
  };

  // ── Customer Revenue ──────────────────────────────────────
  const customerRows = customers ?? [];
  const handleViewCustomers = () => setModal('customers');
  const handleDownloadCustomers = () => downloadCSV('customer-revenue.csv', customerRows, [
    { key: 'name', label: 'Customer' },
    { key: 'contact_email', label: 'Email' },
    { key: 'loads', label: 'Loads' },
    { key: 'revenue', label: 'Revenue ($)' },
    { key: 'revenue_share', label: 'Revenue Share' },
  ]);
  const handlePrintCustomers = () => {
    const html = `<table><thead><tr><th>#</th><th>Customer</th><th>Email</th><th>Loads</th><th>Revenue</th><th>Share</th></tr></thead><tbody>
    ${customerRows.map((c, i) => `<tr><td>${i+1}</td><td>${c.name}</td><td>${c.contact_email ?? '-'}</td><td>${c.loads ?? 0}</td><td class="num green">${fmt(c.revenue ?? 0)}</td><td class="num">${c.revenue_share ?? '-'}</td></tr>`).join('')}
    </tbody></table>`;
    printReport('Customer Revenue Report', html);
  };

  // ── Load Status ───────────────────────────────────────────
  const handleViewLoads = () => setModal('loads');
  const handleDownloadLoads = () => downloadCSV('load-status.csv', loads, [
    { key: 'load_number', label: 'Load #' },
    { key: 'status', label: 'Status' },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    { key: 'truck_type', label: 'Truck Type' },
    { key: 'miles', label: 'Miles' },
    { key: 'revenue', label: 'Revenue ($)' },
    { key: 'fuel_cost', label: 'Fuel ($)' },
    { key: 'driver_pay', label: 'Driver Pay ($)' },
    { key: 'created_at', label: 'Created' },
  ]);
  const handlePrintLoads = () => {
    const delivered  = loads.filter(l => l.status === 'delivered').length;
    const in_transit = loads.filter(l => l.status === 'in_transit').length;
    const booked     = loads.filter(l => l.status === 'booked').length;
    const cancelled  = loads.filter(l => l.status === 'cancelled').length;
    const html = `
      <div class="summary">
        <div class="s-box"><div class="s-label">Delivered</div><div class="s-val">${delivered}</div></div>
        <div class="s-box"><div class="s-label">In Transit</div><div class="s-val">${in_transit}</div></div>
        <div class="s-box"><div class="s-label">Booked</div><div class="s-val">${booked}</div></div>
        <div class="s-box"><div class="s-label">Cancelled</div><div class="s-val" style="color:#ef4444">${cancelled}</div></div>
      </div>
      <table><thead><tr><th>Load #</th><th>Status</th><th>Origin</th><th>Destination</th><th>Miles</th><th>Revenue</th><th>Created</th></tr></thead><tbody>
      ${loads.slice(0, 100).map(l => `<tr><td>${l.load_number}</td><td>${l.status}</td><td>${l.origin}</td><td>${l.destination}</td><td class="num">${l.miles}</td><td class="num green">${fmt(l.revenue)}</td><td>${fmtDate(l.created_at)}</td></tr>`).join('')}
      </tbody></table>`;
    printReport('Load Status Summary', html);
  };

  // ── Dispatcher KPIs ───────────────────────────────────────
  const dispRows = dispatchers ?? [];
  const handleViewDisp = () => setModal('dispatchers');
  const handleDownloadDisp = () => downloadCSV('dispatcher-kpis.csv', dispRows, [
    { key: 'name', label: 'Dispatcher' },
    { key: 'team', label: 'Team' },
    { key: 'region', label: 'Region' },
    { key: 'loads', label: 'Loads' },
    { key: 'revenue', label: 'Revenue ($)' },
    { key: 'profit', label: 'Profit ($)' },
    { key: 'margin', label: 'Margin' },
  ]);
  const handlePrintDisp = () => {
    const html = `<table><thead><tr><th>#</th><th>Dispatcher</th><th>Team</th><th>Region</th><th>Loads</th><th>Revenue</th><th>Profit</th><th>Margin</th></tr></thead><tbody>
    ${dispRows.map((d, i) => `<tr><td>${i+1}</td><td>${d.name}</td><td>${d.team}</td><td>${d.region}</td><td>${d.loads ?? 0}</td><td class="num green">${fmt(d.revenue ?? 0)}</td><td class="num green">${fmt(d.profit ?? 0)}</td><td class="num">${d.margin ?? '-'}</td></tr>`).join('')}
    </tbody></table>`;
    printReport('Dispatcher KPIs Report', html);
  };

  // ── Fuel Efficiency ───────────────────────────────────────
  const handleViewFuel = () => setModal('fuel');
  const handleDownloadFuel = () => downloadCSV('fuel-efficiency.csv', monthlyRows, [
    { key: 'month', label: 'Month' },
    { key: 'fuel', label: 'Fuel Cost ($)' },
    { key: 'miles', label: 'Miles' },
    { key: 'loads', label: 'Loads' },
  ]);
  const handlePrintFuel = () => {
    const html = `<table><thead><tr><th>Month</th><th>Fuel Cost</th><th>Miles</th><th>Fuel/Mile</th><th>Loads</th></tr></thead><tbody>
    ${monthlyRows.map(r => `<tr><td>${r.month}</td><td class="num red">$${r.fuel.toLocaleString()}</td><td class="num">${r.miles.toLocaleString()}</td><td class="num">${r.miles ? '$'+(r.fuel/r.miles).toFixed(3) : '-'}</td><td>${r.loads}</td></tr>`).join('')}
    </tbody></table>`;
    printReport('Fuel Efficiency Report', html);
  };

  const statusColor: Record<string, string> = {
    delivered: 'var(--accent)', in_transit: 'var(--blue)',
    booked: 'var(--warn)', cancelled: 'var(--danger)',
  };

  return (
    <>
      {/* Refresh indicator */}
      <div className="refresh-bar">
        <div className="refresh-dot" />
        <span>Real-time · Auto-refresh every 30s · {updatedTime}</span>
      </div>

      {/* Overview summary */}
      {overview && (
        <div className="summary-bar" style={{ marginBottom: 16 }}>
          <div className="summary-cell">
            <div className="summary-cell-label">Revenue</div>
            <div className="summary-cell-value">{fmt(overview.revenue)}</div>
            <div className="summary-cell-sub">{overview.total_loads} loads</div>
          </div>
          <div className="summary-cell">
            <div className="summary-cell-label">Profit</div>
            <div className="summary-cell-value" style={{ color: 'var(--accent2)' }}>{fmt(overview.profit)}</div>
            <div className="summary-cell-sub trend-up">{overview.margin}</div>
          </div>
          <div className="summary-cell">
            <div className="summary-cell-label">Miles</div>
            <div className="summary-cell-value" style={{ color: 'var(--text)' }}>{fmtN(overview.miles)}</div>
            <div className="summary-cell-sub">{overview.rpm} RPM</div>
          </div>
          <div className="summary-cell">
            <div className="summary-cell-label">Fuel</div>
            <div className="summary-cell-value" style={{ color: 'var(--warn)' }}>{fmt(overview.fuel)}</div>
            <div className="summary-cell-sub">{overview.fcpm}/mile</div>
          </div>
          <div className="summary-cell">
            <div className="summary-cell-label">Delivered</div>
            <div className="summary-cell-value">{overview.delivered}</div>
            <div className="summary-cell-sub trend-up">{overview.delivery_rate}</div>
          </div>
          <div className="summary-cell">
            <div className="summary-cell-label">Cancelled</div>
            <div className="summary-cell-value" style={{ color: 'var(--danger)' }}>{overview.cancelled}</div>
            <div className="summary-cell-sub trend-down">cancel rate</div>
          </div>
        </div>
      )}

      {/* Report cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <ReportCard title="Monthly P&L Report" desc="Revenue, profit, expenses breakdown by month" type="PDF"
          updated={monthlyUpdated} onView={handleViewPL} onDownload={handleDownloadPL} onPrint={handlePrintPL} />
        <ReportCard title="Driver Performance" desc="RPM, loads, miles and revenue per driver" type="CSV"
          updated={updatedTime} onView={handleViewDrivers} onDownload={handleDownloadDrivers} onPrint={handlePrintDrivers} />
        <ReportCard title="Customer Revenue" desc="Revenue share and load volume per customer" type="PDF"
          updated={updatedTime} onView={handleViewCustomers} onDownload={handleDownloadCustomers} onPrint={handlePrintCustomers} />
        <ReportCard title="Fuel Efficiency" desc="Fuel cost per mile trend analysis by month" type="CSV"
          updated={monthlyUpdated} onView={handleViewFuel} onDownload={handleDownloadFuel} onPrint={handlePrintFuel} />
        <ReportCard title="Load Status Summary" desc="Delivered, in-transit, booked, cancelled loads" type="PDF"
          updated={updatedTime} onView={handleViewLoads} onDownload={handleDownloadLoads} onPrint={handlePrintLoads} />
        <ReportCard title="Dispatcher KPIs" desc="Revenue, profit and margin per dispatcher" type="CSV"
          updated={updatedTime} onView={handleViewDisp} onDownload={handleDownloadDisp} onPrint={handlePrintDisp} />
      </div>

      {/* ── MODALS ── */}

      {/* Monthly P&L */}
      {modal === 'pl' && (
        <Modal title="Monthly P&L Report" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Revenue', val: fmt(overview?.revenue ?? 0), color: 'var(--accent)' },
              { label: 'Gross Profit',  val: fmt(overview?.profit ?? 0),  color: 'var(--accent2)' },
              { label: 'Margin',        val: overview?.margin ?? '-',      color: 'var(--accent)' },
              { label: 'Total Miles',   val: fmtN(overview?.miles ?? 0),  color: 'var(--text)' },
            ].map(s => (
              <div key={s.label} className="metric-mini" style={{ minWidth: 120 }}>
                <div className="metric-mini-label">{s.label}</div>
                <div className="metric-mini-value" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div className="table-scroll" style={{ maxHeight: 400 }}>
            <table className="data-table">
              <thead><tr>
                <th>Month</th><th>Revenue</th><th>Profit</th><th>Fuel Cost</th><th>Driver Pay</th><th>Miles</th><th>Loads</th>
              </tr></thead>
              <tbody>
                {monthlyRows.map(r => (
                  <tr key={r.month}>
                    <td style={{ fontWeight: 600 }}>{r.month}</td>
                    <td className="num" style={{ color: 'var(--accent)' }}>${r.revenue.toLocaleString()}</td>
                    <td className="num" style={{ color: 'var(--accent2)' }}>${r.profit.toLocaleString()}</td>
                    <td className="num" style={{ color: 'var(--warn)' }}>${r.fuel.toLocaleString()}</td>
                    <td className="num">${r.driver_pay.toLocaleString()}</td>
                    <td className="num">{r.miles.toLocaleString()}</td>
                    <td className="num">{r.loads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={handleDownloadPL}>CSV yuklab olish</button>
            <button className="btn btn-primary" onClick={handlePrintPL}>PDF sifatida chop etish</button>
          </div>
        </Modal>
      )}

      {/* Drivers */}
      {modal === 'drivers' && (
        <Modal title="Driver Performance Report" onClose={() => setModal(null)}>
          <div className="table-scroll" style={{ maxHeight: 440 }}>
            <table className="data-table">
              <thead><tr>
                <th>#</th><th>Driver</th><th>Truck</th><th>Terminal</th><th>Status</th><th>Loads</th><th>Revenue</th><th>Miles</th><th>RPM</th>
              </tr></thead>
              <tbody>
                {driverRows.map((d, i) => (
                  <tr key={d.id}>
                    <td><span className={`rank-badge ${['','gold','silver','bronze'][i+1] ?? ''}`}>{i+1}</span></td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td>{d.truck_type}</td>
                    <td style={{ color: 'var(--muted)' }}>{d.terminal}</td>
                    <td><span className={`pill ${d.status === 'active' ? 'pill-green' : d.status === 'on_trip' ? 'pill-blue' : 'pill-warn'}`}>{d.status}</span></td>
                    <td className="num">{d.loads ?? 0}</td>
                    <td className="num" style={{ color: 'var(--accent)' }}>{fmt(d.revenue ?? 0)}</td>
                    <td className="num">{fmtN(d.miles ?? 0)}</td>
                    <td className="num">{d.rpm ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={handleDownloadDrivers}>CSV yuklab olish</button>
            <button className="btn btn-primary" onClick={handlePrintDrivers}>PDF sifatida chop etish</button>
          </div>
        </Modal>
      )}

      {/* Customers */}
      {modal === 'customers' && (
        <Modal title="Customer Revenue Report" onClose={() => setModal(null)}>
          <div className="table-scroll" style={{ maxHeight: 440 }}>
            <table className="data-table">
              <thead><tr>
                <th>#</th><th>Customer</th><th>Email</th><th>Loads</th><th>Revenue</th><th>Share</th>
              </tr></thead>
              <tbody>
                {customerRows.map((c, i) => (
                  <tr key={c.id}>
                    <td><span className={`rank-badge ${['','gold','silver','bronze'][i+1] ?? ''}`}>{i+1}</span></td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 11 }}>{c.contact_email ?? '—'}</td>
                    <td className="num">{c.loads ?? 0}</td>
                    <td className="num" style={{ color: 'var(--accent)' }}>{fmt(c.revenue ?? 0)}</td>
                    <td className="num">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--surface2)', borderRadius: 2, minWidth: 60 }}>
                          <div style={{ height: '100%', background: 'var(--accent2)', borderRadius: 2, width: c.revenue_share ?? '0%' }} />
                        </div>
                        <span style={{ minWidth: 32, fontSize: 11 }}>{c.revenue_share ?? '—'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={handleDownloadCustomers}>CSV yuklab olish</button>
            <button className="btn btn-primary" onClick={handlePrintCustomers}>PDF sifatida chop etish</button>
          </div>
        </Modal>
      )}

      {/* Load Status */}
      {modal === 'loads' && (
        <Modal title="Load Status Summary" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {(['delivered','in_transit','booked','cancelled'] as const).map(st => (
              <div key={st} className="metric-mini">
                <div className="metric-mini-label">{st.replace('_',' ')}</div>
                <div className="metric-mini-value" style={{ color: statusColor[st] }}>
                  {loads.filter(l => l.status === st).length}
                </div>
              </div>
            ))}
          </div>
          <div className="table-scroll" style={{ maxHeight: 380 }}>
            <table className="data-table">
              <thead><tr>
                <th>Load #</th><th>Status</th><th>Origin</th><th>Destination</th><th>Truck</th><th>Miles</th><th>Revenue</th><th>Created</th>
              </tr></thead>
              <tbody>
                {loads.slice(0, 200).map(l => (
                  <tr key={l.id}>
                    <td className="num" style={{ fontWeight: 600 }}>{l.load_number}</td>
                    <td><span className="pill" style={{ background: `${statusColor[l.status]}22`, color: statusColor[l.status] }}>{l.status}</span></td>
                    <td style={{ fontSize: 11 }}>{l.origin}</td>
                    <td style={{ fontSize: 11 }}>{l.destination}</td>
                    <td style={{ fontSize: 11 }}>{l.truck_type}</td>
                    <td className="num">{l.miles}</td>
                    <td className="num" style={{ color: 'var(--accent)' }}>{fmt(l.revenue)}</td>
                    <td style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtDate(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={handleDownloadLoads}>CSV yuklab olish</button>
            <button className="btn btn-primary" onClick={handlePrintLoads}>PDF sifatida chop etish</button>
          </div>
        </Modal>
      )}

      {/* Dispatchers */}
      {modal === 'dispatchers' && (
        <Modal title="Dispatcher KPIs Report" onClose={() => setModal(null)}>
          <div className="table-scroll" style={{ maxHeight: 440 }}>
            <table className="data-table">
              <thead><tr>
                <th>#</th><th>Dispatcher</th><th>Team</th><th>Region</th><th>Loads</th><th>Revenue</th><th>Profit</th><th>Margin</th>
              </tr></thead>
              <tbody>
                {dispRows.map((d, i) => (
                  <tr key={d.id}>
                    <td><span className={`rank-badge ${['','gold','silver','bronze'][i+1] ?? ''}`}>{i+1}</span></td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td><span className="pill pill-blue">{d.team}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{d.region}</td>
                    <td className="num">{d.loads ?? 0}</td>
                    <td className="num" style={{ color: 'var(--accent)' }}>{fmt(d.revenue ?? 0)}</td>
                    <td className="num" style={{ color: 'var(--accent2)' }}>{fmt(d.profit ?? 0)}</td>
                    <td className="num">{d.margin ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={handleDownloadDisp}>CSV yuklab olish</button>
            <button className="btn btn-primary" onClick={handlePrintDisp}>PDF sifatida chop etish</button>
          </div>
        </Modal>
      )}

      {/* Fuel */}
      {modal === 'fuel' && (
        <Modal title="Fuel Efficiency Report" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <div className="metric-mini">
              <div className="metric-mini-label">Total Fuel Cost</div>
              <div className="metric-mini-value" style={{ color: 'var(--warn)' }}>{fmt(overview?.fuel ?? 0)}</div>
            </div>
            <div className="metric-mini">
              <div className="metric-mini-label">Fuel Cost/Mile</div>
              <div className="metric-mini-value">{overview?.fcpm ?? '-'}</div>
            </div>
            <div className="metric-mini">
              <div className="metric-mini-label">Total Miles</div>
              <div className="metric-mini-value">{fmtN(overview?.miles ?? 0)}</div>
            </div>
          </div>
          <div className="table-scroll" style={{ maxHeight: 400 }}>
            <table className="data-table">
              <thead><tr>
                <th>Month</th><th>Fuel Cost</th><th>Miles</th><th>Fuel/Mile</th><th>Loads</th>
              </tr></thead>
              <tbody>
                {monthlyRows.map(r => (
                  <tr key={r.month}>
                    <td style={{ fontWeight: 600 }}>{r.month}</td>
                    <td className="num" style={{ color: 'var(--warn)' }}>${r.fuel.toLocaleString()}</td>
                    <td className="num">{r.miles.toLocaleString()}</td>
                    <td className="num">{r.miles ? '$' + (r.fuel / r.miles).toFixed(3) : '—'}</td>
                    <td className="num">{r.loads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={handleDownloadFuel}>CSV yuklab olish</button>
            <button className="btn btn-primary" onClick={handlePrintFuel}>PDF sifatida chop etish</button>
          </div>
        </Modal>
      )}
    </>
  );
}