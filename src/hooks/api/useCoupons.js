import { useState, useEffect, useCallback } from 'react';
import * as couponService from '../../api/couponService';

/**
 * Hook for fetching and managing coupons (admin/merchant view)
 *
 * Usage:
 * const { coupons, loading, error, refresh, createCoupon, ... } = useCoupons({ merchant_id: 1 });
 */
export function useCoupons(filters = {}) {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoupons = useCallback(async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await couponService.getCoupons({
        ...filters,
        ...customFilters,
      });

      if (result.success) {
        setCoupons(result.coupons || []);
        setPagination(result.pagination);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  const createCoupon = async (couponData) => {
    try {
      const result = await couponService.createCoupon(couponData);

      if (result.success) {
        // Add to local state
        setCoupons((prev) => [result.coupon, ...prev]);
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateCoupon = async (couponId, updates) => {
    try {
      const result = await couponService.updateCoupon(couponId, updates);

      if (result.success) {
        // Update local state
        setCoupons((prev) =>
          prev.map((c) => (c.id === couponId ? result.coupon : c))
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteCoupon = async (couponId) => {
    try {
      const result = await couponService.deleteCoupon(couponId);

      if (result.success) {
        if (result.deactivated) {
          // Coupon was deactivated, not deleted - update state
          setCoupons((prev) =>
            prev.map((c) => (c.id === couponId ? { ...c, is_active: false } : c))
          );
        } else {
          // Remove from local state
          setCoupons((prev) => prev.filter((c) => c.id !== couponId));
        }
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const toggleStatus = async (couponId) => {
    try {
      const result = await couponService.toggleCouponStatus(couponId);

      if (result.success) {
        // Update local state
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === couponId
              ? { ...c, is_active: result.coupon.is_active }
              : c
          )
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const getCouponStats = async (couponId) => {
    try {
      const result = await couponService.getCouponStats(couponId);
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return {
    coupons,
    pagination,
    loading,
    error,
    refresh: fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleStatus,
    getCouponStats,
  };
}

/**
 * Hook for fetching single coupon details
 */
export function useCoupon(couponId) {
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoupon = useCallback(async () => {
    if (!couponId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await couponService.getCouponById(couponId);

      if (result.success) {
        setCoupon(result.coupon);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load coupon');
    } finally {
      setLoading(false);
    }
  }, [couponId]);

  useEffect(() => {
    fetchCoupon();
  }, [fetchCoupon]);

  return {
    coupon,
    loading,
    error,
    refresh: fetchCoupon,
  };
}

/**
 * Hook for available coupons (customer view)
 */
export function useAvailableCoupons(merchantId = null) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAvailableCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await couponService.getAvailableCoupons(merchantId);

      if (result.success) {
        setCoupons(result.coupons || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load available coupons');
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchAvailableCoupons();
  }, [fetchAvailableCoupons]);

  return {
    coupons,
    loading,
    error,
    refresh: fetchAvailableCoupons,
  };
}

/**
 * Hook for coupon validation and application
 */
export function useCouponValidation() {
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);

  const validateCoupon = async (code, orderTotal, merchantId = null, userId = null) => {
    try {
      setValidating(true);
      setError(null);

      const result = await couponService.validateCoupon(code, orderTotal, merchantId, userId);

      if (result.success && result.valid) {
        setAppliedCoupon(result.coupon);
        setDiscount(result.discount_amount);
        return {
          success: true,
          valid: true,
          coupon: result.coupon,
          discount_amount: result.discount_amount,
          new_total: result.new_total
        };
      } else {
        setError(result.message);
        return {
          success: false,
          valid: false,
          message: result.message
        };
      }
    } catch (err) {
      const message = err.message || 'Failed to validate coupon';
      setError(message);
      return { success: false, valid: false, message };
    } finally {
      setValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setError(null);
  };

  const applyCouponToOrder = async (orderId) => {
    if (!appliedCoupon) {
      return { success: false, message: 'No coupon applied' };
    }

    try {
      const result = await couponService.applyCouponToOrder(
        appliedCoupon.id,
        orderId,
        discount
      );

      if (result.success) {
        // Clear the applied coupon after successful application
        removeCoupon();
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const calculateDiscount = (total) => {
    if (!appliedCoupon) return 0;

    let calculatedDiscount = 0;

    if (appliedCoupon.discount_type === 'percentage') {
      calculatedDiscount = (total * parseFloat(appliedCoupon.discount_value)) / 100;
      if (appliedCoupon.max_discount_amount) {
        calculatedDiscount = Math.min(calculatedDiscount, parseFloat(appliedCoupon.max_discount_amount));
      }
    } else if (appliedCoupon.discount_type === 'fixed_amount') {
      calculatedDiscount = Math.min(parseFloat(appliedCoupon.discount_value), total);
    }

    return Math.round(calculatedDiscount * 100) / 100;
  };

  return {
    appliedCoupon,
    discount,
    validating,
    error,
    validateCoupon,
    removeCoupon,
    applyCouponToOrder,
    calculateDiscount,
  };
}

export default useCoupons;
