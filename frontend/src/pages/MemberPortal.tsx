import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, LifeBuoy, LogOut, Plus, Send, 
  MessageSquare, Clock, Building, User, CreditCard, 
  History, Menu, X, Printer, FileText 
} from 'lucide-react';
import axios from 'axios';

const MemberHelpdesk = ({ token }: { token: string | null }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'MEDIUM' });
  const [comment, setComment] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/tickets', newTicket, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTicket({ subject: '', description: '', priority: 'MEDIUM' });
      setShowNewModal(false);
      fetchTickets();
    } catch (err) {
      alert("Error raising ticket");
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

  const getStatusBadge = (s: string) => {
    switch(s) {
      case 'OPEN': return <span className="badge badge-error">Open</span>;
      case 'IN_PROGRESS': return <span className="badge" style={{ backgroundColor: '#f59e0b', color: '#fff' }}>In Progress</span>;
      case 'RESOLVED': return <span className="badge badge-success">Resolved</span>;
      case 'CLOSED': return <span className="badge" style={{ backgroundColor: 'var(--text-secondary)', color: '#fff' }}>Closed</span>;
      default: return <span className="badge">{s}</span>;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '350px 1fr' : '1fr', gap: '1.5rem', height: 'calc(100vh - 220px)', minHeight: '500px' }}>
      {/* Ticket List */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} /> My Tickets
          </h3>
          <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }} onClick={() => setShowNewModal(true)}>
            <Plus size={16} /> New Ticket
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <LifeBuoy size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
              <p>No tickets raised yet.</p>
              <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setShowNewModal(true)}>Raise your first ticket</button>
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
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>#{t.id.slice(-6)}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t.subject}</div>
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

      {/* Ticket Details */}
      {selectedTicket ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{selectedTicket.subject}</h3>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} /> Raised on {new Date(selectedTicket.createdAt).toLocaleString()}
                <span>•</span>
                {getStatusBadge(selectedTicket.status)}
              </div>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setSelectedTicket(null)}>
              <X size={20} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Description</div>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.925rem' }}>{selectedTicket.description}</p>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(selectedTicket.comments || []).map((c: any) => {
                const isAdmin = !!c.userId;
                return (
                  <div key={c.id} style={{ 
                    alignSelf: isAdmin ? 'flex-start' : 'flex-end',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAdmin ? 'flex-start' : 'flex-end'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <strong>{isAdmin ? 'Admin' : 'You'}</strong>
                      <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ 
                      padding: '0.75rem 1rem', 
                      borderRadius: '0.75rem', 
                      borderTopLeftRadius: isAdmin ? '0' : '0.75rem',
                      borderTopRightRadius: isAdmin ? '0.75rem' : '0',
                      backgroundColor: isAdmin ? 'var(--bg-tertiary)' : 'var(--primary)',
                      color: isAdmin ? 'var(--text-primary)' : '#fff',
                      fontSize: '0.875rem'
                    }}>
                      {c.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'ARCHIVED' && (
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.75rem' }}>
                <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a reply..." style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary" disabled={!comment.trim()}><Send size={18} /></button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
          <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
          <p>Select a ticket to view conversation</p>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Raise New Ticket</h3>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Subject</label>
                <input required value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} placeholder="Brief title of the issue" />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Priority</label>
                <select value={newTicket.priority} onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }}>Description</label>
                <textarea 
                  required 
                  value={newTicket.description} 
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} 
                  placeholder="Provide more details about your concern..."
                  rows={4}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


