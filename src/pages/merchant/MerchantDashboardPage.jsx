import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  TrendingUp,
  Euro,
  Users
} from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import { useTables } from '../../hooks/useTables';

const MerchantDashboardPage = () => {
  const navigate = useNavigate();

  // Get merchant from localStorage
  const merchantAuth = JSON.parse(localStorage.getItem('merchantAuth') || '{}');
  const merchantId = merchantAuth.merchantId;

  if (!merchantId) {
    navigate('/merchant/register');
    return null;
  }

  const { getOrdersByMerchant, loadOrdersByMerchant } = useOrders();
  const { stats: tableStats } = useTables(merchantId);

  useEffect(() => {
    if (merchantId) loadOrdersByMerchant(merchantId);
  }, [merchantId]);

  const merchantOrders = getOrdersByMerchant(merchantId);

  // Real stats computed from context data
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = merchantOrders.filter(o => o.timestamp?.startsWith(today));
    const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready'];
    return {
      ordersToday: todayOrders.length,
      revenueToday: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      activeOrders: merchantOrders.filter(o => activeStatuses.includes(o.status)).length,
      occupiedTables: tableStats.occupied || 0,
      totalTables: tableStats.total || 20
    };
  }, [merchantOrders, tableStats]);

  const menuItems = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'Panoramica e statistiche',
      href: '/merchant/dashboard',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: ShoppingBag,
      title: 'Ordini',
      description: 'Gestisci ordini in arrivo',
      href: '/merchant/orders',
      color: 'from-green-500 to-green-600',
      badge: stats.activeOrders
    },
    {
      icon: UtensilsCrossed,
      title: 'Menu Builder',
      description: 'Crea e modifica il tuo menu',
      href: '/merchant/menu',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: QrCode,
      title: 'Tavoli & QR Codes',
      description: 'Gestisci tavoli e QR codes',
      href: '/merchant/tables',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Report e statistiche',
      href: '/merchant/analytics',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Settings,
      title: 'Impostazioni',
      description: 'Configura il tuo locale',
      href: '/merchant/settings',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('merchantAuth');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Merchant Dashboard</h1>
              <p className="text-gray-600 mt-1">Gestisci il tuo ristorante</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Ordini Oggi</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.ordersToday}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Euro className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Revenue Oggi</h3>
            <p className="text-3xl font-bold text-gray-900">€{stats.revenueToday}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              {stats.activeOrders > 0 && (
                <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                  {stats.activeOrders} attivi
                </span>
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Ordini Attivi</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.activeOrders}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Tavoli Occupati</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.occupiedTables}/{stats.totalTables}</p>
          </motion.div>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link
                  to={item.href}
                  className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    {item.badge && (
                      <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboardPage;
