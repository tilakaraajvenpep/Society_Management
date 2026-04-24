import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { Shield, Building } from 'lucide-react';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    try {
      const response = await axios.post('/auth/login', { 
        identifier: email, 
        password,
        tenantId: tenant?.id
      });
      login(response.data.user, response.data.token);
      
      const { role } = response.data.user;
      if (role === 'SUPER_ADMIN') navigate('/super-admin');
      else if (role === 'TENANT_ADMIN') navigate('/tenant-admin');
      else navigate('/member');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (tenantLoading) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-secondary)', padding: '1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '0.75rem', display: 'inline-flex', marginBottom: '1.5rem' }}>
            {tenant ? <Building size={32} /> : <Shield size={32} />}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {tenant ? tenant.name : 'SocietyPro'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {tenant ? 'Society Management Portal' : 'Sign in to manage your platform'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Email or Phone Number</label>
            <input 
              type="text" 
              placeholder="name@example.com or 9876543210" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
              <a href="#" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.8125rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

          <button className="btn btn-primary" style={{ width: '100%' }} disabled={isLoggingIn}>
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Need a platform account? <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Contact Sales</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