const MemberPayments = ({ memberInfo, user }: { memberInfo: any, user: any }) => {
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);


  const viewReceipt = (p: any) => {
    setSelectedPayment({
      ...p,
      member: {
        name: memberInfo.name,
        flatNo: memberInfo.flatNo
      }
    });
    setShowReceipt(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} /> Payment History
        </h3>
        
        {!memberInfo?.payments || memberInfo.payments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <CreditCard size={40} style={{ margin: '0 auto 1rem', opacity: 0.1 }} />
            <p>No payment records found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>DATE</th>
                  <th style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>RECEIPT #</th>
                  <th style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>PERIOD</th>
                  <th style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>AMOUNT</th>
                  <th style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {memberInfo.payments.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      <div>{formatUTCDate(p.paymentDate)}</div>
                      {p.coverageStartDate && p.coverageEndDate && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          ({formatUTCDate(p.coverageStartDate)} - {formatUTCDate(p.coverageEndDate)})
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>{p.receiptNumber || `RCP-${p.id.slice(-6).toUpperCase()}`}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{p.periodLabel || `${p.paidMonths} Month(s)`}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700 }}>₹{Math.round(p.amount).toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => viewReceipt(p)}>
                        <FileText size={14} /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showReceipt && selectedPayment && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Payment Receipt</h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => window.print()} style={{ padding: '0.5rem' }}><Printer size={18} /></button>
                <button onClick={() => setShowReceipt(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
              </div>
            </div>

            <div id="receipt-content" style={{
              backgroundColor: 'white',
              color: '#1e293b',
              padding: '2rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              minHeight: '400px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{user?.tenantName}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Maintenance Fee Receipt</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receipt Number</div>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{selectedPayment.receiptNumber || `RCP-${selectedPayment.id.slice(-6).toUpperCase()}`}</div>
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
                {selectedPayment.financialYear && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ color: '#64748b' }}>Financial Year</span>
                    <span style={{ fontWeight: 600 }}>{selectedPayment.financialYear}</span>
                  </div>
                )}
                {selectedPayment.coverageStartDate && selectedPayment.coverageEndDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ color: '#64748b' }}>Coverage Period</span>
                    <span style={{ fontWeight: 600 }}>{formatUTCDate(selectedPayment.coverageStartDate)} - {formatUTCDate(selectedPayment.coverageEndDate)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: '#64748b' }}>Payment Period</span>
                  <span style={{ fontWeight: 600 }}>{selectedPayment.periodLabel || `${selectedPayment.paidMonths} Month(s)`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: '#64748b' }}>Payment Mode</span>
                  <span style={{ fontWeight: 600 }}>{selectedPayment.mode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>Total Amount</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{Math.round(selectedPayment.amount).toLocaleString()}</span>
                </div>
              </div>

              {selectedPayment.notes && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Notes</div>
                  <div style={{ fontSize: '0.875rem', color: '#475569' }}>{selectedPayment.notes}</div>
                </div>
              )}

              <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                This is a computer generated receipt and does not require a signature.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatUTCDate = (dateInput: string | Date | null | undefined) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = d.getUTCDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' });
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
};

