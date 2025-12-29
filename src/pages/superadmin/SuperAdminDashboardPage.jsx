import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  ArrowUpRight,
  Building2,
  CreditCard
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';

const SuperAdminDashboardPage = () => {
  const { getPlatformStats, merchants } = useMerchant();
  const stats = getPlatformStats();

  // Top merchants by revenue
  const topMerchants = [...merchants]
    .filter(m => m.status === 'active')
    .sort((a, b) => (b.stats?.totalRevenue || 0) - (a.stats?.totalRevenue || 0))
    .slice(0, 5);

  const kpiCards = [
    {
      title: 'Revenue Totale',
      value: `€${stats.totalRevenue.toLocaleString('it-IT')}`,
      change: '+12%',
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
      trend: 'up'
    },
    {
      title: 'Commissioni Guadagnate',
      value: `€${stats.totalCommissions.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      subtitle: 'Dalle commissioni ordini',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      trend: 'up'
    },
    {
      title: 'MRR Subscriptions',
      value: `€${stats.mrr.toLocaleString('it-IT')}`,
      subtitle: `${stats.activeMerchants} merchant attivi`,
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      trend: 'up'
    },
    {
      title: 'Net Profit',
      value: `€${stats.netProfit.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
      subtitle: 'Commissioni + MRR',
      icon: Building2,
      color: 'from-orange-500 to-orange-600',
      trend: 'up'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Panoramica completa della piattaforma</p>
            </div>
            <Link
              to="/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors duration-200"
            >
              Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${kpi.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {kpi.change && (
                    <span className="text-green-600 text-sm font-semibold flex items-center">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      {kpi.change}
                    </span>
                  )}
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{kpi.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                {kpi.subtitle && (
                  <p className="text-xs text-gray-500">{kpi.subtitle}</p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Merchant Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Merchant Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Merchant Attivi</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeMerchants}</p>
                </div>
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">In Approvazione</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingMerchants}</p>
                </div>
                <ShoppingBag className="w-10 h-10 text-yellow-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Totale Merchant</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalMerchants}</p>
                </div>
                <Building2 className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* Top Merchants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Top 5 Merchant per Revenue</h2>
            <div className="space-y-4">
              {topMerchants.map((merchant, index) => {
                const revenue = merchant.stats?.totalRevenue || 0;
                const commissionRate = merchant.settings?.commissionRate || 0.10;
                const commission = revenue * commissionRate;

                return (
                  <div key={merchant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{merchant.name}</p>
                        <p className="text-xs text-gray-500">{merchant.subscription?.plan}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">€{revenue.toLocaleString('it-IT')}</p>
                      <p className="text-xs text-green-600">
                        +€{commission.toLocaleString('it-IT', { minimumFractionDigits: 2 })} comm.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to="/superadmin/merchants"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition-colors duration-200"
            >
              <h3 className="font-semibold mb-2">Gestisci Merchant</h3>
              <p className="text-sm text-white/80">Approva, blocca o elimina merchant</p>
            </Link>
            <Link
              to="/superadmin/finance"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition-colors duration-200"
            >
              <h3 className="font-semibold mb-2">Finanza</h3>
              <p className="text-sm text-white/80">Report dettagliati revenue e commissioni</p>
            </Link>
            <Link
              to="/superadmin/analytics"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 transition-colors duration-200"
            >
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-white/80">Grafici crescita e performance</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;
