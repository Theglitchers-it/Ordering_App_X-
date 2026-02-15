import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Users,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import { useSocket } from '../../hooks/useSocket';

const MerchantOrdersPage = () => {
  const merchantAuth = JSON.parse(localStorage.getItem('merchantAuth') || '{}');
  const merchantId = merchantAuth.merchantId || 'merchant_1';

  const { orders, updateOrderStatus, getOrdersByMerchant, loadOrdersByMerchant, refreshOrders } = useOrders();

  // Socket.io real-time
  const { connected: socketConnected, enabled: socketEnabled, setCallback } = useSocket({ merchantId });

  // Refresh orders from API on mount and when socket receives new order
  useEffect(() => {
    if (merchantId) loadOrdersByMerchant(merchantId);
  }, [merchantId]);

  // Listen for real-time events
  useEffect(() => {
    setCallback('onNewOrder', () => {
      loadOrdersByMerchant(merchantId);
    });
    setCallback('onOrderStatusUpdate', () => {
      loadOrdersByMerchant(merchantId);
    });
  }, [merchantId, setCallback]);

  const merchantOrders = getOrdersByMerchant(merchantId);

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTable, setSelectedTable] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique table numbers
  const tableNumbers = useMemo(() => {
    const tables = merchantOrders
      .filter(order => order.tableNumber)
      .map(order => order.tableNumber);
    return ['all', ...new Set(tables)].sort((a, b) => {
      if (a === 'all') return -1;
      if (b === 'all') return 1;
      return a - b;
    });
  }, [merchantOrders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return merchantOrders.filter(order => {
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      const matchesTable = selectedTable === 'all' || order.tableNumber === selectedTable;
      const matchesSearch =
        order.orderNumber.toString().includes(searchQuery) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesTable && matchesSearch;
    });
  }, [merchantOrders, selectedStatus, selectedTable, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: merchantOrders.length,
      pending: merchantOrders.filter(o => o.status === 'pending').length,
      preparing: merchantOrders.filter(o => o.status === 'preparing').length,
      ready: merchantOrders.filter(o => o.status === 'ready').length,
      completed: merchantOrders.filter(o => o.status === 'delivered').length
    };
  }, [merchantOrders]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
      case 'preparing':
        return <AlertCircle className="w-4 h-4" />;
      case 'ready':
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'In Attesa',
      confirmed: 'Confermato',
      preparing: 'In Preparazione',
      ready: 'Pronto',
      delivered: 'Consegnato',
      cancelled: 'Annullato'
    };
    return labels[status] || status;
  };

  const handleStatusChange = (orderNumber, newStatus) => {
    updateOrderStatus(orderNumber, newStatus);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/merchant/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ordini</h1>
                <p className="text-gray-600 mt-1">{filteredOrders.length} ordini trovati</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {socketEnabled && (
                <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                  socketConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {socketConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span>{socketConnected ? 'Live' : 'Offline'}</span>
                </span>
              )}
              <button
                onClick={() => loadOrdersByMerchant(merchantId)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Aggiorna</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Totali</span>
              <Users className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">In Attesa</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Preparazione</span>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.preparing}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Pronti</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Completati</span>
              <CheckCircle className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca ordine o cliente..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">In Attesa</option>
                <option value="confirmed">Confermato</option>
                <option value="preparing">In Preparazione</option>
                <option value="ready">Pronto</option>
                <option value="delivered">Consegnato</option>
                <option value="cancelled">Annullato</option>
              </select>
            </div>

            {/* Table Filter */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                {tableNumbers.map(table => (
                  <option key={table} value={table}>
                    {table === 'all' ? 'Tutti i tavoli' : `Tavolo #${table}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessun Ordine Trovato</h3>
              <p className="text-gray-500">Non ci sono ordini che corrispondono ai tuoi filtri.</p>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.orderNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">#{order.orderNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusLabel(order.status)}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>👤 {order.customerName}</span>
                      {order.tableNumber && (
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>Tavolo #{order.tableNumber}</span>
                        </span>
                      )}
                      <span className="text-gray-400">
                        {new Date(order.timestamp).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">€{order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.items.length} articoli</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.name || item.title}
                        </span>
                        <span className="text-gray-900 font-medium">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(order.orderNumber, 'confirmed')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Conferma
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.orderNumber, 'cancelled')}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Rifiuta
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(order.orderNumber, 'preparing')}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Inizia Preparazione
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusChange(order.orderNumber, 'ready')}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Segna come Pronto
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleStatusChange(order.orderNumber, 'delivered')}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Completa Ordine
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantOrdersPage;
