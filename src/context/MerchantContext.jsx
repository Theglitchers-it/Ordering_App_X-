import React, { createContext, useState, useContext, useEffect } from 'react';
import { merchants as initialMerchants } from '../data/merchants';
import { generateSlugFromName } from '../utils/tenantUtils';

const MerchantContext = createContext();

export const useMerchant = () => {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
};

export const MerchantProvider = ({ children }) => {
  const [merchants, setMerchants] = useState(() => {
    const stored = localStorage.getItem('merchants');
    return stored ? JSON.parse(stored) : initialMerchants;
  });

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('merchants', JSON.stringify(merchants));
  }, [merchants]);

  const addMerchant = (merchantData) => {
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

  const updateMerchant = (merchantId, updates) => {
    setMerchants(prev =>
      prev.map(m => (m.id === merchantId ? { ...m, ...updates } : m))
    );
  };

  const deleteMerchant = (merchantId) => {
    setMerchants(prev => prev.filter(m => m.id !== merchantId));
  };

  const getMerchantById = (merchantId) => {
    return merchants.find(m => m.id === merchantId);
  };

  const approveMerchant = (merchantId) => {
    updateMerchant(merchantId, { status: 'active' });
  };

  const blockMerchant = (merchantId) => {
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
    addMerchant,
    updateMerchant,
    deleteMerchant,
    getMerchantById,
    approveMerchant,
    blockMerchant,
    getActiveMerchants,
    getPendingMerchants,
    getPlatformStats
  };

  return (
    <MerchantContext.Provider value={value}>
      {children}
    </MerchantContext.Provider>
  );
};

export default MerchantContext;
