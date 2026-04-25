import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import {
  LayoutDashboard, Users,
  ArrowDownLeft, Landmark, LogOut, Plus, Send,
  TrendingUp, Users2, Receipt, Building, Settings, History, Download, Upload, Edit, XCircle, Printer, Eye, UserCheck, Trash2, Calendar, BarChart2, Menu, X,
  MessageSquare, LifeBuoy, Clock, FileText, Image, Camera
} from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
const exportTableToCSV = (filename: string, headers: string[], rows: (string|number)[][]) => {
  const escapeCSV = (str: string | number) => `"${String(str).replace(/"/g, '""')}"`;
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
const StaffManagement = ({ token, currentUserId, designations }: { token: string | null, currentUserId?: string, designations: string[] }) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', designation: designations[0] || 'Treasurer', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/staff', { headers: { Authorization: `Bearer ${token}` } });
      setStaff(res.data);
    } catch { }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (editingStaff) {
        await axios.patch(`/staff/${editingStaff.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/staff', form, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowForm(false); setEditingStaff(null);
      setForm({ name: '', email: '', mobile: '', designation: designations[0] || 'Treasurer', password: '' });
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving staff');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from office bearers?`)) return;
    try {
      await axios.delete(`/staff/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error removing staff');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.25rem' }}>Office Bearers & Staff</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Manage treasurers, secretaries, and committee members who can log in to this portal.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingStaff(null); setForm({ name: '', email: '', mobile: '', designation: 'Treasurer', password: '' }); setShowForm(true); }}>
          <Plus size={18} /> Add Office Bearer
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h4 style={{ marginBottom: '1rem' }}>{editingStaff ? 'Edit Office Bearer' : 'Add New Office Bearer'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Full Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ramesh Kumar" />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Designation *</label>
              <select value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}>
                {designations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Mobile</label>
              <input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="9876543210" />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>{editingStaff ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
            </div>
          </div>
          {error && <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.75rem' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : (editingStaff ? 'Update' : 'Add Office Bearer')}</button>
            <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingStaff(null); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: '25%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Email</th>
              <th>Mobile</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No office bearers added yet. Add your first treasurer or secretary.</td></tr>
            ) : staff.map((s: any) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.name}</strong>
                  {s.id === currentUserId && <span className="badge badge-success" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>You</span>}
                </td>
                <td><span className="badge badge-warning">{s.designation || '—'}</span></td>
                <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{s.email || '—'}</td>
                <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.mobile || '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Edit" onClick={() => { setEditingStaff(s); setForm({ name: s.name, email: s.email || '', mobile: s.mobile || '', designation: s.designation || 'Treasurer', password: '' }); setShowForm(true); }}>
                      <Edit size={15} />
                    </button>
                    {s.id !== currentUserId && (
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--error)' }} title="Remove" onClick={() => handleDelete(s.id, s.name)}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(59,130,246,0.08)', borderRadius: '0.75rem', border: '1px solid rgba(59,130,246,0.2)' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
          <strong style={{ color: 'var(--primary)' }}>💡 Login Info:</strong> Office bearers can log in at <code>gkrnagar.localhost:5173/login</code> using their email or mobile number and the password set here. They will have full Treasurer access to record payments and manage members.
        </p>
      </div>
    </div>
  );
};

const SERVICE_TYPES_DEFAULT = ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Security', 'Other'];

const VendorManagement = ({ token, vendors, onRefresh, serviceTypes }: { token: string | null, vendors: any[], onRefresh: () => void, serviceTypes: string[] }) => {
  const [vendorForm, setVendorForm] = useState({ name: '', serviceType: serviceTypes[0] || 'Plumbing', contact: '', email: '', address: '', notes: '' });
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorError, setVendorError] = useState('');

  const resetForm = () => setVendorForm({ name: '', serviceType: serviceTypes[0] || 'Plumbing', contact: '', email: '', address: '', notes: '' });

  const handleSave = async () => {
    setVendorError('');
    if (!vendorForm.name.trim()) { setVendorError('Vendor name is required'); return; }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingVendor) {
        await axios.patch(`/vendors/${editingVendor.id}`, vendorForm, { headers });
      } else {
        await axios.post('/vendors', vendorForm, { headers });
      }
      setShowVendorModal(false); setEditingVendor(null); resetForm(); onRefresh();
    } catch (err: any) { setVendorError(err.response?.data?.message || 'Error saving vendor'); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete vendor "${name}"? This may affect linked expenses.`)) return;
    try {
      await axios.delete(`/vendors/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      onRefresh();
    } catch (err: any) { alert(err.response?.data?.message || 'Error deleting vendor'); }
  };

  const exportVendors = () => {
    const headers = ['Name', 'Service Type', 'Mobile', 'Email', 'Status'];
    const rows = vendors.map((v: any) => [v.name, v.serviceType, v.mobile, v.email || '', v.status]);
    exportTableToCSV(`vendors_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.25rem' }}>Vendors & Service Providers</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{vendors.length} vendor{vendors.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={exportVendors}>
            <Download size={18} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={() => { setEditingVendor(null); resetForm(); setShowVendorModal(true); }}>
            <Plus size={18} /> Add Vendor
          </button>
        </div>
      </div>

      {showVendorModal && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h4 style={{ marginBottom: '1rem' }}>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Vendor / Company Name *</label>
              <input value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} placeholder="e.g. Ravi Electricals" />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Service Type *</label>
              <select value={vendorForm.serviceType} onChange={e => setVendorForm({ ...vendorForm, serviceType: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}>
                {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Phone / Mobile</label>
              <input value={vendorForm.contact} onChange={e => setVendorForm({ ...vendorForm, contact: e.target.value })} placeholder="9876543210" />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Email</label>
              <input type="email" value={vendorForm.email} onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })} placeholder="vendor@example.com" />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Address</label>
              <input value={vendorForm.address} onChange={e => setVendorForm({ ...vendorForm, address: e.target.value })} placeholder="Street, Area, City" />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Notes</label>
              <input value={vendorForm.notes} onChange={e => setVendorForm({ ...vendorForm, notes: e.target.value })} placeholder="Contract details, warranty, etc." />
            </div>
          </div>
          {vendorError && <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.75rem' }}>{vendorError}</div>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={handleSave}>{editingVendor ? 'Update Vendor' : 'Add Vendor'}</button>
            <button className="btn btn-secondary" onClick={() => { setShowVendorModal(false); setEditingVendor(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {vendors.length === 0 && !showVendorModal ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <Users2 size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>No vendors added yet. Add your plumbers, electricians, and other service providers.</p>
        </div>
      ) : (
        <div className="table-container">
          <table style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '22%' }} /><col style={{ width: '15%' }} /><col style={{ width: '13%' }} />
              <col style={{ width: '18%' }} /><col style={{ width: '20%' }} /><col style={{ width: '12%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Name</th><th>Service Type</th><th>Phone</th><th>Email</th><th>Notes</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v: any) => (
                <tr key={v.id}>
                  <td><strong>{v.name}</strong>{v.address && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{v.address}</div>}</td>
                  <td><span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{v.serviceType}</span></td>
                  <td style={{ fontSize: '0.875rem' }}>{v.contact || '—'}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{v.email || '—'}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{v.notes || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Edit" onClick={() => { setEditingVendor(v); setVendorForm({ name: v.name, serviceType: v.serviceType, contact: v.contact || '', email: v.email || '', address: v.address || '', notes: v.notes || '' }); setShowVendorModal(true); }}><Edit size={15} /></button>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--error)' }} title="Delete" onClick={() => handleDelete(v.id, v.name)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ExpenseManagement = ({
  token, expenses, vendors, expenseCategories, members, onRefresh
}: {
  token: string | null; expenses: any[]; vendors: any[]; expenseCategories: string[]; members: any[]; onRefresh: () => void;
}) => {
  const blankForm = { title: '', category: expenseCategories[0] || 'Maintenance', amount: 0, date: new Date().toISOString().split('T')[0], vendorId: '', notes: '', isRecurring: false, paidByMemberId: '', reimbursementType: 'OFFSET_DUES' };
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState('');

  const openAdd = () => { setEditingExpense(null); setForm({ ...blankForm, category: expenseCategories[0] || 'Maintenance' }); setError(''); setShowModal(true); };
  const openEdit = (e: any) => { setEditingExpense(e); setForm({ title: e.title, category: e.category, amount: e.amount, date: (e.date || '').split('T')[0] || new Date().toISOString().split('T')[0], vendorId: e.vendorId || '', notes: e.notes || '', isRecurring: !!e.isRecurring, paidByMemberId: e.paidByMemberId || '', reimbursementType: 'OFFSET_DUES' }); setError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingExpense(null); };

  const handleSave = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.amount || form.amount <= 0) { setError('Enter a valid amount'); return; }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingExpense) {
        await axios.patch(`/expenses/${editingExpense.id}`, form, { headers });
      } else {
        await axios.post('/expenses', form, { headers });
      }
      closeModal(); onRefresh();
    } catch (err: any) { setError(err.response?.data?.message || 'Error saving expense'); }
  };

  const exportExpenses = () => {
    const headers = ['Title', 'Category', 'Amount', 'Date', 'Vendor', 'Recurring', 'Paid By'];
    const rows = expenses.map((e: any) => [
      e.title, e.category, e.amount, new Date(e.date).toLocaleDateString(),
      e.vendor?.name || '', e.isRecurring ? 'Yes' : 'No', e.paidByMemberId ? 'Member' : 'Society'
    ]);
    exportTableToCSV(`expenses_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      onRefresh();
    } catch { alert('Error deleting expense'); }
  };

  const totalAmt = expenses.reduce((s, e) => s + e.amount, 0);
  const selectStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 0.875rem', backgroundColor: 'var(--bg-tertiary, #1a2035)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' };
  const labelStyle: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <>
      {/* Overlay Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '640px', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingExpense ? '✏️ Edit Expense' : '➕ New Expense'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}>×</button>
            </div>

            {/* Form Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Title */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Generator repair, Lift servicing" autoFocus />
              </div>
              {/* Category */}
              <div>
                <label style={labelStyle}>Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={selectStyle}>
                  {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Amount */}
              <div>
                <label style={labelStyle}>Amount (₹) *</label>
                <input type="number" min="0" step="1" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} placeholder="0" />
              </div>
              {/* Date */}
              <div>
                <label style={labelStyle}>Date *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              {/* Vendor */}
              <div>
                <label style={labelStyle}>Vendor (optional)</label>
                <select value={form.vendorId} onChange={e => setForm({ ...form, vendorId: e.target.value })} style={selectStyle}>
                  <option value="">— No Vendor —</option>
                  {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.serviceType})</option>)}
                </select>
              </div>
              
              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed var(--border-color)' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--primary)' }}>Paid By Member (Reimbursement Claim)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Select Member</label>
                    <select value={form.paidByMemberId} onChange={e => setForm({ ...form, paidByMemberId: e.target.value })} style={selectStyle} disabled={!!editingExpense}>
                      <option value="">— No (Paid by Society) —</option>
                      {members.map((m: any) => <option key={m.id} value={m.id}>{m.flatNo} - {m.name}</option>)}
                    </select>
                  </div>
                  {form.paidByMemberId && !editingExpense && (
                    <div>
                      <label style={labelStyle}>Reimbursement Method</label>
                      <select value={form.reimbursementType} onChange={e => setForm({ ...form, reimbursementType: e.target.value })} style={selectStyle}>
                        <option value="OFFSET_DUES">Offset Dues (Advance Paid-Until)</option>
                        <option value="CASH">Cash Refund (Deduct Society Cash)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Notes (optional)</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional details..." />
              </div>
            </div>

            {/* Recurring */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={form.isRecurring} onChange={e => setForm({ ...form, isRecurring: e.target.checked })} />
              <span>Mark as recurring expense (monthly)</span>
            </label>

            {error && <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.75rem', padding: '0.6rem', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '0.4rem' }}>{error}</div>}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1 }}>{editingExpense ? 'Update Expense' : 'Add Expense'}</button>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Page */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.25rem' }}>Expense Ledger</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {expenses.length} record{expenses.length !== 1 ? 's' : ''} · Total: <strong style={{ color: 'var(--error)' }}>₹{totalAmt.toLocaleString()}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={exportExpenses}>
              <Download size={18} /> Export Excel
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={18} /> Add Expense
            </button>
          </div>
        </div>

        <div className="table-container">
          <table style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '26%' }} /><col style={{ width: '14%' }} /><col style={{ width: '12%' }} />
              <col style={{ width: '13%' }} /><col style={{ width: '20%' }} /><col style={{ width: '15%' }} />
            </colgroup>
            <thead>
              <tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Vendor</th><th style={{ textAlign: 'right' }}>Action</th></tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>No expenses recorded yet. Click "Add Expense" to get started.</td></tr>
              ) : expenses.map((e: any) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.title}</strong>
                    {e.isRecurring && <span className="badge badge-success" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Recurring</span>}
                    {e.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{e.notes}</div>}
                  </td>
                  <td><span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{e.category}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--error)' }}>₹{Number(e.amount).toLocaleString()}</td>
                  <td style={{ fontSize: '0.875rem' }}>{new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{e.vendor?.name || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Edit" onClick={() => openEdit(e)}><Edit size={15} /></button>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--error)' }} title="Delete" onClick={() => handleDelete(e.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const MASTER_CATEGORIES = [
  { key: 'SERVICE_TYPE', label: 'Vendor Service Types', description: 'Types of services vendors can provide (e.g. Plumbing, Electrical)' },
  { key: 'DESIGNATION', label: 'Staff Designations', description: 'Titles for office bearers (e.g. Treasurer, Secretary)' },
  { key: 'EXPENSE_CATEGORY', label: 'Expense Categories', description: 'Categories for classifying expenses (e.g. Repairs, Utilities)' },
];

const MastersManagement = ({ token, onRefresh }: { token: string | null, onRefresh: () => void }) => {
  const [activeCategory, setActiveCategory] = useState('SERVICE_TYPE');
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [error, setError] = useState('');

  const fetchItems = async (category: string) => {
    setLoadingItems(true); setError('');
    try {
      const res = await axios.get(`/master-data/${category}`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(res.data);
    } catch { setError('Failed to load items'); }
    finally { setLoadingItems(false); }
  };

  useEffect(() => { fetchItems(activeCategory); }, [activeCategory]);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    setError('');
    try {
      await axios.post(`/master-data/${activeCategory}`, { value: newValue.trim() }, { headers: { Authorization: `Bearer ${token}` } });
      setNewValue(''); fetchItems(activeCategory); onRefresh();
    } catch (err: any) { setError(err.response?.data?.message || 'Error adding item'); }
  };

  const handleUpdate = async (id: string) => {
    if (!editingValue.trim()) return;
    setError('');
    try {
      await axios.patch(`/master-data/${id}`, { value: editingValue.trim() }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingId(null); fetchItems(activeCategory); onRefresh();
    } catch (err: any) { setError(err.response?.data?.message || 'Error updating item'); }
  };

  const handleDelete = async (id: string, value: string) => {
    if (!confirm(`Remove "${value}" from the list?`)) return;
    try {
      await axios.delete(`/master-data/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchItems(activeCategory); onRefresh();
    } catch (err: any) { setError(err.response?.data?.message || 'Error deleting item'); }
  };

  const activeCat = MASTER_CATEGORIES.find(c => c.key === activeCategory)!;

  return (
    <div className="card">
      <h3 style={{ marginBottom: '0.5rem' }}>Data Masters</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Manage the dropdown values used across the system.
      </p>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
        {MASTER_CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setEditingId(null); setNewValue(''); setError(''); }}
            style={{
              padding: '0.6rem 1.1rem', border: 'none', borderRadius: '0.5rem 0.5rem 0 0', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem',
              backgroundColor: activeCategory === cat.key ? 'var(--primary)' : 'transparent',
              color: activeCategory === cat.key ? '#fff' : 'var(--text-secondary)',
              borderBottom: activeCategory === cat.key ? '2px solid var(--primary)' : 'none',
            }}>
            {cat.label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{activeCat.description}</p>

      {/* Add new item */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <input value={newValue} onChange={e => setNewValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={`Add new ${activeCat.label.toLowerCase().replace('vendor ', '').replace(' types', ' type').replace(' categories', ' category').replace('staff ', '')}...`}
          style={{ flex: 1 }} />
        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={handleAdd}>
          <Plus size={16} /> Add
        </button>
      </div>

      {error && <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</div>}

      {/* Items list */}
      {loadingItems ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.875rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              {editingId === item.id ? (
                <>
                  <input value={editingValue} onChange={e => setEditingValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleUpdate(item.id); if (e.key === 'Escape') setEditingId(null); }}
                    style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.875rem' }} autoFocus />
                  <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleUpdate(item.id)}>Save</button>
                  <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{item.value}</span>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }} title="Edit"
                    onClick={() => { setEditingId(item.id); setEditingValue(item.value); }}>
                    <Edit size={14} />
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', color: 'var(--error)' }} title="Remove"
                    onClick={() => handleDelete(item.id, item.value)}>
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
          {items.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No items yet. Add your first one above.</p>}
        </div>
      )}
    </div>
  );
};

const Helpdesk = ({ token }: { token: string | null }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, OPEN, RESOLVED, CLOSED, ARCHIVED

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/tickets${filter !== 'ALL' ? `?status=${filter}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filter]);

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      await axios.patch(`/tickets/${ticketId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedTicket?.id === ticketId) {
        const res = await axios.get(`/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSelectedTicket(res.data);
      }
      fetchTickets();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to permanently delete this ticket and all its discussions?")) return;
    try {
      await axios.delete(`/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      alert("Error deleting ticket");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await axios.post(`/tickets/${selectedTicket.id}/comments`, { content: comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTicket({
        ...selectedTicket,
        comments: [...(selectedTicket.comments || []), res.data]
      });
      setComment('');
    } catch (err) {
      alert("Error adding comment");
    }
  };

  const selectTicket = async (id: string) => {
    try {
      const res = await axios.get(`/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTicket(res.data);
    } catch (err) {
      alert("Error loading ticket details");
    }
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#6366f1';
      default: return '#10b981';
    }
  };

  const getStatusBadge = (s: string) => {
    switch(s) {
      case 'OPEN': return <span className="badge badge-error">Open</span>;
      case 'IN_PROGRESS': return <span className="badge" style={{ backgroundColor: '#f59e0b', color: '#fff' }}>In Progress</span>;
      case 'RESOLVED': return <span className="badge badge-success">Resolved</span>;
      case 'CLOSED': return <span className="badge" style={{ backgroundColor: 'var(--text-secondary)', color: '#fff' }}>Closed</span>;
      case 'ARCHIVED': return <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Archived</span>;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '350px 1fr' : '1fr', gap: '1.5rem', height: 'calc(100vh - 200px)', minHeight: '600px' }}>
      {/* Ticket List Panel */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LifeBuoy size={20} /> Helpdesk
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tickets.length} Tickets</div>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <MessageSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
              <p>No tickets found</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div 
                key={t.id} 
                onClick={() => selectTicket(t.id)}
                style={{ 
                  padding: '1rem 1.25rem', 
                  borderBottom: '1px solid var(--border-color)', 
                  cursor: 'pointer',
                  backgroundColor: selectedTicket?.id === t.id ? 'var(--bg-tertiary)' : 'transparent',
                  borderLeft: `4px solid ${selectedTicket?.id === t.id ? 'var(--primary)' : 'transparent'}`,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: getPriorityColor(t.priority), textTransform: 'uppercase' }}>{t.priority}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.925rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Flat {t.member?.flatNo} • {t.member?.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {getStatusBadge(t.status)}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MessageSquare size={12} /> {t._count?.comments || 0}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Thread Panel */}
      {selectedTicket ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedTicket.subject}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>Raised by: <strong>{selectedTicket.member?.name} (Flat {selectedTicket.member?.flatNo})</strong></span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                value={selectedTicket.status} 
                onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--error)' }} title="Delete Ticket" onClick={() => handleDeleteTicket(selectedTicket.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Description Area */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{selectedTicket.description}</div>
          </div>

          {/* Comments Thread */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
            {(selectedTicket.comments || []).length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No discussions yet. Start the conversation below.</div>
            ) : (
              selectedTicket.comments.map((c: any) => {
                const isAdmin = !!c.userId;
                return (
                  <div key={c.id} style={{ 
                    alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAdmin ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <strong>{isAdmin ? c.user?.name : c.member?.name}</strong>
                      {isAdmin && <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Admin</span>}
                      <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ 
                      padding: '0.75rem 1rem', 
                      borderRadius: '1rem', 
                      borderTopRightRadius: isAdmin ? '0' : '1rem',
                      borderTopLeftRadius: isAdmin ? '1rem' : '0',
                      backgroundColor: isAdmin ? 'var(--primary)' : 'var(--card-bg)',
                      color: isAdmin ? '#fff' : 'var(--text-primary)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      fontSize: '0.9rem',
                      lineHeight: '1.5'
                    }}>
                      {c.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Box */}
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.75rem' }}>
              <input 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                placeholder="Type your response here..." 
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!comment.trim()}>
                <Send size={18} /> Reply
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ textAlign: 'center' }}>
            <LifeBuoy size={60} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h3>Select a ticket to view conversation</h3>
            <p style={{ fontSize: '0.875rem' }}>Manage society concerns and member requests from this portal.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const TenantAdminDashboard = () => {
  const { logout, token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({ totalIncome: 0, totalExpenses: 0, totalOutstanding: 0, netBalance: 0, totalCashInHand: 0, thisMonthIncome: 0, thisMonthExpenses: 0, thisMonthNet: 0, lastMonthIncome: 0, lastMonthExpenses: 0, totalMembers: 0, membersWithDues: 0, maintenanceAmount: 0, monthlyTrends: [], expenseByCategory: [], recentPayments: [] });
  const [financials, setFinancials] = useState<any>({});
  const [reportFilters, setReportFilters] = useState({ month: '', year: new Date().getFullYear().toString(), startDate: '', endDate: '' });
  const [members, setMembers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [cashBalances, setCashBalances] = useState<any[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ 
    name: '', email: '', mobile: '', flatNo: '', address: '', 
    outstandingDues: 0, password: '', enableLogin: false, 
    defaultTenure: 'MONTHLY', paidUntil: '',
    initialPaymentAmount: 0, initialPaymentMode: 'CASH', initialPaymentNotes: '',
    photoUrl: '', idProofUrl: ''
  });
  const [editingMember, setEditingMember] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{url: string, type: string} | null>(null);

  const handleFileUpload = async (file: File, type: 'photo' | 'idProof') => {
    setUploading(true);
    const formData = new FormData();
    formData.append(type, file);

    try {
      const res = await axios.post('/upload/member-docs', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      
      const url = res.data[type === 'photo' ? 'photoUrl' : 'idProofUrl'];
      
      if (showModal === 'member') {
        setNewMember((prev: any) => ({ 
          ...prev, 
          [type === 'photo' ? 'photoUrl' : 'idProofUrl']: url 
        }));
      } else if (editingMember) {
        setEditingMember((prev: any) => ({ 
          ...prev, 
          [type === 'photo' ? 'photoUrl' : 'idProofUrl']: url 
        }));
      }
      alert(`${type === 'photo' ? 'Photo' : 'ID Proof'} uploaded successfully!`);
    } catch (err) {
      console.error('Upload error', err);
      alert('Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  const DocumentViewer = ({ url, type, onClose }: { url: string, type: string, onClose: () => void }) => (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '2rem' }} onClick={onClose}>
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '-2.5rem', right: '-0.5rem', background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
        {url.toLowerCase().endsWith('.pdf') ? (
          <iframe src={url} style={{ width: '80vw', height: '80vh', border: 'none', borderRadius: '0.5rem' }} title="Document Viewer" />
        ) : (
          <img src={url} alt={type} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '0.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
        )}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <a href={url} target="_blank" rel="noreferrer" className="btn btn-primary">Open in New Tab</a>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
  const [newPayment, setNewPayment] = useState({ memberId: '', amount: 0, mode: 'CASH', notes: '', paidMonths: 1, periodLabel: 'Monthly', coverageStartDate: '', coverageEndDate: '' });
  const [upcomingMembers, setUpcomingMembers] = useState([]);
  const [newTransfer, setNewTransfer] = useState({ toAdminId: '', amount: 0, type: 'HANDOVER', referenceNote: '' });
  const [auditLogs, setAuditLogs] = useState([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>(SERVICE_TYPES_DEFAULT);
  const [designations, setDesignations] = useState<string[]>(['President', 'Secretary', 'Treasurer', 'Committee Member']);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(['Maintenance', 'Repairs', 'Utilities', 'Other']);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchFinancials = async () => {
    try {
      let url = '/reports/financials?';
      if (reportFilters.startDate && reportFilters.endDate) {
        url += `startDate=${reportFilters.startDate}&endDate=${reportFilters.endDate}`;
      } else if (reportFilters.month && reportFilters.year) {
        // Calculate start and end date of the month
        const start = new Date(parseInt(reportFilters.year), parseInt(reportFilters.month) - 1, 1).toISOString();
        const end = new Date(parseInt(reportFilters.year), parseInt(reportFilters.month), 0, 23, 59, 59).toISOString();
        url += `startDate=${start}&endDate=${end}`;
      } else if (reportFilters.year) {
        const start = new Date(parseInt(reportFilters.year), 0, 1).toISOString();
        const end = new Date(parseInt(reportFilters.year), 11, 31, 23, 59, 59).toISOString();
        url += `startDate=${start}&endDate=${end}`;
      }
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setFinancials(res.data);
    } catch (err) {
      console.error("Error fetching financials", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [membersRes, paymentsRes, cashRes, pendingRes, summaryRes, vendorsRes, logsRes, expensesRes, stRes, desRes, ecRes, upcomingRes, finRes] = await Promise.all([
        axios.get('/members', { headers }),
        axios.get('/payments/history', { headers }),
        axios.get('/cash/in-hand', { headers }),
        axios.get('/cash/pending', { headers }),
        axios.get('/reports/summary', { headers }),
        axios.get('/vendors', { headers }),
        axios.get('/tenants/logs', { headers }),
        axios.get('/expenses', { headers }),
        axios.get('/master-data/SERVICE_TYPE', { headers }),
        axios.get('/master-data/DESIGNATION', { headers }),
        axios.get('/master-data/EXPENSE_CATEGORY', { headers }),
        axios.get('/payments/upcoming', { headers }),
        axios.get('/reports/financials', { headers }),
      ]);
      setMembers(membersRes.data);
      setPayments(paymentsRes.data);
      setCashBalances(cashRes.data);
      setPendingTransfers(pendingRes.data);
      setSummary(summaryRes.data);
      setFinancials(finRes.data);
      setVendors(vendorsRes.data);
      setAuditLogs(logsRes.data);
      setExpenses(expensesRes.data);
      setServiceTypes(stRes.data.map((x: any) => x.value));
      setDesignations(desRes.data.map((x: any) => x.value));
      setExpenseCategories(ecRes.data.map((x: any) => x.value));
      setUpcomingMembers(upcomingRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/cash/transfer', newTransfer, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(null);
      setNewTransfer({ toAdminId: '', amount: 0, type: 'HANDOVER', referenceNote: '' });
      fetchData();
      alert('Transfer initiated successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error initiating transfer');
    }
  };

  const getPricing = (months: number) => {
    if (months === 3 && summary.quarterlyAmount) return summary.quarterlyAmount;
    if (months === 6 && summary.halfYearlyAmount) return summary.halfYearlyAmount;
    if (months === 12 && summary.annualAmount) return summary.annualAmount;
    return (summary.maintenanceAmount || 0) * months;
  };

  const handleApproveTransfer = async (id: string) => {
    try {
      await axios.post(`/cash/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      alert('Transfer approved and balance updated');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error approving transfer');
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/payments', newPayment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(null);
      setNewPayment({ memberId: '', amount: 0, mode: 'CASH', notes: '', paidMonths: 1, periodLabel: 'Monthly', coverageStartDate: '', coverageEndDate: '' });
      fetchData();
      alert('Payment recorded successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error recording payment');
    }
  };

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/members', newMember, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(null);
      setNewMember({ 
        name: '', email: '', mobile: '', flatNo: '', address: '', 
        outstandingDues: 0, password: '', enableLogin: false, 
        defaultTenure: 'MONTHLY', paidUntil: '', 
        initialPaymentAmount: 0, initialPaymentMode: 'CASH', initialPaymentNotes: '',
        photoUrl: '', idProofUrl: '' 
      });
      fetchData();
      alert('Member added successfully');
    } catch (err) {
      alert('Error adding member');
    }
  };
  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(`/members/${editingMember.id}`, editingMember, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(null);
      setEditingMember(null);
      fetchData();
      alert('Member updated successfully');
    } catch (err) {
      alert('Error updating member');
    }
  };

  const handleEditClick = (m: any) => {
    setEditingMember({ 
      ...m, 
      password: '', 
      enableLogin: !!m.userId,
      paidUntil: m.paidUntil ? new Date(m.paidUntil).toISOString().split('T')[0] : '',
      photoUrl: m.photoUrl || '',
      idProofUrl: m.idProofUrl || ''
    });
    setShowModal('edit-member');
  };

  const handleVacantMember = async (id: string, name: string, flatNo: string) => {
    if (!window.confirm(`Are you sure you want to mark Flat ${flatNo} (${name}) as VACANT?\nThis will revoke their login access and pause future dues. You can add a new occupant to this flat later.`)) return;
    try {
      await axios.patch(`/members/${id}/vacant`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      alert('Flat marked as vacant successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error marking vacant');
    }
  };


  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const handleCancelPayment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this payment? This will revert the cash balance and member dues.')) return;
    try {
      await axios.patch(`/payments/${id}`, { status: 'CANCELLED' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      alert('Payment cancelled successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error cancelling payment');
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim());

      const members = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const member: any = {};
        headers.forEach((header, index) => {
          member[header] = values[index];
        });
        return member;
      });

      try {
        await axios.post('/members/bulk', { members }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
        alert('Bulk import successful');
      } catch (err) {
        alert('Error during bulk import. Check CSV format.');
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = ['name', 'email', 'mobile', 'flatNo', 'outstandingDues', 'address'];
    const rows = [
      ['John Doe', 'john@example.com', '9876543210', 'A-101', '500', 'GKR Nagar'],
      ['Jane Smith', 'jane@example.com', '9876543211', 'B-202', '0', 'GKR Nagar']
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member_import_template.csv';
    a.click();
  };

  const exportFinancialsAsCSV = () => {
    if (!financials) return;
    
    let csvContent = "Category,Type,Amount\n";
    
    // Income
    (financials.profitAndLoss?.income || []).forEach((i: any) => {
      csvContent += `"${i.category}","Income","${i.amount}"\n`;
    });
    csvContent += `"Total Income","","${financials.profitAndLoss?.totalIncome || 0}"\n\n`;
    
    // Expenses
    (financials.profitAndLoss?.expenses || []).forEach((e: any) => {
      csvContent += `"${e.category}","Expense","${e.amount}"\n`;
    });
    csvContent += `"Total Expenses","","${financials.profitAndLoss?.totalExpenses || 0}"\n\n`;
    csvContent += `"Net Profit","","${financials.profitAndLoss?.netProfit || 0}"\n\n`;
    
    // Balance Sheet
    csvContent += "Balance Sheet Item,,Amount\n";
    csvContent += `"Cash in Hand",,"${financials.balanceSheet?.assets?.cashInHand || 0}"\n`;
    csvContent += `"Bank Balance",,"${financials.balanceSheet?.assets?.bankBalance || 0}"\n`;
    csvContent += `"Dues Receivable",,"${financials.balanceSheet?.assets?.duesReceivable || 0}"\n`;
    csvContent += `"Corpus Funds (Liabilities)",,"${financials.balanceSheet?.liabilities?.corpusFunds || 0}"\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const myBalance = user?.id ? (cashBalances.find((b: any) => b.userId === user.id)?.balance || 0) : 0;

  const exportMembers = () => {
    const headers = ['Name', 'Flat No', 'Email', 'Mobile', 'Status', 'Outstanding Dues'];
    const rows = members.map((m: any) => [m.name, m.flatNo, m.email, m.mobile, m.status, m.outstandingDues]);
    exportTableToCSV(`members_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const exportPayments = () => {
    const headers = ['Receipt No', 'Member Name', 'Flat No', 'Amount', 'Mode', 'Date', 'Period', 'Status'];
    const rows = payments.map((p: any) => [
      p.receiptNumber, p.member?.name || '', p.member?.flatNo || '', p.amount, 
      p.mode, new Date(p.paymentDate).toLocaleDateString(), p.periodLabel || '', p.status
    ]);
    exportTableToCSV(`payments_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Building size={48} className="animate-pulse" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': {
        const totalCashInHand = summary.totalCashInHand || 0;
        const netBalance = summary.netBalance || 0;
        const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];
        const pct = (curr: number, prev: number) => prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);
        const thisMonthIncomePct = pct(summary.thisMonthIncome || 0, summary.lastMonthIncome || 0);
        const thisMonthExpensePct = pct(summary.thisMonthExpenses || 0, summary.lastMonthExpenses || 0);

        const KpiCard = ({ title, value, subtitle, color, trend, icon: Icon }: any) => (
          <div className="card stat-card" style={{ borderLeft: `4px solid ${color}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-title">{title}</div>
                <div className="stat-value" style={{ color }}>{value}</div>
                {subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{subtitle}</div>}
              </div>
              <div style={{ backgroundColor: `${color}22`, borderRadius: '0.75rem', padding: '0.6rem' }}>
                <Icon size={22} style={{ color }} />
              </div>
            </div>
            {trend !== null && trend !== undefined && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}>
                {trend >= 0
                  ? <TrendingUp size={13} style={{ color: '#10b981' }} />
                  : <TrendingUp size={13} style={{ color: '#ef4444', transform: 'scaleY(-1)' }} />}
                <span style={{ color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{Math.abs(trend)}%</span>
                <span style={{ color: 'var(--text-secondary)' }}>vs last month</span>
              </div>
            )}
          </div>
        );

        return (
          <>
            {/* ─── Row 1: KPI Cards ─────────────────────── */}
            <div className="stat-grid">
              <KpiCard title="Total Collection" value={`₹${(summary.totalIncome || 0).toLocaleString()}`}
                subtitle={`This month: ₹${(summary.thisMonthIncome || 0).toLocaleString()}`}
                color="#10b981" trend={thisMonthIncomePct} icon={TrendingUp} />
              <KpiCard title="Total Expenses" value={`₹${(summary.totalExpenses || 0).toLocaleString()}`}
                subtitle={`This month: ₹${(summary.thisMonthExpenses || 0).toLocaleString()}`}
                color="#ef4444" trend={thisMonthExpensePct !== null ? -thisMonthExpensePct! : null} icon={Receipt} />
              <KpiCard title="Net Balance" value={`₹${netBalance.toLocaleString()}`}
                subtitle={`Collection – Expenses`}
                color={netBalance >= 0 ? '#6366f1' : '#f59e0b'} trend={null} icon={Building} />
              <KpiCard title="Cash In Hand" value={`₹${totalCashInHand.toLocaleString()}`}
                subtitle={`Your share: ₹${myBalance.toLocaleString()}`}
                color="#f59e0b" trend={null} icon={Users2} />
            </div>

            {/* ─── Row 2: Reconciliation Strip ─────────── */}
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <h4 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
                Financial Reconciliation
              </h4>
              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                {[
                  { label: 'Total Collected', val: summary.totalIncome || 0, color: '#10b981' },
                  { label: 'Total Expenses', val: summary.totalExpenses || 0, color: '#ef4444' },
                  { label: 'Net Balance', val: netBalance, color: netBalance >= 0 ? '#6366f1' : '#f59e0b' },
                  { label: 'Cash In Hand', val: totalCashInHand, color: '#f59e0b' },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${item.color}44`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', color: item.color }}>₹{item.val.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              {/* Outstanding dues alert */}
              {(summary.totalOutstanding || 0) > 0 && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: '0.75rem', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#f59e0b' }}>
                    ⚠️ <strong>{summary.membersWithDues || 0} member{(summary.membersWithDues || 0) !== 1 ? 's' : ''}</strong> have outstanding dues of <strong>₹{(summary.totalOutstanding || 0).toLocaleString()}</strong>
                  </span>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => setActiveTab('members')}>
                    View Members →
                  </button>
                </div>
              )}
            </div>

            {/* ─── Row 3: Charts ───────────────────────── */}
            <div className="responsive-grid-dashboard responsive-grid">
              {/* 6-month trend */}
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>6-Month Income vs Expense Trend</h3>
                <div style={{ height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summary.monthlyTrends || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                      <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                      <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '0.5rem' }}
                        formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, '']} />
                      <Legend iconType="circle" iconSize={8} />
                      <Line type="monotone" dataKey="income" name="Collection" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="net" name="Net" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Expense by category pie */}
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Expenses by Category</h3>
                {(summary.expenseByCategory || []).length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0', fontSize: '0.875rem' }}>No expenses recorded yet</div>
                ) : (
                  <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={summary.expenseByCategory || []} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                          {(summary.expenseByCategory || []).map((_: any, index: number) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }}
                          formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, '']} />
                        <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Row 4: Recent Activity + Cash Holders ── */}
            <div className="responsive-grid-dashboard responsive-grid">
              {/* Recent payments */}
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Recent Collections</h3>
                {(summary.recentPayments || []).length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No payments recorded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {(summary.recentPayments || []).map((p: any) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.875rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.memberName}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>Flat {p.flatNo}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#10b981' }}>₹{Number(p.amount).toLocaleString()}</div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                            {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {p.mode}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Cash in hand per admin */}
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Cash In Hand — Holders</h3>
                {cashBalances.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No cash balance data available.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {cashBalances.map((admin: any) => (
                      <div key={admin.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0.875rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', border: admin.userId === user?.id ? '1px solid var(--primary)' : '1px solid transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                            {admin.userName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{admin.userName}</div>
                            {admin.userId === user?.id && <div style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>You</div>}
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f59e0b' }}>₹{admin.balance.toLocaleString()}</div>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total</span>
                      <span style={{ fontWeight: 700, color: '#f59e0b' }}>₹{totalCashInHand.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        );
      }
      case 'helpdesk':
        return <Helpdesk token={token} />;
      case 'members':
        return (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h3>Society Members</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={exportMembers} title="Export to CSV">
                  <Download size={18} /> Export Excel
                </button>
                <button className="btn btn-secondary" onClick={downloadTemplate} title="Download CSV Template">
                  <Download size={18} /> Template
                </button>
                <div style={{ position: 'relative' }}>
                  <button className="btn btn-secondary" onClick={() => document.getElementById('bulk-import')?.click()}>
                    <Upload size={18} /> Bulk Import
                  </button>
                  <input
                    id="bulk-import"
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={handleBulkUpload}
                  />
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal('member')}><Plus size={18} /> Add Member</button>
              </div>
            </div>
            <div className="table-container">
              <table style={{ tableLayout: 'fixed', width: '100%' }}>
                <colgroup>
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '22%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Flat No</th>
                    <th>Contact Info</th>
                    <th>Dues</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m: any) => (
                    <tr key={m.id}>
                      <td><strong>{m.name}</strong></td>
                      <td><code style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>{m.flatNo}</code></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                          {m.email}
                          {m.photoUrl && <Image size={14} style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setSelectedDoc({url: m.photoUrl, type: 'Profile Photo'})} />}
                          {m.idProofUrl && <FileText size={14} style={{ color: 'var(--success)', cursor: 'pointer' }} onClick={() => setSelectedDoc({url: m.idProofUrl, type: 'ID Proof'})} />}
                        </div>
                        {m.mobile}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: m.outstandingDues > 0 ? 'var(--error)' : 'var(--success)' }}>
                          ₹{m.outstandingDues?.toLocaleString()}
                        </span>
                      </td>
                      <td><span className={`badge ${m.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}>{m.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            onClick={() => { setSelectedMember(m); setShowModal('member-history'); }}
                            title="View Payment History"
                          >
                            <Eye size={14} /> History
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '0.5rem' }} onClick={() => handleEditClick(m)} title="Edit Member">
                            <Edit size={16} />
                          </button>
                          {m.status !== 'VACANT' && (
                            <button className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '0.5rem', color: 'var(--error)' }} onClick={() => handleVacantMember(m.id, m.name, m.flatNo)} title="Mark Flat as Vacant">
                              <LogOut size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>Payment History</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={exportPayments}>
                  <Download size={18} /> Export Excel
                </button>
                <button className="btn btn-primary" onClick={() => setShowModal('payment')}>
                  <Plus size={18} /> Record Payment
                </button>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Member</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: any) => (
                    <tr key={p.id}>
                      <td><code style={{ fontSize: '0.8125rem' }}>{p.receiptNumber}</code></td>
                      <td><strong>{p.member?.name}</strong></td>
                      <td style={{ fontWeight: 600 }}>₹{p.amount.toLocaleString()}</td>
                      <td><span className={`badge ${p.mode === 'CASH' ? 'badge-warning' : 'badge-success'}`}>{p.mode}</span></td>
                      <td style={{ fontSize: '0.8125rem' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${p.status === 'PAID' ? 'badge-success' : 'badge-error'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => { setSelectedPayment(p); setShowModal('receipt'); }} title="View Receipt">
                            <Eye size={16} />
                          </button>
                          {p.status !== 'CANCELLED' && (
                            <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--error)' }} onClick={() => handleCancelPayment(p.id)} title="Cancel Payment">
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'expenses':
        return <ExpenseManagement token={token} expenses={expenses} vendors={vendors} expenseCategories={expenseCategories} members={members} onRefresh={fetchData} />;
      case 'reports': {
        const incomeItems = financials?.profitAndLoss?.income || [];
        const expenseItems = financials?.profitAndLoss?.expenses || [];
        const totalIncome = financials?.profitAndLoss?.totalIncome || 0;
        const totalExpenses = financials?.profitAndLoss?.totalExpenses || 0;
        const netProfit = financials?.profitAndLoss?.netProfit || 0;
        const pnlTotal = Math.max(totalIncome, totalExpenses);

        const dateRangeStr = (reportFilters.startDate && reportFilters.endDate)
          ? `${new Date(reportFilters.startDate).toLocaleDateString('en-GB')} to ${new Date(reportFilters.endDate).toLocaleDateString('en-GB')}`
          : (reportFilters.month && reportFilters.year)
          ? `${new Date(parseInt(reportFilters.year), parseInt(reportFilters.month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`
          : reportFilters.year ? `1-Jan-${reportFilters.year} to 31-Dec-${reportFilters.year}` : `1-Apr-${new Date().getFullYear()-1} to 31-Mar-${new Date().getFullYear()}`;

        const asAtDate = reportFilters.endDate ? new Date(reportFilters.endDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

        const bsLiabilities = [
          { label: 'Capital / Corpus Funds', amount: financials?.balanceSheet?.liabilities?.corpusFunds || 0 }
        ];
        const bsAssets = [
          { label: 'Cash-in-hand', amount: financials?.balanceSheet?.assets?.cashInHand || 0 },
          { label: 'Bank Accounts', amount: financials?.balanceSheet?.assets?.bankBalance || 0 },
          { label: 'Dues Receivable', amount: financials?.balanceSheet?.assets?.duesReceivable || 0 }
        ];

        let pnlLiabilityAmount = 0;
        let pnlAssetAmount = 0;

        if (netProfit > 0) {
          pnlLiabilityAmount = netProfit;
        } else if (netProfit < 0) {
          pnlAssetAmount = Math.abs(netProfit);
        }
        
        const totalLiabs = bsLiabilities.reduce((s, x) => s + x.amount, 0) + pnlLiabilityAmount;
        const totalAssets = bsAssets.reduce((s, x) => s + x.amount, 0) + pnlAssetAmount;
        const bsTotal = Math.max(totalLiabs, totalAssets);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0 }}>Financial Reports</h3>
                <button className="btn btn-secondary" onClick={exportFinancialsAsCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={16} /> Export as Excel
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Month</label>
                  <select value={reportFilters.month} onChange={e => setReportFilters({...reportFilters, month: e.target.value, startDate: '', endDate: ''})} style={{ padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>
                    <option value="">All Months</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Year</label>
                  <input type="number" value={reportFilters.year} onChange={e => setReportFilters({...reportFilters, year: e.target.value, startDate: '', endDate: ''})} style={{ padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', width: '80px' }} />
                </div>
                <div style={{ padding: '0 0.5rem', color: 'var(--text-secondary)' }}>OR</div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Start Date</label>
                  <input type="date" value={reportFilters.startDate} onChange={e => setReportFilters({...reportFilters, startDate: e.target.value, month: '', year: ''})} style={{ padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>End Date</label>
                  <input type="date" value={reportFilters.endDate} onChange={e => setReportFilters({...reportFilters, endDate: e.target.value, month: '', year: ''})} style={{ padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }} />
                </div>
                <button className="btn btn-primary" onClick={fetchFinancials} style={{ padding: '0.4rem 1rem' }}>Apply Filter</button>
              </div>

              {/* Income & Expenditure Statement */}
              <div className="card report-card" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Building size={24} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{user?.tenantName || 'Society Name'}</h2>
                  </div>
                  {user?.tenantAddress && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', maxWidth: '400px', margin: '0 auto 0.75rem' }}>{user.tenantAddress}</div>}
                  <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Income & Expenditure Statement
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{dateRangeStr}</div>
                </div>

                <div className="table-responsive" style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'transparent' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                        <th style={{ width: '35%', textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Particulars</th>
                        <th style={{ width: '15%', textAlign: 'right', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', borderRight: '1px solid var(--border-color)' }}>Amount (₹)</th>
                        <th style={{ width: '35%', textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', paddingLeft: '1.5rem' }}>Particulars</th>
                        <th style={{ width: '15%', textAlign: 'right', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {/* Left Column - Expenditure */}
                        <td colSpan={2} style={{ verticalAlign: 'top', padding: 0, borderRight: '1px solid var(--border-color)' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'transparent' }}>
                            <tbody>
                              <tr><td colSpan={2} style={{ fontWeight: 700, padding: '1rem', fontSize: '0.875rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>Direct Expenses</td></tr>
                              {expenseItems.map((e: any, idx: number) => (
                                <tr key={`exp-${idx}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '0.75rem 1rem', paddingLeft: '1.5rem', fontSize: '0.875rem' }}>{e.category}</td>
                                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 500 }}>{e.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                              ))}
                              {netProfit > 0 && (
                                <tr style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                                  <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--success)' }}>Excess of Income over Expenditure</td>
                                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', color: 'var(--success)' }}>{netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </td>
                        {/* Right Column - Income */}
                        <td colSpan={2} style={{ verticalAlign: 'top', padding: 0 }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'transparent' }}>
                            <tbody>
                              <tr><td colSpan={2} style={{ fontWeight: 700, padding: '1rem', fontSize: '0.875rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(59, 130, 246, 0.05)', paddingLeft: '1.5rem' }}>Direct Incomes</td></tr>
                              {incomeItems.map((i: any, idx: number) => (
                                <tr key={`inc-${idx}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '0.75rem 1rem', paddingLeft: '2rem', fontSize: '0.875rem' }}>{i.category}</td>
                                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 500 }}>{i.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                              ))}
                              {netProfit < 0 && (
                                <tr style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                                  <td style={{ padding: '1rem', paddingLeft: '2rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--error)' }}>Excess of Expenditure over Income</td>
                                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', color: 'var(--error)' }}>{Math.abs(netProfit).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '2px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontWeight: 700 }}>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>Total</td>
                        <td style={{ padding: '1rem', textAlign: 'right', borderRight: '1px solid var(--border-color)', fontSize: '0.9rem' }}>{pnlTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td style={{ padding: '1rem', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>Total</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem' }}>{pnlTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Balance Sheet */}
              <div className="card report-card" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Landmark size={24} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{user?.tenantName || 'Society Name'}</h2>
                  </div>
                  {user?.tenantAddress && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', maxWidth: '400px', margin: '0 auto 0.75rem' }}>{user.tenantAddress}</div>}
                  <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', backgroundColor: 'var(--accent)', color: '#fff', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Balance Sheet
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>as at {asAtDate}</div>
                </div>

                <div className="table-responsive" style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'transparent' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                        <th style={{ width: '35%', textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Liabilities</th>
                        <th style={{ width: '15%', textAlign: 'right', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', borderRight: '1px solid var(--border-color)' }}>as at {asAtDate}</th>
                        <th style={{ width: '35%', textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', paddingLeft: '1.5rem' }}>Assets</th>
                        <th style={{ width: '15%', textAlign: 'right', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>as at {asAtDate}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {/* Left Column - Liabilities */}
                        <td colSpan={2} style={{ verticalAlign: 'top', padding: 0, borderRight: '1px solid var(--border-color)' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'transparent' }}>
                            <tbody>
                              <tr><td colSpan={2} style={{ fontWeight: 700, padding: '1rem', fontSize: '0.875rem', color: 'var(--accent)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(124, 58, 237, 0.05)' }}>Capital Account</td></tr>
                              {bsLiabilities.map((l, i) => (
                                <tr key={`liab-${i}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '0.75rem 1rem', paddingLeft: '1.5rem', fontSize: '0.875rem' }}>{l.label}</td>
                                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 500 }}>{l.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                              ))}
                              {netProfit > 0 && (
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>Profit & Loss A/c (Profit)</td>
                                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>{netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </td>
                        {/* Right Column - Assets */}
                        <td colSpan={2} style={{ verticalAlign: 'top', padding: 0 }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'transparent' }}>
                            <tbody>
                              <tr><td colSpan={2} style={{ fontWeight: 700, padding: '1rem', fontSize: '0.875rem', color: 'var(--accent)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(124, 58, 237, 0.05)', paddingLeft: '1.5rem' }}>Current Assets</td></tr>
                              {bsAssets.map((a, i) => (
                                <tr key={`asset-${i}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '0.75rem 1rem', paddingLeft: '2rem', fontSize: '0.875rem' }}>{a.label}</td>
                                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 500 }}>{a.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                              ))}
                              {netProfit < 0 && (
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '1rem', paddingLeft: '2rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>Profit & Loss A/c (Loss)</td>
                                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>{Math.abs(netProfit).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '2px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontWeight: 700 }}>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>Total</td>
                        <td style={{ padding: '1rem', textAlign: 'right', borderRight: '1px solid var(--border-color)', fontSize: '0.9rem' }}>{bsTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td style={{ padding: '1rem', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>Total</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem' }}>{bsTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'logs':
        return (
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Audit Logs</h3>
            <div className="table-container">
              <table style={{ tableLayout: 'fixed', width: '100%' }}>
                <colgroup>
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '50%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log: any) => {
                    // Resolve member UUID in details to readable name
                    let details = log.details || '';
                    members.forEach((m: any) => {
                      if (details.includes(m.id)) {
                        details = details.replace(m.id, `${m.name} (Flat ${m.flatNo})`);
                      }
                    });
                    const ts = log.timestamp || log.createdAt;
                    const date = ts ? new Date(ts) : null;
                    const displayDate = date && !isNaN(date.getTime())
                      ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                      : '—';
                    return (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{displayDate}</td>
                        <td><strong>{log.performedBy}</strong></td>
                        <td><span className="badge badge-warning" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{log.actionType}</span></td>
                        <td style={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>{details}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'vendors':
        return <VendorManagement token={token} vendors={vendors} onRefresh={fetchData} serviceTypes={serviceTypes} />;
      case 'settings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ maxWidth: '800px' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Society Settings (Pricing Master)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Base Monthly Amount (₹)</label>
                  <input type="number" defaultValue={summary.maintenanceAmount || 0} id="maintenanceAmount" />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Quarterly Amount (₹)</label>
                  <input type="number" defaultValue={summary.quarterlyAmount || ''} id="quarterlyAmount" placeholder="Optional discounted price" />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Half-Yearly Amount (₹)</label>
                  <input type="number" defaultValue={summary.halfYearlyAmount || ''} id="halfYearlyAmount" placeholder="Optional discounted price" />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Annual Amount (₹)</label>
                  <input type="number" defaultValue={summary.annualAmount || ''} id="annualAmount" placeholder="Optional discounted price" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button className="btn btn-primary" onClick={async () => {
                  const amt = (document.getElementById('maintenanceAmount') as HTMLInputElement).value;
                  const qAmt = (document.getElementById('quarterlyAmount') as HTMLInputElement).value;
                  const hAmt = (document.getElementById('halfYearlyAmount') as HTMLInputElement).value;
                  const aAmt = (document.getElementById('annualAmount') as HTMLInputElement).value;
                  
                  await axios.patch('/tenants/settings', { 
                    maintenanceAmount: parseFloat(amt) || 0,
                    quarterlyAmount: parseFloat(qAmt) || null,
                    halfYearlyAmount: parseFloat(hAmt) || null,
                    annualAmount: parseFloat(aAmt) || null
                  }, { headers: { Authorization: `Bearer ${token}` } });
                  
                  alert('Settings updated successfully');
                }}>Save Pricing Settings</button>
              </div>
            </div>
            <MastersManagement token={token} onRefresh={fetchData} />
          </div>
        );
      case 'staff':
        return <StaffManagement token={token} currentUserId={user?.id} designations={designations} />;
      case 'upcoming':
        return (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem' }}>Upcoming & Overdue Payments</h3>
              <button className="btn btn-primary" onClick={() => setShowModal('payment')}>
                <Plus size={18} /> Record Payment
              </button>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>FLAT NO</th>
                    <th>MEMBER</th>
                    <th>PAID UNTIL</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingMembers.map((m: any) => {
                    const isOverdue = m.paidUntil ? new Date(m.paidUntil) < new Date() : true;
                    return (
                      <tr key={m.id}>
                        <td><strong>{m.flatNo}</strong></td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{m.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.mobile}</div>
                        </td>
                        <td>
                          {m.paidUntil ? new Date(m.paidUntil).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'No Record'}
                        </td>
                        <td>
                          {isOverdue 
                            ? <span className="badge badge-error">Overdue</span>
                            : <span className="badge badge-warning">Due This Month</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {upcomingMembers.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No upcoming or overdue payments! All members are paid up.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.4rem', borderRadius: '0.4rem' }}>
            <Building size={20} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>SocietyPro</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <Building size={24} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>SocietyPro</span>
          </div>
          <button 
            className="mobile-only"
            onClick={() => setIsSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'none' }}
          >
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'members', icon: Users, label: 'Members' },
            { id: 'payments', icon: Receipt, label: 'Payments' },
            { id: 'upcoming', icon: Calendar, label: 'Upcoming Dues' },
            { id: 'expenses', icon: Landmark, label: 'Expenses' },
            ...(summary.enableForums ? [{ id: 'helpdesk', icon: LifeBuoy, label: 'Helpdesk' }] : []),
            { id: 'vendors', icon: Users2, label: 'Vendors' },
            { id: 'settings', icon: Settings, label: 'Settings' },
            { id: 'staff', icon: UserCheck, label: 'Office Bearers' },
            { id: 'logs', icon: History, label: 'Audit Logs' },
            { id: 'reports', icon: BarChart2, label: 'Reports' },
          ].map((item) => (
            <a 
              key={item.id}
              href="#" 
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`} 
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
            >
              <item.icon size={20} /> {item.label}
            </a>
          ))}
        </nav>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', color: 'var(--error)' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Treasurer Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.tenantName} • Welcome back, {user?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', width: 'auto' }}>
            <button className="btn btn-secondary" onClick={() => setShowModal('transfer')} style={{ flex: 1, whiteSpace: 'nowrap' }}>
              <Send size={18} /> Transfer Cash
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal('payment')} style={{ flex: 1, whiteSpace: 'nowrap' }}>
              <Plus size={18} /> Record Payment
            </button>
          </div>
        </header>

        {pendingTransfers.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            {pendingTransfers.map((t: any) => (
              <div key={t.id} style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid var(--warning)',
                borderRadius: '0.75rem',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: 'var(--warning)' }}><ArrowDownLeft size={24} /></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Cash Handover Request</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {t.fromAdmin?.name} wants to handover <strong>₹{t.amount.toLocaleString()}</strong> to you.
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }} onClick={() => handleApproveTransfer(t.id)}>
                    Accept & Update Balance
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {renderContent()}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ 
            width: '100%', 
            maxWidth: '600px', 
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            {showModal === 'member' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem' }}>Add New Member</h2>
                  <button onClick={() => setShowModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
                </div>
                <form onSubmit={handleSubmitMember}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Full Name</label>
                      <input type="text" required value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Flat / Unit No</label>
                      <input type="text" required value={newMember.flatNo} onChange={(e) => setNewMember({ ...newMember, flatNo: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Default Payment Tenure</label>
                      <select value={newMember.defaultTenure} onChange={(e) => setNewMember({ ...newMember, defaultTenure: e.target.value })}>
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="HALF_YEARLY">Half-Yearly</option>
                        <option value="ANNUAL">Annual</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Membership Active From</label>
                      <input type="date" value={newMember.paidUntil} onChange={(e) => setNewMember({ ...newMember, paidUntil: e.target.value })} />
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Next payment cycle will start from this date.</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Old Pending Dues (₹)</label>
                      <input type="number" value={newMember.outstandingDues} onChange={(e) => setNewMember({ ...newMember, outstandingDues: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Mobile Number</label>
                      <input type="text" required value={newMember.mobile} onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Email Address</label>
                      <input type="email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '0.75rem', gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1px solid var(--border-color)' }}>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Camera size={14} /> Profile Photo
                        </label>
                        {newMember.photoUrl ? (
                          <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                            <img src={newMember.photoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.4rem' }} />
                            <button type="button" onClick={() => setNewMember({...newMember, photoUrl: ''})} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}>&times;</button>
                          </div>
                        ) : (
                          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'photo')} disabled={uploading} style={{ fontSize: '0.75rem' }} />
                        )}
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FileText size={14} /> ID Proof (Aadhar/PAN)
                        </label>
                        {newMember.idProofUrl ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-success">Uploaded</span>
                            <button type="button" onClick={() => setNewMember({...newMember, idProofUrl: ''})} style={{ fontSize: '0.7rem', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                          </div>
                        ) : (
                          <input type="file" accept="image/*,.pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'idProof')} disabled={uploading} style={{ fontSize: '0.75rem' }} />
                        )}
                      </div>
                      {uploading && <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', color: 'var(--primary)', fontStyle: 'italic' }}>Uploading document...</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
                      <input
                        type="checkbox"
                        id="enableLogin"
                        checked={newMember.enableLogin}
                        onChange={(e) => setNewMember({ ...newMember, enableLogin: e.target.checked })}
                      />
                      <label htmlFor="enableLogin" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>Enable Member Login (using Phone Number)</label>
                    </div>

                    {newMember.enableLogin && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Set Password</label>
                        <input
                          type="password"
                          required
                          placeholder="Min 6 characters"
                          value={newMember.password}
                          onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed var(--border-color)' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <h4 style={{ fontSize: '0.875rem', marginBottom: '0.2rem', color: 'var(--primary)' }}>Initial Setup / Corpus Fund</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Record any one-time joining fees collected right now.</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Initial Payment (₹)</label>
                      <input type="number" placeholder="Optional" value={newMember.initialPaymentAmount || ''} onChange={(e) => setNewMember({ ...newMember, initialPaymentAmount: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Payment Mode</label>
                      <select value={newMember.initialPaymentMode} onChange={(e) => setNewMember({ ...newMember, initialPaymentMode: e.target.value })}>
                        <option value="CASH">Cash</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="UPI">UPI / QR</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Payment Notes</label>
                      <input type="text" placeholder="e.g. Corpus Fund, Setup Fee" value={newMember.initialPaymentNotes} onChange={(e) => setNewMember({ ...newMember, initialPaymentNotes: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Member</button>
                  </div>
                </form>
              </>
            )}

            {showModal === 'member-history' && selectedMember && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Payment History</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {selectedMember.name} &mdash; Flat {selectedMember.flatNo}
                    </p>
                  </div>
                  <button onClick={() => setShowModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
                </div>

                {/* Summary cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Total Paid', value: `₹${payments.filter((p: any) => p.memberId === selectedMember.id && p.status === 'PAID').reduce((s: number, p: any) => s + p.amount, 0).toLocaleString()}`, color: 'var(--success)' },
                    { label: 'Outstanding', value: `₹${selectedMember.outstandingDues?.toLocaleString()}`, color: selectedMember.outstandingDues > 0 ? 'var(--error)' : 'var(--success)' },
                    { label: 'Receipts', value: payments.filter((p: any) => p.memberId === selectedMember.id).length, color: 'var(--primary)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Payment history table */}
                <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Receipt No</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Mode</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.filter((p: any) => p.memberId === selectedMember.id).length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No payment records found</td></tr>
                      ) : (
                        payments
                          .filter((p: any) => p.memberId === selectedMember.id)
                          .map((p: any) => (
                            <tr key={p.id}>
                              <td><code style={{ fontSize: '0.8125rem' }}>{p.receiptNumber}</code></td>
                              <td style={{ fontSize: '0.875rem' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                              <td style={{ fontWeight: 600 }}>₹{p.amount.toLocaleString()}</td>
                              <td><span className={`badge ${p.mode === 'CASH' ? 'badge-warning' : 'badge-success'}`}>{p.mode}</span></td>
                              <td><span className={`badge ${p.status === 'PAID' ? 'badge-success' : 'badge-error'}`}>{p.status}</span></td>
                              <td style={{ textAlign: 'right' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                  onClick={() => { setSelectedPayment(p); setShowModal('receipt'); }}>
                                  <Eye size={13} /> View
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {showModal === 'receipt' && selectedPayment && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem' }}>Payment Receipt</h2>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={() => window.print()} style={{ padding: '0.5rem' }}><Printer size={18} /></button>
                    <button onClick={() => setShowModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
                  </div>
                </div>

                <div id="receipt-content" style={{
                  backgroundColor: 'white',
                  color: '#1e293b',
                  padding: '2rem',
                  borderRadius: '0.5rem',
                  position: 'relative',
                  border: '1px solid #e2e8f0',
                  minHeight: '400px'
                }}>
                  {selectedPayment.status === 'CANCELLED' && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(-30deg)',
                      fontSize: '4rem',
                      fontWeight: 800,
                      color: 'rgba(239, 68, 68, 0.15)',
                      pointerEvents: 'none',
                      zIndex: 10,
                      border: '8px solid rgba(239, 68, 68, 0.15)',
                      padding: '1rem',
                      borderRadius: '1rem'
                    }}>CANCELLED</div>
                  )}

                  <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #3b82f6', paddingBottom: '1rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{user?.tenantName}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Maintenance Fee Receipt</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receipt Number</div>
                      <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{selectedPayment.receiptNumber}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</div>
                      <div style={{ fontWeight: 700 }}>{new Date(selectedPayment.paymentDate).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Received From</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{selectedPayment.member?.name}</div>
                    <div style={{ color: '#475569' }}>Flat No: {selectedPayment.member?.flatNo}</div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: '#64748b' }}>Payment Mode</span>
                      <span style={{ fontWeight: 600 }}>{selectedPayment.mode}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>Total Amount</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>₹{selectedPayment.amount.toLocaleString()}</span>
                    </div>
                  </div>

                  {selectedPayment.notes && (
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Notes</div>
                      <div style={{ fontSize: '0.875rem', color: '#475569' }}>{selectedPayment.notes}</div>
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Generated on {new Date().toLocaleString()}<br />
                      By {selectedPayment.collectedBy?.name || 'System'}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderBottom: '1px solid #e2e8f0', width: '150px', marginBottom: '0.5rem' }}></div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Authorized Signatory</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" onClick={() => {
                    const content = document.getElementById('receipt-content');
                    if (content) {
                      const printWindow = window.open('', '_blank');
                      printWindow?.document.write('<html><head><title>Receipt</title><style>body { font-family: sans-serif; }</style></head><body>');
                      printWindow?.document.write(content.innerHTML);
                      printWindow?.document.write('</body></html>');
                      printWindow?.document.close();
                      printWindow?.print();
                    }
                  }}>
                    <Download size={18} /> Download PDF
                  </button>
                </div>
              </>
            )}

            {showModal === 'edit-member' && editingMember && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem' }}>Edit Member Details</h2>
                  <button onClick={() => setShowModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
                </div>
                <form onSubmit={handleUpdateMember}>
                  <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Full Name</label>
                      <input type="text" required value={editingMember.name} onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Flat / Unit No</label>
                      <input type="text" required value={editingMember.flatNo} onChange={(e) => setEditingMember({ ...editingMember, flatNo: e.target.value })} />
                    </div>
                     <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Status</label>
                      <select value={editingMember.status} onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value })}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Paid Until (Period Covered)</label>
                      <input type="date" value={editingMember.paidUntil || ''} onChange={(e) => setEditingMember({ ...editingMember, paidUntil: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Mobile Number</label>
                      <input type="text" required value={editingMember.mobile} onChange={(e) => setEditingMember({ ...editingMember, mobile: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Email Address</label>
                      <input type="email" value={editingMember.email} onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })} />
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '0.75rem', gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1px solid var(--border-color)' }}>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Camera size={14} /> Profile Photo
                        </label>
                        {editingMember.photoUrl ? (
                          <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                            <img src={editingMember.photoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.4rem' }} />
                            <button type="button" onClick={() => setEditingMember({...editingMember, photoUrl: ''})} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}>&times;</button>
                          </div>
                        ) : (
                          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'photo')} disabled={uploading} style={{ fontSize: '0.75rem' }} />
                        )}
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FileText size={14} /> ID Proof (Aadhar/PAN)
                        </label>
                        {editingMember.idProofUrl ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-success">Uploaded</span>
                            <button type="button" onClick={() => setEditingMember({...editingMember, idProofUrl: ''})} style={{ fontSize: '0.7rem', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                          </div>
                        ) : (
                          <input type="file" accept="image/*,.pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'idProof')} disabled={uploading} style={{ fontSize: '0.75rem' }} />
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
                      <input
                        type="checkbox"
                        id="enableLoginEdit"
                        checked={editingMember.enableLogin}
                        onChange={(e) => setEditingMember({ ...editingMember, enableLogin: e.target.checked })}
                      />
                      <label htmlFor="enableLoginEdit" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                        {editingMember.userId ? 'Member Login Enabled' : 'Enable Member Login (using Phone Number)'}
                      </label>
                    </div>

                    {editingMember.enableLogin && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>
                          {editingMember.userId ? 'Change Password (leave blank to keep current)' : 'Set Password'}
                        </label>
                        <input
                          type="password"
                          placeholder="Min 6 characters"
                          value={editingMember.password || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, password: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Update Member</button>
                  </div>
                </form>
              </>
            )}

            {showModal === 'payment' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem' }}>Record Maintenance Payment</h2>
                  <button onClick={() => setShowModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
                </div>
                <form onSubmit={handleSubmitPayment}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Select Member</label>
                      <select required value={newPayment.memberId} onChange={(e) => {
                        setNewPayment({ ...newPayment, memberId: e.target.value, amount: getPricing(newPayment.paidMonths) });
                      }}>
                        <option value="">-- Choose Member --</option>
                        {members.map((m: any) => (
                          <option key={m.id} value={m.id}>{m.flatNo} - {m.name} (Due: ₹{m.outstandingDues})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid-2">
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Payment Period</label>
                        <select required value={newPayment.paidMonths} onChange={(e) => {
                          const months = parseInt(e.target.value);
                          const label = e.target.options[e.target.selectedIndex].text;
                          let updatedEndDate = newPayment.coverageEndDate;
                          
                          if (newPayment.coverageStartDate) {
                            const start = new Date(newPayment.coverageStartDate);
                            const end = new Date(start.setMonth(start.getMonth() + months));
                            // Subtract one day to end on the last day of the period
                            end.setDate(end.getDate() - 1);
                            updatedEndDate = end.toISOString().split('T')[0];
                          }
                          
                          setNewPayment({ 
                            ...newPayment, 
                            paidMonths: months, 
                            periodLabel: label, 
                            amount: getPricing(months),
                            coverageEndDate: updatedEndDate
                          });
                        }}>
                          <option value={1}>Monthly</option>
                          <option value={3}>Quarterly</option>
                          <option value={6}>Half-Yearly</option>
                          <option value={12}>Annual</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Payment Mode</label>
                        <select value={newPayment.mode} onChange={(e) => setNewPayment({ ...newPayment, mode: e.target.value })}>
                          <option value="CASH">Cash</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="UPI">UPI / QR</option>
                          <option value="CHEQUE">Cheque</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid-2">
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Amount Received (₹) <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>(Base: ₹{summary.maintenanceAmount || 0})</span></label>
                        <input type="number" required value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Reference / Notes</label>
                        <input type="text" placeholder="e.g. Receipt No, Transaction ID" value={newPayment.notes} onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid-2" style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed var(--border-color)' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <h4 style={{ fontSize: '0.875rem', marginBottom: '0.2rem', color: 'var(--primary)' }}>Advanced: Custom Coverage Dates</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Leave blank to auto-calculate based on current paid-until date.</p>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Coverage Start (Optional)</label>
                        <input type="date" value={newPayment.coverageStartDate || ''} onChange={(e) => {
                          const startDate = e.target.value;
                          let updatedEndDate = newPayment.coverageEndDate;
                          
                          if (startDate) {
                            const start = new Date(startDate);
                            const end = new Date(start.setMonth(start.getMonth() + newPayment.paidMonths));
                            end.setDate(end.getDate() - 1);
                            updatedEndDate = end.toISOString().split('T')[0];
                          }
                          
                          setNewPayment({ ...newPayment, coverageStartDate: startDate, coverageEndDate: updatedEndDate });
                        }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Coverage End (Optional)</label>
                        <input type="date" value={newPayment.coverageEndDate || ''} onChange={(e) => setNewPayment({ ...newPayment, coverageEndDate: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Record Payment</button>
                  </div>
                </form>
              </>
            )}
            {showModal === 'transfer' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem' }}>Transfer / Handover Cash</h2>
                  <button onClick={() => setShowModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
                </div>
                <form onSubmit={handleSubmitTransfer}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem', border: '1px dashed var(--border-color)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Your Current Cash Balance</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>₹{myBalance.toLocaleString()}</div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Transfer Type</label>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input type="radio" checked={newTransfer.type === 'HANDOVER'} onChange={() => setNewTransfer({ ...newTransfer, type: 'HANDOVER' })} />
                          <span style={{ fontSize: '0.875rem' }}>Handover to Admin</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input type="radio" checked={newTransfer.type === 'DEPOSIT'} onChange={() => setNewTransfer({ ...newTransfer, type: 'DEPOSIT' })} />
                          <span style={{ fontSize: '0.875rem' }}>Deposit to Bank</span>
                        </label>
                      </div>
                    </div>

                    {newTransfer.type === 'HANDOVER' && (
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Select Recipient Admin</label>
                        <select required value={newTransfer.toAdminId} onChange={(e) => setNewTransfer({ ...newTransfer, toAdminId: e.target.value })}>
                          <option value="">-- Select Treasurer --</option>
                          {cashBalances.filter((b: any) => b.userId !== user.id).map((b: any) => (
                            <option key={b.userId} value={b.userId}>{b.userName}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Amount (₹)</label>
                      <input type="number" required max={myBalance} value={newTransfer.amount} onChange={(e) => setNewTransfer({ ...newTransfer, amount: parseFloat(e.target.value) || 0 })} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Notes</label>
                      <input type="text" placeholder="e.g. For weekly bank deposit" value={newTransfer.referenceNote} onChange={(e) => setNewTransfer({ ...newTransfer, referenceNote: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={newTransfer.amount <= 0 || newTransfer.amount > myBalance}>Initiate Transfer</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {selectedDoc && <DocumentViewer url={selectedDoc.url} type={selectedDoc.type} onClose={() => setSelectedDoc(null)} />}
    </div>
  );
};

export default TenantAdminDashboard;
