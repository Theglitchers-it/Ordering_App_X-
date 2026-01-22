import { useState, useEffect } from 'react';
import * as orderService from '../../api/orderService';
import {
  initializeSocket,
  onNewOrder,
  onOrderStatusUpdate,
  onOrderCancelled,
  removeAllListeners,
} from '../../api/socketClient';

/**
 * Hook for fetching orders with real-time updates
 *
 * Usage:
 * const { orders, loading, error, createOrder, updateStatus } = useOrders({ merchant_id: 1 });
 */
export function useOrders(filters = {}, enableRealtime = true) {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await orderService.getOrders({
        ...filters,
        ...customFilters,
      });

      if (result.success) {
        setOrders(result.orders || []);
        setPagination(result.pagination);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const result = await orderService.createOrder(orderData);

      if (result.success) {
        // Add to local state
        setOrders((prev) => [result.order, ...prev]);
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const result = await orderService.updateOrderStatus(orderId, newStatus);

      if (result.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? result.order : o))
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const cancelOrder = async (orderId, reason) => {
    try {
      const result = await orderService.cancelOrder(orderId, reason);

      if (result.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? result.order : o))
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Setup real-time WebSocket listeners
  useEffect(() => {
    if (!enableRealtime) return;

    // Initialize socket
    initializeSocket();

    // Listen for new orders
    onNewOrder((orderData) => {
      console.log('[useOrders] New order received:', orderData);

      // Check if order matches filters
      const matchesFilters =
        !filters.merchant_id || orderData.merchant_id === filters.merchant_id;

      if (matchesFilters) {
        setOrders((prev) => {
          // Check if order already exists
          const exists = prev.some((o) => o.id === orderData.id);
          if (exists) return prev;

          return [orderData, ...prev];
        });
      }
    });

    // Listen for status updates
    onOrderStatusUpdate((orderData) => {
      console.log('[useOrders] Order status updated:', orderData);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderData.id ? orderData : o))
      );
    });

    // Listen for cancellations
    onOrderCancelled((orderData) => {
      console.log('[useOrders] Order cancelled:', orderData);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderData.id ? orderData : o))
      );
    });

    // Cleanup listeners on unmount
    return () => {
      if (enableRealtime) {
        removeAllListeners();
      }
    };
  }, [enableRealtime, filters.merchant_id]);

  // Fetch initial data
  useEffect(() => {
    fetchOrders();
  }, [JSON.stringify(filters)]);

  return {
    orders,
    pagination,
    loading,
    error,
    refresh: fetchOrders,
    createOrder,
    updateStatus,
    cancelOrder,
  };
}

/**
 * Hook for fetching single order
 */
export function useOrder(orderId) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await orderService.getOrderById(orderId);

      if (result.success) {
        setOrder(result.order);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Listen for real-time updates on this specific order
  useEffect(() => {
    if (!orderId) return;

    initializeSocket();

    onOrderStatusUpdate((orderData) => {
      if (orderData.id === orderId) {
        setOrder(orderData);
      }
    });

    return () => {
      removeAllListeners();
    };
  }, [orderId]);

  return {
    order,
    loading,
    error,
    refresh: fetchOrder,
  };
}

export default useOrders;
