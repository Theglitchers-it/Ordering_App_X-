import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMerchantBySlug, merchants } from '../data/merchants';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [currentMerchant, setCurrentMerchant] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detect merchant from URL or localStorage on mount
  useEffect(() => {
    detectMerchantFromEnvironment();
  }, []);

  const detectMerchantFromEnvironment = () => {
    setLoading(true);

    // 1. Try to get from URL params (for QR code scan)
    const urlParams = new URLSearchParams(window.location.search);
    const merchantSlugFromUrl = urlParams.get('merchant');
    const tableFromUrl = urlParams.get('table');

    // 2. Try to extract from path (e.g., /pizzeria-rossi/...)
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const potentialSlug = pathParts[0];

    // 3. Try to get from localStorage (persistence)
    const storedMerchantId = localStorage.getItem('currentMerchantId');
    const storedTableNumber = localStorage.getItem('tableNumber');

    // Priority: URL param > Path > localStorage
    let merchantSlug = merchantSlugFromUrl || potentialSlug;

    if (merchantSlug) {
      const merchant = getMerchantBySlug(merchantSlug);
      if (merchant) {
        setCurrentMerchant(merchant);
        localStorage.setItem('currentMerchantId', merchant.id);

        // Set table number if available
        if (tableFromUrl) {
          setTableNumber(parseInt(tableFromUrl));
          localStorage.setItem('tableNumber', tableFromUrl);
        } else if (storedTableNumber) {
          setTableNumber(parseInt(storedTableNumber));
        }
      }
    } else if (storedMerchantId) {
      // Fallback to localStorage
      const merchant = merchants.find(m => m.id === storedMerchantId);
      if (merchant) {
        setCurrentMerchant(merchant);
        if (storedTableNumber) {
          setTableNumber(parseInt(storedTableNumber));
        }
      }
    }

    setLoading(false);
  };

  const switchMerchant = (merchantSlug) => {
    const merchant = getMerchantBySlug(merchantSlug);
    if (merchant) {
      setCurrentMerchant(merchant);
      localStorage.setItem('currentMerchantId', merchant.id);
      // Clear table when switching merchant
      setTableNumber(null);
      localStorage.removeItem('tableNumber');
      return merchant;
    }
    return null;
  };

  const setMerchant = (merchant) => {
    setCurrentMerchant(merchant);
    if (merchant) {
      localStorage.setItem('currentMerchantId', merchant.id);
    } else {
      localStorage.removeItem('currentMerchantId');
    }
  };

  const selectTable = (number) => {
    setTableNumber(number);
    if (number) {
      localStorage.setItem('tableNumber', number.toString());
    } else {
      localStorage.removeItem('tableNumber');
    }
  };

  const clearTenant = () => {
    setCurrentMerchant(null);
    setTableNumber(null);
    localStorage.removeItem('currentMerchantId');
    localStorage.removeItem('tableNumber');
  };

  const isMerchantActive = () => {
    return currentMerchant && currentMerchant.status === 'active';
  };

  const value = {
    // State
    currentMerchant,
    tableNumber,
    loading,

    // Actions
    setMerchant,
    switchMerchant,
    selectTable,
    clearTenant,
    detectMerchantFromEnvironment,

    // Helpers
    isMerchantActive,
    isMultiTenantMode: !!currentMerchant,
    merchantSlug: currentMerchant?.slug || null,
    merchantId: currentMerchant?.id || null
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;
