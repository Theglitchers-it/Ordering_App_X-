import { useState, useEffect } from 'react';
import * as merchantService from '../../api/merchantService';

/**
 * Hook for merchant operations
 *
 * Usage:
 * const { merchant, loading, error, refresh, update } = useMerchant();
 */
export function useMerchant() {
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMerchant = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await merchantService.getMyMerchant();

      if (result.success) {
        setMerchant(result.merchant);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load merchant');
    } finally {
      setLoading(false);
    }
  };

  const updateMerchant = async (updates) => {
    if (!merchant) return { success: false, message: 'No merchant loaded' };

    try {
      const result = await merchantService.updateMerchant(merchant.id, updates);

      if (result.success) {
        setMerchant(result.merchant);
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    fetchMerchant();
  }, []);

  return {
    merchant,
    loading,
    error,
    refresh: fetchMerchant,
    update: updateMerchant,
  };
}

/**
 * Hook for merchant statistics
 */
export function useMerchantStats(merchantId) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await merchantService.getMerchantStats(merchantId);

      if (result.success) {
        setStats(result.stats);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [merchantId]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}

/**
 * Hook for fetching merchants list (admin use)
 */
export function useMerchants(filters = {}) {
  const [merchants, setMerchants] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMerchants = async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await merchantService.getMerchants({
        ...filters,
        ...customFilters,
      });

      if (result.success) {
        setMerchants(result.merchants);
        setPagination(result.pagination);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  const approveMerchant = async (merchantId) => {
    try {
      const result = await merchantService.approveMerchant(merchantId);

      if (result.success) {
        // Update local state
        setMerchants((prev) =>
          prev.map((m) =>
            m.id === merchantId ? { ...m, status: 'active' } : m
          )
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const blockMerchant = async (merchantId) => {
    try {
      const result = await merchantService.blockMerchant(merchantId);

      if (result.success) {
        // Update local state
        setMerchants((prev) =>
          prev.map((m) =>
            m.id === merchantId ? { ...m, status: 'blocked' } : m
          )
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, [JSON.stringify(filters)]);

  return {
    merchants,
    pagination,
    loading,
    error,
    refresh: fetchMerchants,
    approveMerchant,
    blockMerchant,
  };
}

export default useMerchant;
