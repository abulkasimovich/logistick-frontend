import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { customersService } from '../services/statsService';
import { useAuthStore } from '../store/authStore';
import { CustomerDonut } from '../components/charts';
import { fmt, fmtN, rankCls } from '../utils/formatters';
import type { Customer } from '../types';

const schema = z.object({
  name:          z.string().min(2, 'Company name is required'),
  contact_email: z.string().email('Valid email required').optional().or(z.literal('')),
  phone:         z.string().optional(),
  address:       z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Customers() {
  const qc = useQueryClient();
  const canEdit = useAuthStore(s => s.hasRole)('admin');

  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<Customer | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn:  () => customersService.getAll(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMut = useMutation({
    mutationFn: customersService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer added'); close(); },
    onError:   () => toast.error('Failed to add customer'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) => customersService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer updated'); close(); },
    onError:   () => toast.error('Failed to update'),
  });
  const deleteMut = useMutation({
    mutationFn: customersService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer removed'); setConfirmId(null); },
    onError:   () => toast.error('Failed to remove'),
  });

  function openCreate() { reset({ name: '', contact_email: '', phone: '', address: '' }); setEditing(null); setShowModal(true); }
  function openEdit(c: Customer) { reset({ name: c.name, contact_email: c.contact_email ?? '', phone: c.phone ?? '', address: c.address ?? '' }); setEditing(c); setShowModal(true); }
  function close() { setShowModal(false); setEditing(null); reset(); }
  function onSubmit(data: FormData) { editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data); }

  if (isLoading) return <div className="loading-row"><div className="spinner" /><span>Loading customers…</span></div>;

  const items      = customers ?? [];
  const maxRev     = Math.max(...items.map(c => c.revenue ?? 0), 1);
  const totalRev   = items.reduce((s, c) => s + (c.revenue ?? 0), 0);
  const totalLoads = items.reduce((s, c) => s + (c.loads ?? 0), 0);

  return (
    <>
      <div className="metric-row">
        <div className="metric-mini"><div className="metric-mini-label">Total Customers</div><div className="metric-mini-value" style={{ color: 'var(--warn)' }}>{items.length}</div></div>
        <div className="metric-mini"><div className="metric-mini-label">Top Customer Rev</div><div className="metric-mini-value">{fmt(items[0]?.revenue ?? 0)}</div></div>
        <div className="metric-mini"><div className="metric-mini-label">Avg Rev / Customer</div><div className="metric-mini-value">{fmt(items.length ? totalRev / items.length : 0)}</div></div>
        <div className="metric-mini"><div className="metric-mini-label">Avg Loads</div><div className="metric-mini-value">{items.length ? Math.round(totalLoads / items.length) : 0}</div></div>
      </div>

      {/* Revenue progress + donut */}
      <div className="row-2" style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue by Customer</div>
            {canEdit && (
              <button className="btn btn-primary" onClick={openCreate}>
                <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Customer
              </button>
            )}
          </div>
          <div className="prog-row">
            {items.map(c => (
              <div className="prog-item" key={c.id}>
                <div className="prog-header">
                  <span className="prog-name">{c.name}</span>
                  <span className="prog-pct">{fmt(c.revenue ?? 0)}</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: `${((c.revenue ?? 0) / maxRev * 100).toFixed(1)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Load Distribution</div></div>
          {items.length > 0 && <CustomerDonut labels={items.map(c => c.name)} values={items.map(c => c.loads ?? 0)} />}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Customer Summary</div>
          {canEdit && (
            <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={openCreate}>
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add
            </button>
          )}
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                <th>Customer</th><th>Email</th><th>Loads</th><th>Revenue</th><th>Rev/Load</th><th>Share</th>
                {canEdit && <th style={{ width: 110 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((c, i) => (
                <tr key={c.id}>
                  <td><span className={`rank-badge ${rankCls(i + 1)}`}>{i + 1}</span></td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 11 }}>{c.contact_email ?? '—'}</td>
                  <td className="num">{fmtN(c.loads ?? 0)}</td>
                  <td className="num" style={{ color: 'var(--accent)' }}>{fmt(c.revenue ?? 0)}</td>
                  <td className="num">{(c.loads ?? 0) > 0 ? fmt((c.revenue ?? 0) / (c.loads ?? 1)) : '—'}</td>
                  <td className="num">{totalRev > 0 ? (((c.revenue ?? 0) / totalRev) * 100).toFixed(1) + '%' : '0%'}</td>
                  {canEdit && (
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => openEdit(c)}>
                          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
                          Edit
                        </button>
                        <button className="btn btn-danger" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setConfirmId(c.id)}>
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

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) close(); }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Customer' : 'Add Customer'}</span>
              <button className="modal-close" onClick={close}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Company Name</label>
                  <input className="form-input" {...register('name')} placeholder="e.g. Amazon Logistics" />
                  {errors.name && <span className="form-error">{errors.name.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input className="form-input" type="email" {...register('contact_email')} placeholder="ops@company.com" />
                  {errors.contact_email && <span className="form-error">{errors.contact_email.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" {...register('phone')} placeholder="(555) 000-0000" />
                </div>
                <div className="form-group full">
                  <label className="form-label">Address</label>
                  <input className="form-input" {...register('address')} placeholder="123 Main St, City, State" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMut.isPending || updateMut.isPending}>
                  {(createMut.isPending || updateMut.isPending) && <span className="spinner" style={{ width: 12, height: 12, borderTopColor: '#0d0f14' }} />}
                  {editing ? 'Save Changes' : 'Add Customer'}
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
              <span className="modal-title">Remove Customer</span>
              <button className="modal-close" onClick={() => setConfirmId(null)}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>This customer will be deactivated. Are you sure?</p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteMut.mutate(confirmId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending && <span className="spinner" style={{ width: 12, height: 12 }} />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
