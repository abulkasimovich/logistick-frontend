import { useQuery } from '@tanstack/react-query';
import { useUiStore } from '../store/uiStore';
import { statsService } from '../services/statsService';
import { CostStackedBar, ExpenseDonut } from '../components/charts';
import { fmt } from '../utils/formatters';

export default function Financials() {
  const period = useUiStore(s => s.period);
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'financials', period],
    queryFn: () => statsService.getFinancials(period),
  });

  if (isLoading || !data) return <div className="loading-row"><div className="spinner" /><span>Loading financials…</span></div>;

  const { totals, exp_pct, monthly } = data as any;

  return (
    <>
      <div className="metric-row">
        <div className="metric-mini">
          <div className="metric-mini-label">Total Revenue</div>
          <div className="metric-mini-value" style={{ color: 'var(--accent)' }}>{fmt(totals.revenue)}</div>
        </div>
        <div className="metric-mini">
          <div className="metric-mini-label">Gross Profit</div>
          <div className="metric-mini-value">{fmt(totals.profit)}</div>
        </div>
        <div className="metric-mini">
          <div className="metric-mini-label">Total Fuel</div>
          <div className="metric-mini-value" style={{ color: 'var(--warn)' }}>{fmt(totals.fuel)}</div>
        </div>
        <div className="metric-mini">
          <div className="metric-mini-label">Driver Pay</div>
          <div className="metric-mini-value" style={{ color: 'var(--accent2)' }}>{fmt(totals.driver_pay)}</div>
        </div>
      </div>

      <div className="row-2">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Cost Breakdown — Monthly</div><div className="card-subtitle">Stacked by category</div></div>
          </div>
          <CostStackedBar data={monthly} />
        </div>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Expense Split</div><div className="card-subtitle">% of revenue</div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 8 }}>
            <ExpenseDonut profit={exp_pct.profit} driverPay={exp_pct.driver_pay} fuel={exp_pct.fuel} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              {[
                { color: 'var(--accent)',  label: 'Gross Profit', val: exp_pct.profit + '%' },
                { color: 'var(--accent2)', label: 'Driver Pay',   val: exp_pct.driver_pay + '%' },
                { color: 'var(--warn)',    label: 'Fuel',         val: exp_pct.fuel + '%' },
              ].map(item => (
                <div className="legend-item" key={item.label}>
                  <div className="legend-left">
                    <div className="legend-dot" style={{ background: item.color }} />
                    <span className="legend-name">{item.label}</span>
                  </div>
                  <span className="legend-val">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
