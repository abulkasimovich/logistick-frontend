import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useUiStore } from '../store/uiStore';
import { statsService } from '../services/statsService';
import { RevenueBarChart, LoadsLineChart, FuelLineChart, StatusDonut } from '../components/charts';
import { fmt, fmtN } from '../utils/formatters';

function useLastUpdated(dataUpdatedAt: number) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const tick = () => {
      if (!dataUpdatedAt) return;
      const sec = Math.floor((Date.now() - dataUpdatedAt) / 1000);
      if (sec < 5)   setLabel('just now');
      else if (sec < 60) setLabel(`${sec}s ago`);
      else setLabel(`${Math.floor(sec/60)}m ago`);
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [dataUpdatedAt]);
  return label;
}

export default function Overview() {
  const period = useUiStore(s => s.period);

  const { data: stats, isLoading: statsLoading, dataUpdatedAt } = useQuery({
    queryKey: ['stats', 'overview', period],
    queryFn: () => statsService.getOverview(period),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['stats', 'monthly', period],
    queryFn: () => statsService.getMonthly(period),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const updatedLabel = useLastUpdated(dataUpdatedAt);
  const loading = statsLoading || monthlyLoading;

  if (loading && !stats) {
    return (
      <div className="loading-row">
        <div className="spinner" />
        <span>Loading overview data…</span>
      </div>
    );
  }

  const s = stats!;
  const m = monthly ?? [];

  return (
    <>
      {/* Refresh indicator */}
      <div className="refresh-bar">
        <div className="refresh-dot" />
        <span>Auto-refresh every 30s · Updated {updatedLabel}</span>
      </div>

      {/* PDF-style summary bar */}
      <div className="summary-bar">
        <div className="summary-cell">
          <div className="summary-cell-label">Revenue</div>
          <div className="summary-cell-value">{fmt(s.revenue)}</div>
          <div className="summary-cell-sub">{fmtN(s.total_loads)} loads</div>
        </div>
        <div className="summary-cell">
          <div className="summary-cell-label">Gross Profit</div>
          <div className="summary-cell-value" style={{color:'var(--accent3)'}}>{fmt(s.profit)}</div>
          <div className="summary-cell-sub trend-up">{s.margin} margin</div>
        </div>
        <div className="summary-cell">
          <div className="summary-cell-label">Total Miles</div>
          <div className="summary-cell-value" style={{color:'var(--text)'}}>{fmtN(s.miles)}</div>
          <div className="summary-cell-sub">{s.rpm} RPM</div>
        </div>
        <div className="summary-cell">
          <div className="summary-cell-label">Fuel Cost/Mile</div>
          <div className="summary-cell-value" style={{color:'var(--warn)'}}>{s.fcpm}</div>
          <div className="summary-cell-sub">{fmt(s.fuel)} total</div>
        </div>
        <div className="summary-cell">
          <div className="summary-cell-label">Avg Rev/Load</div>
          <div className="summary-cell-value">{fmt(s.avg_rev_load)}</div>
          <div className="summary-cell-sub">all customers</div>
        </div>
        <div className="summary-cell">
          <div className="summary-cell-label">Cancel Rate</div>
          <div className="summary-cell-value" style={{color:'var(--danger)'}}>{fmtN(s.cancelled)}</div>
          <div className="summary-cell-sub trend-down">cancelled</div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value" style={{ color: 'var(--accent)' }}>{fmt(s.revenue)}</div>
          <div className="kpi-sub">{fmtN(s.total_loads)} loads total</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Gross Profit</div>
          <div className="kpi-value">{fmt(s.profit)}</div>
          <div className="kpi-sub"><span className="kpi-up">{s.margin}</span>&nbsp;margin</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Miles</div>
          <div className="kpi-value">{fmtN(s.miles)}</div>
          <div className="kpi-sub">{s.rpm} revenue / mile</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Fuel Cost / Mile</div>
          <div className="kpi-value" style={{ color: 'var(--warn)' }}>{s.fcpm}</div>
          <div className="kpi-sub">{fmt(s.fuel)} total fuel spend</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Rev / Load</div>
          <div className="kpi-value">{fmt(s.avg_rev_load)}</div>
          <div className="kpi-sub">across all customers</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Delivered</div>
          <div className="kpi-value" style={{ color: 'var(--accent)' }}>{fmtN(s.delivered)}</div>
          <div className="kpi-sub kpi-up">{s.delivery_rate} completion</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">In Transit</div>
          <div className="kpi-value" style={{ color: 'var(--blue)' }}>{fmtN(s.in_transit)}</div>
          <div className="kpi-sub">active shipments</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Cancelled</div>
          <div className="kpi-value" style={{ color: 'var(--danger)' }}>{fmtN(s.cancelled)}</div>
          <div className="kpi-sub kpi-down">cancel rate</div>
        </div>
      </div>

      {/* Revenue Chart + Status Donut */}
      <div className="row-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue vs Profit — Monthly</div>
              <div className="card-subtitle">Last {period} · $ thousands</div>
            </div>
          </div>
          {m.length > 0 ? <RevenueBarChart data={m} /> : <div className="loading-row"><div className="spinner" /></div>}
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Load Status</div>
              <div className="card-subtitle">Distribution by state</div>
            </div>
          </div>
          <div className="donut-wrap" style={{ marginTop: 8 }}>
            <div style={{ width: 120, height: 120, flexShrink: 0 }}>
              <StatusDonut stats={s} />
            </div>
            <div className="donut-legend">
              {[
                { color: 'var(--accent)',  label: 'Delivered',  val: s.delivered  },
                { color: 'var(--blue)',    label: 'In Transit', val: s.in_transit },
                { color: 'var(--warn)',    label: 'Booked',     val: s.booked     },
                { color: 'var(--danger)',  label: 'Cancelled',  val: s.cancelled  },
              ].map(item => (
                <div className="legend-item" key={item.label}>
                  <div className="legend-left">
                    <div className="legend-dot" style={{ background: item.color }} />
                    <span className="legend-name">{item.label}</span>
                  </div>
                  <span className="legend-val">{fmtN(item.val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loads + Fuel charts */}
      <div className="row-3">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Loads per Month</div><div className="card-subtitle">Volume trend</div></div></div>
          {m.length > 0 ? <LoadsLineChart data={m} /> : <div className="loading-row"><div className="spinner" /></div>}
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Fuel Cost vs Miles</div><div className="card-subtitle">Efficiency tracking</div></div></div>
          {m.length > 0 ? <FuelLineChart data={m} /> : <div className="loading-row"><div className="spinner" /></div>}
        </div>
      </div>
    </>
  );
}