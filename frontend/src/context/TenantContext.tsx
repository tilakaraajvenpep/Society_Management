import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectTenant = async () => {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      
      let slug = '';

      const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'localhost';

      // 1. Check for subdomain (e.g., gkrnagar.localhost or gkrnagar.societypro.vercel.app)
      if (hostname !== baseDomain && hostname.endsWith('.' + baseDomain)) {
        slug = hostname.substring(0, hostname.length - baseDomain.length - 1);
      } 
      // 2. Fallback: Check for slug in path (e.g., /gkrnagar)
      else if (pathname !== '/' && pathname.split('/').length === 2) {
        const potentialSlug = pathname.split('/')[1];
        if (!['login', 'super-admin', 'tenant-admin', 'member'].includes(potentialSlug)) {
          slug = potentialSlug;
        }
      }

      if (slug) {
        try {
          const response = await axios.get(`/tenants/public/${slug}`);
          setTenant(response.data);
        } catch (err) {
          console.error('Tenant not found or inactive');
          setTenant(null);
        }
      } else {
        setTenant(null);
      }
      setLoading(false);
    };

    detectTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
