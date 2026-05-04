import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { loadsService } from '../services/loadsService';
import { driversService, customersService } from '../services/statsService';
import { useDebounce } from '../hooks/useDebounce';
import { useAuthStore } from '../store/authStore';
import { fmt, fmtDate, rankCls } from '../utils/formatters';
import type { Load } from '../types';

const STATUS_LABELS: Record<string, string> = {
  delivered: 'pill-green', in_transit: 'pill-blue', booked: 'pill-warn', cancelled: 'pill-red',
};

const loadSchema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  truck_type: z.string().min(2),
  miles: z.coerce.number().min(1),
  revenue: z.coerce.number().min(1),
  fuel_cost: z.coerce.number().min(0),
  driver_pay: z.coerce.number().min(0),
  driver_id: z.string().optional(),
  customer_id: z.string().optional(),
  status: z.enum(['delivered', 'in_transit', 'booked', 'cancelled']),
});
type LoadForm = z.infer<typeof loadSchema>;

export default function Loads() {
  const qc = useQueryClient();
  const hasRole = useAuthStore(s => s.hasRole);
  const canEdit = hasRole('admin', 'dispatcher');

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Load | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['loads', { page, status, search: debouncedSearch }],
    queryFn: () => loadsService.getAll({ page, limit: 20, status: status || undefined, search: debouncedSearch || undefined }),
  });

  const { data: drivers } = useQuery({ queryKey: ['drivers'], queryFn: () => driversService.getAll() });
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: () => customersService.getAll() });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LoadForm>({
    resolver: zodResolver(loadSchema),
    defaultValues: { status: 'booked', miles: 0, revenue: 0, fuel_cost: 0, driver_pay: 0 },
  });

  const createMutation = useMutation({
    mutationFn: loadsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loads'] }); toast.success('Load created'); closeModal(); },
    onError: () => toast.error('Failed to create load'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Load> }) => loadsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loads'] }); toast.success('Load updated'); closeModal(); },
    onError: () => toast.error('Failed to update load'),
  });

  const deleteMutation = useMutation({
    mutationFn: loadsService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loads'] }); toast.success('Load deleted'); },
    onError: () => toast.error('Failed to delete load'),
  });

  function openCreate() { reset({ status: 'booked', miles: 0, revenue: 0, fuel_cost: 0, driver_pay: 0 }); setEditing(null); setShowModal(true); }
  function openEdit(load: Load) { reset(load as any); setEditing(load); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditing(null); reset(); }

  function onSubmit(data: LoadForm) {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  }

  const loads = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div className="search-box">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search load number…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="tab-group">
          {['', 'delivered', 'in_transit', 'booked', 'cancelled'].map(s => (
            <button key={s} className={`tab-btn${status === s ? ' active' : ''}`} onClick={() => { setStatus(s); setPage(1); }}>
              {s === '' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        {canEdit && (
          <button className="btn btn-primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Load
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-scroll" style={{ maxHeight: 'calc(100vh - 260px)' }}>
          {isLoading ? (
            <div className="loading-row"><div className="spinner" /><span>Loading loads…</span></div>
          ) : loads.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <p>No loads found</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Load #</th><th>Status</th><th>Origin</th><th>Destination</th>
                  <th>Driver</th><th>Customer</th><th>Miles</th><th>Revenue</th><th>Date</th>
                  {canEdit && <th />}
                </tr>
              </thead>
              <tbody>
                {loads.map(load => (
                  <tr key={load.id}>
                    <td><span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--accent)' }}>{load.load_number}</span></td>
                    <td><span className={`pill ${STATUS_LABELS[load.status] || ''}`}>{load.status.replace('_', ' ')}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{load.origin}</td>
                    <td style={{ color: 'var(--muted)' }}>{load.destination}</td>
                    <td style={{ fontWeight: 500 }}>{load.driver?.name ?? '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{load.customer?.name ?? '—'}</td>
                    <td className="num">{Number(load.miles).toLocaleString()}</td>
                    <td className="num" style={{ color: 'var(--accent)' }}>{fmt(Number(load.revenue))}</td>
                    <td style={{ color: 'var(--muted)' }}>{fmtDate(load.created_at)}</td>
                    {canEdit && (
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => openEdit(load)}>Edit</button>
                          <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => { if (confirm('Delete this load?')) deleteMutation.mutate(load.id); }}>Del</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {meta && (
          <div className="pagination">
            <span className="page-info">{meta.total} loads · page {meta.page} / {totalPages}</span>
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
            })}
            <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Load' : 'New Load'}</span>
              <button className="modal-close" onClick={closeModal}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Origin</label>
                  <input className="form-input" {...register('origin')} placeholder="Phoenix, AZ" />
                  {errors.origin && <span className="form-error">{errors.origin.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input className="form-input" {...register('destination')} placeholder="Chicago, IL" />
                  {errors.destination && <span className="form-error">{errors.destination.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Truck Type</label>
                  <select className="form-select" {...register('truck_type')}>
                    {['Flatbed', 'Tanker', 'Reefer', 'Box Truck', 'Semi-Truck'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" {...register('status')}>
                    <option value="booked">Booked</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Miles</label>
                  <input className="form-input" type="number" {...register('miles')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Revenue ($)</label>
                  <input className="form-input" type="number" {...register('revenue')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fuel Cost ($)</label>
                  <input className="form-input" type="number" {...register('fuel_cost')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Driver Pay ($)</label>
                  <input className="form-input" type="number" {...register('driver_pay')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Driver</label>
                  <select className="form-select" {...register('driver_id')}>
                    <option value="">— Select Driver —</option>
                    {(drivers ?? []).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Customer</label>
                  <select className="form-select" {...register('customer_id')}>
                    <option value="">— Select Customer —</option>
                    {(customers ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <span className="spinner" style={{ width: 12, height: 12, borderTopColor: '#0d0f14' }} />}
                  {editing ? 'Save Changes' : 'Create Load'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
