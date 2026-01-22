import { io } from 'socket.io-client';

/**
 * WebSocket Client for Real-time Updates
 * Handles order notifications and live status changes
 */

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const ENABLE_WEBSOCKET = import.meta.env.VITE_ENABLE_WEBSOCKET === 'true';

let socket = null;
let isConnected = false;

/**
 * Initialize WebSocket connection
 */
export const initializeSocket = () => {
  if (!ENABLE_WEBSOCKET) {
    console.log('[Socket] WebSocket disabled in environment');
    return null;
  }

  if (socket && isConnected) {
    console.log('[Socket] Already connected');
    return socket;
  }

  const token = localStorage.getItem('accessToken');

  if (!token) {
    console.log('[Socket] No access token found, skipping socket connection');
    return null;
  }

  console.log('[Socket] Initializing connection to:', SOCKET_URL);

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected successfully');
    isConnected = true;
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
    isConnected = false;
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
    isConnected = false;
  });

  socket.on('error', (error) => {
    console.error('[Socket] Socket error:', error);
  });

  return socket;
};

/**
 * Disconnect WebSocket
 */
export const disconnectSocket = () => {
  if (socket) {
    console.log('[Socket] Disconnecting');
    socket.disconnect();
    socket = null;
    isConnected = false;
  }
};

/**
 * Get current socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = () => {
  return isConnected && socket?.connected;
};

/**
 * Join a specific room (for targeted notifications)
 */
export const joinRoom = (room) => {
  if (socket && isConnected) {
    socket.emit('join-room', room);
    console.log('[Socket] Joined room:', room);
  }
};

/**
 * Leave a specific room
 */
export const leaveRoom = (room) => {
  if (socket && isConnected) {
    socket.emit('leave-room', room);
    console.log('[Socket] Left room:', room);
  }
};

/**
 * Listen for new orders (merchant perspective)
 */
export const onNewOrder = (callback) => {
  if (socket) {
    socket.on('new-order', (data) => {
      console.log('[Socket] New order received:', data.order_number);
      callback(data);
    });
  }
};

/**
 * Listen for order status updates
 */
export const onOrderStatusUpdate = (callback) => {
  if (socket) {
    socket.on('order-status-updated', (data) => {
      console.log('[Socket] Order status updated:', data.order_number, data.order_status);
      callback(data);
    });
  }
};

/**
 * Listen for order cancelled events
 */
export const onOrderCancelled = (callback) => {
  if (socket) {
    socket.on('order-cancelled', (data) => {
      console.log('[Socket] Order cancelled:', data.order_number);
      callback(data);
    });
  }
};

/**
 * Listen for payment confirmed events
 */
export const onPaymentConfirmed = (callback) => {
  if (socket) {
    socket.on('payment-confirmed', (data) => {
      console.log('[Socket] Payment confirmed:', data.order_number);
      callback(data);
    });
  }
};

/**
 * Listen for table status updates
 */
export const onTableStatusUpdate = (callback) => {
  if (socket) {
    socket.on('table-status-updated', (data) => {
      console.log('[Socket] Table status updated:', data.table_number);
      callback(data);
    });
  }
};

/**
 * Remove all event listeners
 */
export const removeAllListeners = () => {
  if (socket) {
    socket.off('new-order');
    socket.off('order-status-updated');
    socket.off('order-cancelled');
    socket.off('payment-confirmed');
    socket.off('table-status-updated');
    console.log('[Socket] Removed all listeners');
  }
};

/**
 * Reconnect socket with new token (after login)
 */
export const reconnectWithToken = () => {
  disconnectSocket();
  return initializeSocket();
};

export default {
  initializeSocket,
  disconnectSocket,
  getSocket,
  isSocketConnected,
  joinRoom,
  leaveRoom,
  onNewOrder,
  onOrderStatusUpdate,
  onOrderCancelled,
  onPaymentConfirmed,
  onTableStatusUpdate,
  removeAllListeners,
  reconnectWithToken
};
