import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { driversService } from '../services/statsService';
import { useAuthStore } from '../store/authStore';
import { DriversBarChart } from '../components/charts';
import { fmt, fmtN, rankCls } from '../utils/formatters';
import type { Driver } from '../types';

const TRUCK_TYPES = ['Flatbed', 'Tanker', 'Reefer', 'Box Truck', 'Semi-Truck'];
const STATUSES    = ['active', 'on_trip', 'rest', 'inactive'];
const STATUS_CLS: Record<string, string> = { active: 'pill-green', on_trip: 'pill-blue', rest: 'pill-warn', inactive: 'pill-red' };

const schema = z.object({
  name:       z.string().min(2, 'Name is required'),
  truck_type: z.string().min(1),
  terminal:   z.string().min(2, 'Terminal is required'),
  status:     z.enum(['active', 'on_trip', 'rest', 'inactive']),
  phone:      z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Drivers() {
  const qc = useQueryClient();
  const canEdit = useAuthStore(s => s.hasRole)('admin');

  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<Driver | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn:  () => driversService.getAll(),
  });
  const { data: metrics } = useQuery({
    queryKey: ['drivers', 'metrics'],
    queryFn:  () => driversService.getMetrics(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMut = useMutation({
    mutationFn: driversService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); toast.success('Driver added'); close(); },
    onError:   () => toast.error('Failed to add driver'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Driver> }) => driversService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); toast.success('Driver updated'); close(); },
    onError:   () => toast.error('Failed to update'),
  });
  const deleteMut = useMutation({
    mutationFn: driversService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); toast.success('Driver deleted'); setConfirmId(null); },
    onError:   () => toast.error('Failed to delete'),
  });

  function openCreate() { reset({ name: '', truck_type: 'Flatbed', terminal: '', status: 'active', phone: '' }); setEditing(null); setShowModal(true); }
  function openEdit(d: Driver) { reset({ name: d.name, truck_type: d.truck_type, terminal: d.terminal, status: d.status, phone: d.phone ?? '' }); setEditing(d); setShowModal(true); }
  function close() { setShowModal(false); setEditing(null); reset(); }
  function onSubmit(data: FormData) { editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data); }

  if (isLoading) return <div className="loading-row"><div className="spinner" /><span>Loading drivers…</span></div>;

  const items = drivers ?? [];
  const top8  = items.slice(0, 8);

  return (
    <>
      <div className="metric-row">
        <div className="metric-mini"><div className="metric-mini-label">Active Drivers</div><div className="metric-mini-value" style={{ color: 'var(--accent)' }}>{metrics?.active ?? '—'}</div></div>
        <div className="metric-mini"><div className="metric-mini-label">On Trip</div><div className="metric-mini-value">{metrics?.on_trip ?? '—'}</div></div>
        <div className="metric-mini"><div className="metric-mini-label">Avg Loads / Driver</div><div className="metric-mini-value">{metrics?.avg_loads_per_driver?.toFixed(1) ?? '—'}</div></div>
        <div className="metric-mini"><div className="metric-mini-label">Total</div><div className="metric-mini-value">{items.length}</div></div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header">
          <div><div className="card-title">Drivers Leaderboard</div><div className="card-subtitle">Sorted by revenue</div></div>
          {canEdit && (
            <button className="btn btn-primary" onClick={openCreate}>
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Driver
            </button>
          )}
        </div>
        <div className="table-scroll" style={{ maxHeight: 360 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                <th>Driver</th><th>Truck</th><th>Terminal</th><th>Status</th>
                <th>Loads</th><th>Revenue</th><th>Miles</th><th>Fuel</th><th>Rev/Mile</th>
                {canEdit && <th style={{ width: 110 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map(d => (
                <tr key={d.id}>
                  <td><span className={`rank-badge ${rankCls(d.rank ?? 0)}`}>{d.rank}</span></td>
                  <td style={{ fontWeight: 500 }}>{d.name}</td>
                  <td><span className="pill pill-blue">{d.truck_type}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: 11 }}>{d.terminal}</td>
                  <td><span className={`pill ${STATUS_CLS[d.status] ?? 'pill-blue'}`}>{d.status}</span></td>
                  <td className="num">{d.loads ?? 0}</td>
                  <td className="num" style={{ color: 'var(--accent)' }}>{fmt(d.revenue ?? 0)}</td>
                  <td className="num">{fmtN(d.miles ?? 0)}</td>
                  <td className="num" style={{ color: 'var(--warn)' }}>{fmt(d.fuel ?? 0)}</td>
                  <td className="num">{d.rpm ?? '—'}</td>
                  {canEdit && (
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => openEdit(d)}>
                          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
                          Edit
                        </button>
                        <button className="btn btn-danger" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setConfirmId(d.id)}>
                          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
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
        <div className="card-header"><div className="card-title">Revenue Distribution — Top 8</div></div>
        {top8.length > 0 && <DriversBarChart labels={top8.map(d=>d.name.split(' ')[0])} values={top8.map(d=>d.revenue??0)} />}
      </div>

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) close(); }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Driver' : 'Add Driver'}</span>
              <button className="modal-close" onClick={close}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" {...register('name')} placeholder="e.g. Marcus Johnson" />
                  {errors.name && <span className="form-error">{errors.name.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Truck Type</label>
                  <select className="form-select" {...register('truck_type')}>
                    {TRUCK_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" {...register('status')}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label className="form-label">Terminal</label>
                  <input className="form-input" {...register('terminal')} placeholder="e.g. Atlanta, GA" />
                  {errors.terminal && <span className="form-error">{errors.terminal.message}</span>}
                </div>
                <div className="form-group full">
                  <label className="form-label">Phone (optional)</label>
                  <input className="form-input" {...register('phone')} placeholder="e.g. (404) 555-0123" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMut.isPending || updateMut.isPending}>
                  {(createMut.isPending || updateMut.isPending) && <span className="spinner" style={{ width: 12, height: 12, borderTopColor: '#0d0f14' }} />}
                  {editing ? 'Save Changes' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {confirmId && (
        <div className="modal-backdrop">
          <div className="modal" style={{ width: 360 }}>
            <div className="modal-header">
              <span className="modal-title">Delete Driver</span>
              <button className="modal-close" onClick={() => setConfirmId(null)}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>This driver and all related data will be removed. Are you sure?</p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteMut.mutate(confirmId!)} disabled={deleteMut.isPending}>
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
