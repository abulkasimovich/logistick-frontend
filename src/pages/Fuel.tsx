// Fuel.tsx
import { useQuery } from '@tanstack/react-query';
import { useUiStore } from '../store/uiStore';
import { statsService } from '../services/statsService';
import { FuelLineChart } from '../components/charts';
import { fmt } from '../utils/formatters';

export default function Fuel() {
  const period = useUiStore(s => s.period);
  const { data: monthly, isLoading } = useQuery({
    queryKey: ['stats', 'monthly', period],
    queryFn: () => statsService.getMonthly(period),
  });

  if (isLoading) return <div className="loading-row"><div className="spinner" /><span>Loading fuel data…</span></div>;

  const m = monthly ?? [];
  const totalFuel = m.reduce((s, x) => s + x.fuel, 0);
  const totalMiles = m.reduce((s, x) => s + x.miles, 0);
  const fcpm = totalMiles > 0 ? (totalFuel / totalMiles).toFixed(2) : '0.00';
  const avgFuel = m.length ? totalFuel / m.length : 0;

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 16 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Fuel Spend</div>
          <div className="kpi-value" style={{ color: 'var(--warn)' }}>{fmt(totalFuel)}</div>
          <div className="kpi-sub">last {period}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Fuel Cost / Mile</div>
          <div className="kpi-value">${fcpm}</div>
          <div className="kpi-sub">fleet average</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Miles</div>
          <div className="kpi-value">{(totalMiles / 1000).toFixed(0)}K</div>
          <div className="kpi-sub">driven</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Monthly Fuel</div>
          <div className="kpi-value">{fmt(avgFuel)}</div>
          <div className="kpi-sub">per month</div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div><div className="card-title">Fuel Cost vs Miles — Monthly Trend</div><div className="card-subtitle">Last {period}</div></div>
        </div>
        {m.length > 0 && <FuelLineChart data={m} />}
      </div>
    </>
  );
}
