import React, { createContext, useState, useContext, useEffect } from 'react';
import { merchants as initialMerchants } from '../data/merchants';
import { generateSlugFromName } from '../utils/tenantUtils';
import * as merchantService from '../api/merchantService';

const USE_API = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined';

const MerchantContext = createContext();

export const useMerchant = () => {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
};

// Normalize API merchant to frontend format
const normalizeMerchant = (apiMerchant) => ({
  id: apiMerchant.id,
  name: apiMerchant.business_name || apiMerchant.name,
  slug: apiMerchant.slug,
  status: apiMerchant.status || 'active',
  email: apiMerchant.email || apiMerchant.contact_email,
  phone: apiMerchant.phone || apiMerchant.contact_phone,
  address: apiMerchant.address,
  city: apiMerchant.city,
  logo: apiMerchant.logo_url || apiMerchant.logo,
  brandColors: apiMerchant.brand_colors || apiMerchant.brandColors || { primary: '#FF6B35', secondary: '#F7931E' },
  subscription: apiMerchant.subscription || { plan: 'starter', price: 29 },
  settings: apiMerchant.settings || { commissionRate: 0.10 },
  stats: {
    totalOrders: apiMerchant.stats?.totalOrders || apiMerchant.total_orders || 0,
    totalRevenue: apiMerchant.stats?.totalRevenue || apiMerchant.total_revenue || 0,
    avgRating: apiMerchant.stats?.avgRating || apiMerchant.average_rating || 0,
    reviewCount: apiMerchant.stats?.reviewCount || apiMerchant.review_count || 0,
    registeredDate: apiMerchant.created_at || apiMerchant.stats?.registeredDate
  },
  createdAt: apiMerchant.created_at || apiMerchant.createdAt
});

export const MerchantProvider = ({ children }) => {
  const [merchants, setMerchants] = useState(() => {
    if (USE_API) return [];
    const stored = localStorage.getItem('merchants');
    return stored ? JSON.parse(stored) : initialMerchants;
  });

  const [loading, setLoading] = useState(false);

  // API mode: load merchants on mount
  useEffect(() => {
    if (USE_API) {
      loadMerchantsFromAPI();
    }
  }, []);

  // Demo mode: persist to localStorage
  useEffect(() => {
    if (!USE_API) {
      localStorage.setItem('merchants', JSON.stringify(merchants));
    }
  }, [merchants]);

  const loadMerchantsFromAPI = async () => {
    setLoading(true);
    try {
      const result = await merchantService.getMerchants({ limit: 100 });
      if (result.success && result.merchants?.length > 0) {
        setMerchants(result.merchants.map(normalizeMerchant));
      } else {
        // Fallback to static data
        setMerchants(initialMerchants);
      }
    } catch {
      setMerchants(initialMerchants);
    }
    setLoading(false);
  };

  const addMerchant = async (merchantData) => {
    if (USE_API) {
      setLoading(true);
      try {
        const result = await merchantService.createMerchant({
          business_name: merchantData.name,
          slug: merchantData.slug || generateSlugFromName(merchantData.name),
          contact_email: merchantData.email,
          contact_phone: merchantData.phone,
          address: merchantData.address,
          city: merchantData.city
        });
        setLoading(false);
        if (result.success) {
          const normalized = normalizeMerchant(result.merchant);
          setMerchants(prev => [...prev, normalized]);
          return normalized;
        }
        return null;
      } catch {
        setLoading(false);
        return null;
      }
    }

    // Demo mode
    const newMerchant = {
      id: `merchant_${Date.now()}`,
      slug: merchantData.slug || generateSlugFromName(merchantData.name),
      status: 'pending_approval',
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        avgRating: 0,
        reviewCount: 0,
        registeredDate: new Date().toISOString().split('T')[0]
      },
      ...merchantData,
      createdAt: new Date().toISOString()
    };

    setMerchants(prev => [...prev, newMerchant]);
    return newMerchant;
  };

  const updateMerchant = async (merchantId, updates) => {
    if (USE_API) {
      const result = await merchantService.updateMerchant(merchantId, updates);
      if (result.success) {
        setMerchants(prev =>
          prev.map(m => (m.id === merchantId ? { ...m, ...normalizeMerchant(result.merchant) } : m))
        );
        return;
      }
    }
    setMerchants(prev =>
      prev.map(m => (m.id === merchantId ? { ...m, ...updates } : m))
    );
  };

  const deleteMerchant = async (merchantId) => {
    if (USE_API) {
      await merchantService.deleteMerchant(merchantId);
    }
    setMerchants(prev => prev.filter(m => m.id !== merchantId));
  };

  const getMerchantById = (merchantId) => {
    return merchants.find(m => m.id === merchantId);
  };

  const approveMerchant = async (merchantId) => {
    if (USE_API) {
      const result = await merchantService.approveMerchant(merchantId);
      if (result.success) {
        setMerchants(prev =>
          prev.map(m => (m.id === merchantId ? { ...m, status: 'active' } : m))
        );
        return;
      }
    }
    updateMerchant(merchantId, { status: 'active' });
  };

  const blockMerchant = async (merchantId) => {
    if (USE_API) {
      const result = await merchantService.blockMerchant(merchantId);
      if (result.success) {
        setMerchants(prev =>
          prev.map(m => (m.id === merchantId ? { ...m, status: 'blocked' } : m))
        );
        return;
      }
    }
    updateMerchant(merchantId, { status: 'blocked' });
  };

  const getActiveMerchants = () => {
    return merchants.filter(m => m.status === 'active');
  };

  const getPendingMerchants = () => {
    return merchants.filter(m => m.status === 'pending_approval');
  };

  // Platform stats
  const getPlatformStats = () => {
    const activeMerchants = getActiveMerchants();
    const totalRevenue = merchants.reduce((sum, m) => sum + (m.stats?.totalRevenue || 0), 0);
    const totalCommissions = merchants.reduce((sum, m) => {
      const revenue = m.stats?.totalRevenue || 0;
      const rate = m.settings?.commissionRate || 0.10;
      return sum + (revenue * rate);
    }, 0);
    const totalMRR = activeMerchants.reduce((sum, m) => sum + (m.subscription?.price || 0), 0);

    return {
      totalMerchants: merchants.length,
      activeMerchants: activeMerchants.length,
      pendingMerchants: getPendingMerchants().length,
      totalRevenue,
      totalCommissions,
      mrr: totalMRR,
      netProfit: totalCommissions + totalMRR
    };
  };

  const value = {
    merchants,
    loading,
    addMerchant,
    updateMerchant,
    deleteMerchant,
    getMerchantById,
    approveMerchant,
    blockMerchant,
    getActiveMerchants,
    getPendingMerchants,
    getPlatformStats,
    refreshMerchants: loadMerchantsFromAPI
  };

  return (
    <MerchantContext.Provider value={value}>
      {children}
    </MerchantContext.Provider>
  );
};

export default MerchantContext;
