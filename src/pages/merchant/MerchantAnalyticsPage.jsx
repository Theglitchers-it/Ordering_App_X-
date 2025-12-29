import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  Star,
  Award
} from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';

const MerchantAnalyticsPage = () => {
  const merchantAuth = JSON.parse(localStorage.getItem('merchantAuth') || '{}');
  const merchantId = merchantAuth.merchantId || 'merchant_1';

  const { getOrdersByMerchant } = useOrders();
  const merchantOrders = getOrdersByMerchant(merchantId);

  // Calcola analytics
  const analytics = useMemo(() => {
    // Revenue totale
    const totalRevenue = merchantOrders.reduce((sum, order) => sum + order.total, 0);

    // Ordini completati
    const completedOrders = merchantOrders.filter(o => o.status === 'delivered');
    const completedRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

    // Average Order Value
    const aov = merchantOrders.length > 0 ? totalRevenue / merchantOrders.length : 0;

    // Piatti più venduti
    const dishSales = {};
    merchantOrders.forEach(order => {
      order.items.forEach(item => {
        const dishName = item.name || item.title;
        if (!dishSales[dishName]) {
          dishSales[dishName] = {
            name: dishName,
            quantity: 0,
            revenue: 0,
            image: item.image
          };
        }
        dishSales[dishName].quantity += item.quantity;
        dishSales[dishName].revenue += item.price * item.quantity;
      });
    });

    const topDishes = Object.values(dishSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Tavoli più attivi
    const tableSales = {};
    merchantOrders.forEach(order => {
      if (order.tableNumber) {
        if (!tableSales[order.tableNumber]) {
          tableSales[order.tableNumber] = {
            tableNumber: order.tableNumber,
            orders: 0,
            revenue: 0
          };
        }
        tableSales[order.tableNumber].orders += 1;
        tableSales[order.tableNumber].revenue += order.total;
      }
    });

    const topTables = Object.values(tableSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Orari di punta (distribuzione ordini per ora)
    const hourlyDistribution = new Array(24).fill(0);
    merchantOrders.forEach(order => {
      const hour = new Date(order.timestamp).getHours();
      hourlyDistribution[hour] += 1;
    });

    const peakHours = hourlyDistribution
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Revenue ultimi 7 giorni
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayRevenue = merchantOrders
        .filter(order => order.timestamp.startsWith(dateStr))
        .reduce((sum, order) => sum + order.total, 0);

      last7Days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('it-IT', { weekday: 'short' }),
        revenue: dayRevenue
      });
    }

    return {
      totalRevenue,
      completedRevenue,
      totalOrders: merchantOrders.length,
      completedOrders: completedOrders.length,
      aov,
      topDishes,
      topTables,
      peakHours,
      last7Days
    };
  }, [merchantOrders]);

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
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Performance del tuo ristorante</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Revenue Totale</h3>
            <p className="text-3xl font-bold text-gray-900">€{analytics.totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">{analytics.totalOrders} ordini totali</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Ordini Completati</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.completedOrders}</p>
            <p className="text-sm text-gray-500 mt-2">€{analytics.completedRevenue.toFixed(2)} revenue</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <Star className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Scontrino Medio (AOV)</h3>
            <p className="text-3xl font-bold text-gray-900">€{analytics.aov.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">Per ordine</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <Award className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Piatti Venduti</h3>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.topDishes.reduce((sum, dish) => sum + dish.quantity, 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">{analytics.topDishes.length} piatti diversi</p>
          </motion.div>
        </div>

        {/* Revenue Last 7 Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Ultimi 7 Giorni</h2>
          <div className="space-y-3">
            {analytics.last7Days.map((day, index) => {
              const maxRevenue = Math.max(...analytics.last7Days.map(d => d.revenue));
              const widthPercent = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={index} className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600 w-12">{day.dayName}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-900">
                      €{day.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top 10 Piatti */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Award className="w-6 h-6 text-primary" />
              <span>Top 10 Piatti Più Venduti</span>
            </h2>
            <div className="space-y-4">
              {analytics.topDishes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nessun dato disponibile</p>
              ) : (
                analytics.topDishes.map((dish, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{dish.name}</p>
                      <p className="text-xs text-gray-500">{dish.quantity} venduti · €{dish.revenue.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{dish.quantity}</p>
                      <p className="text-xs text-gray-500">pz</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Orari di Punta */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Clock className="w-6 h-6 text-primary" />
              <span>Orari di Punta</span>
            </h2>
            <div className="space-y-4">
              {analytics.peakHours.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nessun dato disponibile</p>
              ) : (
                analytics.peakHours.map((hourData, index) => {
                  const maxCount = Math.max(...analytics.peakHours.map(h => h.count));
                  const widthPercent = (hourData.count / maxCount) * 100;

                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-600 w-16">
                        {String(hourData.hour).padStart(2, '0')}:00
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPercent}%` }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-900">
                          {hourData.count} ordini
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* Tavoli Più Attivi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Users className="w-6 h-6 text-primary" />
            <span>Top 5 Tavoli Più Attivi</span>
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {analytics.topTables.length === 0 ? (
              <div className="col-span-5 text-gray-500 text-center py-8">Nessun dato disponibile</div>
            ) : (
              analytics.topTables.map((table, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center border-2 border-blue-200"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-2xl">#{table.tableNumber}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{table.orders} ordini</p>
                  <p className="text-xs text-gray-600">€{table.revenue.toFixed(2)}</p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MerchantAnalyticsPage;
