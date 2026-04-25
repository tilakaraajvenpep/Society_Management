import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Building, Users, Settings, LogOut, Plus, Trash2, Search, Filter, CreditCard, Menu, X, AlertCircle, Activity } from 'lucide-react';
import axios from 'axios';

const SuperAdminDashboard = () => {
  const { logout, token } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState({ activeSocieties: 0, inactiveSocieties: 0, totalAdmins: 0, platformRevenue: 0, totalProcessed: 0, totalResidents: 0, systemStatus: 'Online' });
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [newTenant, setNewTenant] = useState({ 
    name: '', 
    address: '', 
    maintenanceAmount: 0,
    status: 'ACTIVE',
    slug: '',
    billingCycle: 'MONTHLY',
    subscriptionAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    lastRenewalDate: '',
    nextRenewalDate: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    enableForums: false
  });

  useEffect(() => {
    if (!editingTenantId && newTenant.startDate) {
      const start = new Date(newTenant.startDate);
      let next = new Date(start);
      if (newTenant.billingCycle === 'MONTHLY') next.setMonth(next.getMonth() + 1);
      else if (newTenant.billingCycle === 'QUARTERLY') next.setMonth(next.getMonth() + 3);
      else if (newTenant.billingCycle === 'ANNUAL') next.setFullYear(next.getFullYear() + 1);
      
      setNewTenant(prev => ({ ...prev, nextRenewalDate: next.toISOString().split('T')[0], lastRenewalDate: newTenant.startDate }));
    }
  }, [newTenant.startDate, newTenant.billingCycle, editingTenantId]);

  useEffect(() => {
    fetchTenants();
    fetchStats();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await axios.get('/tenants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Tenants data:', response.data);
      setTenants(response.data);
    } catch (err) {
      console.error('Error fetching tenants', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/platform/platform-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats', err);
    }
  };

  const handleSubmitTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTenantId) {
        await axios.patch(`/tenants/${editingTenantId}`, newTenant, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/tenants', newTenant, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setEditingTenantId(null);
      fetchTenants();
      fetchStats();
      alert(editingTenantId ? 'Society updated successfully!' : 'Society registered successfully!');
    } catch (err) {
      console.error('Error submitting tenant', err);
      alert('Error saving society details.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await axios.patch(`/tenants/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTenants();
      alert('Status updated successfully!');
    } catch (err) {
      console.error('Error toggling status', err);
      alert('Failed to update status.');
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this society? This action is irreversible.')) return;
    try {
      await axios.delete(`/tenants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTenants();
      fetchStats();
      alert('Society deleted successfully.');
    } catch (err) {
      console.error('Error deleting tenant', err);
      alert('Failed to delete society.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--success)', padding: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--success)' }}>
                  <Building size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Societies</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.activeSocieties}</div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--warning)', padding: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--warning)' }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Inactive / Pending</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.inactiveSocieties}</div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--primary)', padding: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Platform Revenue</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>₹{stats.platformRevenue.toLocaleString()}</div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--accent)', padding: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--accent)' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Processed</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{stats.totalProcessed.toLocaleString()}</div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--accent)', padding: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--accent)' }}>
                  <Users size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Office Bearers</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.totalAdmins}</div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--success)', padding: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--success)' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>System Status</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--success)' }}>{stats.systemStatus}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem' }}>Recent Societies</h3>
                <button className="btn btn-secondary" onClick={() => setActiveTab('societies')}>View All</button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Society Name</th>
                      <th>Location</th>
                      <th>Billing Plan</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.slice(0, 5).map((t: any) => (
                      <tr key={t.id}>
                        <td><strong>{t.name}</strong></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{t.address}</td>
                        <td>{t.billingCycle}</td>
                        <td><span className={`badge ${t.status === 'INACTIVE' ? 'badge-error' : 'badge-success'}`}>{t.status === 'INACTIVE' ? 'Inactive' : 'Active'}</span></td>
                      </tr>
                    ))}
                    {tenants.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No recent data.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      case 'societies':
        return (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem' }}>All Societies</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ position: 'relative', width: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="text" placeholder="Search societies..." style={{ paddingLeft: '2.5rem' }} />
                </div>
                <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Society Name</th>
                    <th>URL / Slug</th>
                    <th>Billing Plan</th>
                    <th>Subscription</th>
                    <th>Next Renewal</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t: any) => (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.address}</div>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.8125rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>{t.slug}</code>
                        <div style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                          <a href={`/${t.slug}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Visit Site</a>
                        </div>
                      </td>
                      <td><span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>{t.billingCycle}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>₹{t.subscriptionAmount?.toLocaleString()}</div>
                      </td>
                      <td style={{ color: t.nextRenewalDate && new Date(t.nextRenewalDate) < new Date() ? 'var(--error)' : 'inherit' }}>
                        {t.nextRenewalDate ? new Date(t.nextRenewalDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <button 
                          onClick={() => handleToggleStatus(t.id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <span className={`badge ${t.status === 'INACTIVE' ? 'badge-error' : 'badge-success'}`} style={{ cursor: 'pointer' }}>
                            {t.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                          </span>
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem' }}
                            onClick={() => {
                              const admin = t.users && t.users.length > 0 ? t.users[0] : null;
                              setEditingTenantId(t.id);
                              setNewTenant({
                                name: t.name,
                                address: t.address || '',
                                maintenanceAmount: t.maintenanceAmount || 0,
                                status: t.status,
                                slug: t.slug || '',
                                billingCycle: t.billingCycle || 'MONTHLY',
                                subscriptionAmount: t.subscriptionAmount || 0,
                                startDate: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                lastRenewalDate: t.lastRenewalDate || '',
                                nextRenewalDate: t.nextRenewalDate || '',
                                adminName: admin ? admin.name : '',
                                adminEmail: admin ? admin.email : '',
                                adminPassword: '',
                                enableForums: t.enableForums || false
                              });
                              setShowModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                            onClick={() => handleDeleteTenant(t.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No societies registered yet. Click "Register New Society" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'usage':
        return (
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Platform Usage</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Monitor server load, active sessions, and database health.</p>
            <div style={{ marginTop: '2rem', padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '0.5rem', textAlign: 'center' }}>
              <Users size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem' }}>Usage analytics and system logs will appear here.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="card" style={{ maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Global Platform Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>System Maintenance Mode</label>
                <select style={{ width: '100%' }}>
                  <option>Disabled (Online)</option>
                  <option>Scheduled Maintenance</option>
                  <option>Emergency Shutdown</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>New Registrations</label>
                <select style={{ width: '100%' }}>
                  <option>Public (Anyone can register)</option>
                  <option>Invite Only</option>
                  <option>Closed</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Global Settings</button>
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
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>SocietyPro Admin</span>
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
          <a href="#" className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}>
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="#" className={`nav-link ${activeTab === 'societies' ? 'active' : ''}`} onClick={() => { setActiveTab('societies'); setIsSidebarOpen(false); }}>
            <Building size={20} /> Societies
          </a>
          <a href="#" className={`nav-link ${activeTab === 'usage' ? 'active' : ''}`} onClick={() => { setActiveTab('usage'); setIsSidebarOpen(false); }}>
            <Users size={20} /> Platform Usage
          </a>
          <a href="#" className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}>
            <Settings size={20} /> Global Settings
          </a>
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Platform management and monitoring.</p>
          </div>
          <button className="btn btn-primary" onClick={() => {
            setEditingTenantId(null);
            setNewTenant({
              name: '', 
              address: '', 
              maintenanceAmount: 0,
              status: 'ACTIVE',
              slug: '',
              billingCycle: 'MONTHLY',
              subscriptionAmount: 0,
              startDate: new Date().toISOString().split('T')[0],
              lastRenewalDate: '',
              nextRenewalDate: '',
              adminName: '',
              adminEmail: '',
              adminPassword: '',
              enableForums: false
            });
            setShowModal(true);
          }}>
            <Plus size={18} /> Register New Society
          </button>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {renderContent()}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="card" style={{ 
            width: '100%', 
            maxWidth: '600px', 
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{editingTenantId ? 'Edit Society' : 'Register New Society'}</h2>
              <button onClick={() => { setShowModal(false); setEditingTenantId(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmitTenant}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Society Name</label>
                  <input type="text" required value={newTenant.name} onChange={(e) => setNewTenant({...newTenant, name: e.target.value})} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Address</label>
                  <input type="text" required value={newTenant.address} onChange={(e) => setNewTenant({...newTenant, address: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Subdomain / Slug</label>
                  <input type="text" placeholder="e.g. green-acres" value={newTenant.slug} onChange={(e) => setNewTenant({...newTenant, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Platform Status</label>
                  <select value={newTenant.status || 'ACTIVE'} onChange={(e) => setNewTenant({...newTenant, status: e.target.value})}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={16} style={{ color: 'var(--primary)' }} /> Platform Billing & Subscription
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Subscription Amount (₹)</label>
                    <input type="number" value={newTenant.subscriptionAmount} onChange={(e) => setNewTenant({...newTenant, subscriptionAmount: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Billing Cycle</label>
                    <select value={newTenant.billingCycle} onChange={(e) => setNewTenant({...newTenant, billingCycle: e.target.value})}>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="ANNUAL">Annual</option>
                    </select>
                  </div>
                  
                  {!editingTenantId ? (
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Account Start Date</label>
                      <input type="date" value={newTenant.startDate} onChange={(e) => setNewTenant({...newTenant, startDate: e.target.value})} />
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                        Next renewal will be automatically set to: <strong>{new Date(newTenant.nextRenewalDate).toLocaleDateString()}</strong>
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Last Renewal</label>
                        <input type="date" value={newTenant.lastRenewalDate} onChange={(e) => setNewTenant({...newTenant, lastRenewalDate: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Next Renewal</label>
                        <input type="date" value={newTenant.nextRenewalDate} onChange={(e) => setNewTenant({...newTenant, nextRenewalDate: e.target.value})} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={16} style={{ color: 'var(--primary)' }} /> Feature Controls
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input 
                    type="checkbox" 
                    id="enableForums" 
                    checked={newTenant.enableForums || false} 
                    onChange={(e) => setNewTenant({...newTenant, enableForums: e.target.checked})} 
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="enableForums" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                    Enable Helpdesk & Discussion Forum
                  </label>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginLeft: '2rem' }}>
                  Allows residents to raise tickets and discuss concerns with society admins.
                </p>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Users size={16} style={{ color: 'var(--primary)' }} />
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{editingTenantId ? 'Primary Admin Account' : 'Initial Admin Account'}</h4>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Admin Name</label>
                    <input type="text" required value={newTenant.adminName} onChange={(e: any) => setNewTenant({...newTenant, adminName: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Admin Email</label>
                    <input type="email" required value={newTenant.adminEmail} onChange={(e: any) => setNewTenant({...newTenant, adminEmail: e.target.value})} />
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px dashed var(--border-color)' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--primary)' }}>
                    {editingTenantId ? 'Reset Password' : 'Password'}
                  </label>
                  <input 
                    type="password" 
                    placeholder={editingTenantId ? "Leave blank to keep current" : "admin123 (default)"} 
                    value={newTenant.adminPassword} 
                    onChange={(e: any) => setNewTenant({...newTenant, adminPassword: e.target.value})} 
                  />
                  {editingTenantId && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Enter a new password only if you want to reset it for the admin.</p>}
                </div>
              </div>

              <div style={{ 
                position: 'sticky', 
                bottom: 0, 
                backgroundColor: 'var(--card-bg)', 
                padding: '1.25rem 0 0.5rem 0', 
                marginTop: '1.5rem', 
                borderTop: '1px solid var(--border-color)', 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'flex-end',
                zIndex: 10
              }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingTenantId(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: '160px' }}>
                  {editingTenantId ? 'Save Changes' : 'Register Society'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