const MemberPortal = () => {
  const { logout, token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visibleStartYear, setVisibleStartYear] = useState(2022);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/members/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMemberInfo(res.data);
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (memberInfo?.createdAt) {
      const regDate = new Date(memberInfo.createdAt);
      const regYear = regDate.getUTCMonth() >= 3 ? regDate.getUTCFullYear() : regDate.getUTCFullYear() - 1;
      if (!isNaN(regYear)) {
        setVisibleStartYear(regYear);
      }
    }
  }, [memberInfo]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': {


        const now = new Date();
        const currentStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        const currentFY = `${currentStartYear}-${((currentStartYear + 1) % 100).toString().padStart(2, '0')}`;
        const currentYearCost = memberInfo?.tenant?.maintenanceCosts?.find((c: any) => c.financialYear === currentFY)?.amount;
        const regDate = memberInfo?.createdAt ? new Date(memberInfo.createdAt) : null;
        const regYear = regDate 
          ? (regDate.getUTCMonth() >= 3 ? regDate.getUTCFullYear() : regDate.getUTCFullYear() - 1)
          : 2022;

        // Construct visibleYears for history table showing 5 years based on visibleStartYear
        const visibleYears = Array.from({ length: 5 }).map((_, idx) => {
          const startYr = visibleStartYear + idx;
          const fyStr = `${startYr}-${((startYr + 1) % 100).toString().padStart(2, '0')}`;
          
          const configuredCost = memberInfo?.tenant?.maintenanceCosts?.find((c: any) => c.financialYear === fyStr);
          const amount = configuredCost ? configuredCost.amount : null;
          
          return {
            id: configuredCost?.id || fyStr,
            financialYear: fyStr,
            amount: amount,
            startYear: startYr
          };
        }).filter(y => y.amount !== null && y.startYear >= regYear) as { id: string; financialYear: string; amount: number; startYear: number }[];

        const isYearPaid = (startYear: number) => {
          const fyStr = `${startYear}-${((startYear + 1) % 100).toString().padStart(2, '0')}`;
          
          // If the fee is not set for this year, it cannot be paid (displays Due status)
          const configuredCost = memberInfo?.tenant?.maintenanceCosts?.find((c: any) => c.financialYear === fyStr);
          if (!configuredCost) return false;
          
          // Only return Paid if an explicit payment record exists for that financial year
          if (!memberInfo?.payments || memberInfo.payments.length === 0) return false;

          // Check if any payment's financialYear field matches exactly
          const hasMatchingFY = memberInfo.payments.some((p: any) => p.financialYear === fyStr);
          if (hasMatchingFY) return true;

          // Check if any payment's periodLabel contains the financial year string
          const hasMatchingLabel = memberInfo.payments.some((p: any) => {
            if (!p.periodLabel) return false;
            return p.periodLabel.toLowerCase().includes(fyStr.toLowerCase());
          });
          if (hasMatchingLabel) return true;

          return false;
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Hello, {user?.name}!</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Welcome to your resident portal for <strong>{user?.tenantName}</strong>.</p>
                </div>
                <div style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '1rem', borderRadius: '1rem' }}>
                  <Building size={32} />
                </div>
              </div>
            </div>

            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.6rem', borderRadius: '0.5rem', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
                    <CreditCard size={20} />
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Current Dues</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: (memberInfo?.totalDues !== undefined ? memberInfo.totalDues : memberInfo?.outstandingDues || 0) > 0 ? 'var(--error)' : 'var(--success)' }}>
                  ₹{(memberInfo?.totalDues !== undefined ? memberInfo.totalDues : memberInfo?.outstandingDues || 0).toLocaleString()}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {(memberInfo?.totalDues !== undefined ? memberInfo.totalDues : memberInfo?.outstandingDues || 0) > 0 ? 'Please pay at the society office.' : 'No outstanding dues!'}
                </p>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.6rem', borderRadius: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                    <User size={20} />
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>House / Flat Details</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  Unit {memberInfo?.flatNo || 'N/A'}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {user?.tenantName}
                </p>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={20} style={{ color: 'var(--primary)' }} /> Maintenance Cost Details
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Your maintenance fee structure by financial year (showing since your registration year).
              </p>
              
              {currentYearCost !== undefined && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                      Current Year ({currentFY})
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{currentYearCost.toLocaleString()}/yr
                    </div>
                  </div>
                </div>
              )}

              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Your Yearly Maintenance History</h4>
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Financial Year</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Annual Fee</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleYears.length > 0 ? (
                      visibleYears.map((c) => {
                        const isCurrent = c.financialYear === currentFY;
                        const paid = isYearPaid(c.startYear);
                        return (
                          <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isCurrent ? 'var(--bg-tertiary)' : 'transparent' }}>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                              <strong>{c.financialYear}</strong>
                              {isCurrent && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--primary)', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', fontWeight: 600 }}>Current</span>}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
                              ₹{c.amount.toLocaleString()}/year
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.825rem', textAlign: 'right' }}>
                              {paid ? (
                                <span className="badge badge-success" style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 600 }}>Paid</span>
                              ) : (
                                <span className="badge" style={{ backgroundColor: '#ef4444', color: 'white', fontWeight: 600 }}>Due</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          No maintenance records configured for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} 
                  onClick={() => setVisibleStartYear(prev => Math.max(regYear, prev - 5))}
                  disabled={visibleStartYear <= regYear}
                >
                  &larr; Previous 5 Years
                </button>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Years {visibleStartYear} to {visibleStartYear + 4}
                </span>
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} 
                  onClick={() => setVisibleStartYear(prev => prev + 5)}
                >
                  Next 5 Years &rarr;
                </button>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.125rem' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <button className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', alignItems: 'center' }} onClick={() => setActiveTab('helpdesk')}>
                  <LifeBuoy size={24} />
                  <span>Raise Helpdesk Ticket</span>
                </button>
                <button className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', alignItems: 'center' }} onClick={() => setActiveTab('payments')}>
                  <History size={24} />
                  <span>View Payment History</span>
                </button>
                <button className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', alignItems: 'center', opacity: 0.5, cursor: 'not-allowed' }}>
                  <CreditCard size={24} />
                  <span>Pay Maintenance (Coming Soon)</span>
                </button>
              </div>
            </div>
          </div>
        );
      }
      case 'helpdesk':
        return <MemberHelpdesk token={token} />;
      case 'payments':
        return <MemberPayments memberInfo={memberInfo} user={user} />;
      default:
        return null;
    }
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading Portal...</div>;

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building size={20} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 700 }}>{user?.tenantName}</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}>
          <Menu size={24} />
        </button>
      </div>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
            <Building size={24} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{user?.tenantName}</span>
        </div>

        <nav style={{ flex: 1 }}>
          <a href="#" className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}>
            <LayoutDashboard size={20} /> My Home
          </a>
          <a href="#" className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }}>
            <History size={20} /> Payment History
          </a>
          <a href="#" className={`nav-link ${activeTab === 'helpdesk' ? 'active' : ''}`} onClick={() => { setActiveTab('helpdesk'); setIsSidebarOpen(false); }}>
            <LifeBuoy size={20} /> Helpdesk
          </a>
        </nav>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', width: '100%', color: 'var(--error)', cursor: 'pointer' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Resident Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.tenantName} • Flat {memberInfo?.flatNo}</p>
        </header>

        {renderContent()}
      </div>
    </div>
  );
};

export default MemberPortal;
