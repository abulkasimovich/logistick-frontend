import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { dispatchersService } from '../services/statsService';
import { useAuthStore } from '../store/authStore';
import { DispatchersBarChart } from '../components/charts';
import { fmt, rankCls } from '../utils/formatters';
import type { Dispatcher } from '../types';

const TEAM_CLS: Record<string, string> = { 'Team Alpha': 'pill-blue', 'Team Omega': 'pill-green', 'Team Delta': 'pill-warn' };
const TEAMS   = ['Team Alpha', 'Team Omega', 'Team Delta'];
const REGIONS = ['Southeast', 'Midwest', 'Northeast', 'Southwest', 'West Coast', 'Northwest'];

const schema = z.object({
  name:   z.string().min(2, 'Name is required'),
  team:   z.string().min(1),
  region: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function Dispatchers() {
  const qc = useQueryClient();
  const canEdit = useAuthStore(s => s.hasRole)('admin');

  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<Dispatcher | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: dispatchers, isLoading } = useQuery({
    queryKey: ['dispatchers'],
    queryFn:  () => dispatchersService.getAll(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMut = useMutation({
    mutationFn: dispatchersService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dispatchers'] }); toast.success('Dispatcher added'); close(); },
    onError:   () => toast.error('Failed to add'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dispatcher> }) => dispatchersService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dispatchers'] }); toast.success('Updated'); close(); },
    onError:   () => toast.error('Failed to update'),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => dispatchersService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dispatchers'] }); toast.success('Deleted'); setConfirmId(null); },
    onError:   () => toast.error('Failed to delete'),
  });

  function openCreate() { reset({ name: '', team: 'Team Alpha', region: 'Southeast' }); setEditing(null); setShowModal(true); }
  function openEdit(d: Dispatcher) { reset({ name: d.name, team: d.team, region: d.region }); setEditing(d); setShowModal(true); }
  function close() { setShowModal(false); setEditing(null); reset(); }
  function onSubmit(data: FormData) { editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data); }

  if (isLoading) return <div className="loading-row"><div className="spinner" /><span>Loading…</span></div>;

  const items      = dispatchers ?? [];
  const top8       = items.slice(0, 8);
  const totalRev   = items.reduce((s, d) => s + (d.revenue ?? 0), 0);
  const avgRev     = items.length ? totalRev / items.length : 0;
  const totalLoads = items.reduce((s, d) => s + (d.loads ?? 0), 0);
  const avgLoads   = items.length ? Math.round(totalLoads / items.length) : 0;
  const allRegions = items.map(d => d.region);
  const topRegion  = [...allRegions].sort((a,b) => allRegions.filter(r=>r===b).length - allRegions.filter(r=>r===a).length)[0] ?? '—';

  return (
    <>
      <div className="metric-row">
        {[
          { label: 'Total Dispatchers',    value: items.length,  color: 'var(--accent2)' },
          { label: 'Avg Rev / Dispatcher', value: fmt(avgRev),   color: undefined },
          { label: 'Avg Loads',            value: avgLoads,      color: undefined },
          { label: 'Top Region',           value: topRegion,     color: undefined },
        ].map(m => (
          <div className="metric-mini" key={m.label}>
            <div className="metric-mini-label">{m.label}</div>
            <div className="metric-mini-value" style={{ color: m.color, fontSize: 13 }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header">
          <div><div className="card-title">Dispatcher Leaderboard</div><div className="card-subtitle">By total revenue booked</div></div>
          {canEdit && (
            <button className="btn btn-primary" onClick={openCreate}>
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Dispatcher
            </button>
          )}
        </div>
        <div className="table-scroll" style={{ maxHeight: 340 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                <th>Dispatcher</th><th>Team</th><th>Region</th>
                <th>Loads</th><th>Revenue</th><th>Gross Profit</th><th>Margin</th>
                {canEdit && <th style={{ width: 110 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map(d => (
                <tr key={d.id}>
                  <td><span className={`rank-badge ${rankCls(d.rank ?? 0)}`}>{d.rank}</span></td>
                  <td style={{ fontWeight: 500 }}>{d.name}</td>
                  <td><span className={`pill ${TEAM_CLS[d.team] ?? 'pill-blue'}`}>{d.team}</span></td>
                  <td style={{ color: 'var(--muted)' }}>{d.region}</td>
                  <td className="num">{d.loads ?? 0}</td>
                  <td className="num" style={{ color: 'var(--accent)' }}>{fmt(d.revenue ?? 0)}</td>
                  <td className="num">{fmt(d.profit ?? 0)}</td>
                  <td className="num">{d.margin ?? '0%'}</td>
                  {canEdit && (
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => openEdit(d)}>
                          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
                          Edit
                        </button>
                        <button className="btn btn-danger" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setConfirmId(d.id)}>
                          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                          Del
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Revenue & Profit — Top 8</div></div>
        {top8.length > 0 && <DispatchersBarChart labels={top8.map(d=>d.name.split(' ')[0])} revenues={top8.map(d=>d.revenue??0)} profits={top8.map(d=>d.profit??0)} />}
      </div>

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) close(); }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Dispatcher' : 'Add Dispatcher'}</span>
              <button className="modal-close" onClick={close}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" {...register('name')} placeholder="e.g. Sarah Mitchell" />
                  {errors.name && <span className="form-error">{errors.name.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Team</label>
                  <select className="form-select" {...register('team')}>
                    {TEAMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Region</label>
                  <select className="form-select" {...register('region')}>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMut.isPending || updateMut.isPending}>
                  {(createMut.isPending || updateMut.isPending) && <span className="spinner" style={{ width: 12, height: 12, borderTopColor: '#0d0f14' }} />}
                  {editing ? 'Save Changes' : 'Add Dispatcher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmId && (
        <div className="modal-backdrop">
          <div className="modal" style={{ width: 360 }}>
            <div className="modal-header">
              <span className="modal-title">Delete Dispatcher</span>
              <button className="modal-close" onClick={() => setConfirmId(null)}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Are you sure you want to delete this dispatcher? This action cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteMut.mutate(confirmId)} disabled={deleteMut.isPending}>
                {deleteMut.isPending && <span className="spinner" style={{ width: 12, height: 12 }} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
