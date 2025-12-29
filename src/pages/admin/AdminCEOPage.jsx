import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Globe,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'
import { useRBAC } from '../../context/RBACContext'
import { PERMISSIONS } from '../../context/RBACContext'
import { useOrders } from '../../context/OrdersContext'

const AdminCEOPage = () => {
  const { hasPermission } = useRBAC()
  const { orders } = useOrders()
  const [timeRange, setTimeRange] = useState('month')

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.VIEW_DASHBOARD)) {
      alert('Non hai il permesso di accedere a questa sezione')
      window.location.href = '/admin/dashboard'
    }
  }, [hasPermission])

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const completedOrders = orders.filter(o => o.status === 'delivered').length
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders * 100) : 0

  // Growth metrics (simulated)
  const metrics = {
    revenue: { value: totalRevenue, growth: 23.5, target: 50000, achieved: (totalRevenue / 50000) * 100 },
    orders: { value: totalOrders, growth: 18.3, target: 1000, achieved: (totalOrders / 1000) * 100 },
    customers: { value: 342, growth: 15.2, target: 500, achieved: (342 / 500) * 100 },
    satisfaction: { value: 4.7, growth: 8.1, target: 5.0, achieved: (4.7 / 5.0) * 100 }
  }

  // Strategic priorities
  const priorities = [
    {
      title: 'Espansione Geografica',
      description: 'Apertura 5 nuove città entro Q2',
      progress: 40,
      status: 'on-track',
      owner: 'Team Expansion',
      deadline: '30 Apr 2025'
    },
    {
      title: 'Partnership Strategiche',
      description: 'Accordi con top 10 brand nazionali',
      progress: 65,
      status: 'on-track',
      owner: 'Business Dev',
      deadline: '31 Mar 2025'
    },
    {
      title: 'Ottimizzazione Costi',
      description: 'Riduzione delivery cost del 15%',
      progress: 85,
      status: 'ahead',
      owner: 'Operations',
      deadline: '28 Feb 2025'
    },
    {
      title: 'Customer Retention',
      description: 'Aumentare repeat rate al 45%',
      progress: 30,
      status: 'at-risk',
      owner: 'Marketing',
      deadline: '30 Jun 2025'
    }
  ]

  // Key insights
  const insights = [
    {
      type: 'success',
      icon: CheckCircle,
      title: 'Revenue Target Superato',
      description: 'Fatturato mensile +23.5% rispetto al target',
      action: 'Mantieni momentum'
    },
    {
      type: 'warning',
      icon: AlertCircle,
      title: 'Customer Retention Basso',
      description: 'Solo 32% di clienti ritorna dopo primo ordine',
      action: 'Implementa loyalty program'
    },
    {
      type: 'info',
      icon: Zap,
      title: 'Picco Ordini Weekend',
      description: '67% ordini concentrati Ven-Dom',
      action: 'Ottimizza staffing'
    },
    {
      type: 'success',
      icon: Award,
      title: 'Soddisfazione Clienti Alta',
      description: 'Rating medio 4.7/5 su tutte le piattaforme',
      action: 'Mantieni qualità'
    }
  ]

  // Competitive analysis
  const competitors = [
    { name: 'Deliveroo', marketShare: 28, growth: 12, strength: 'Brand awareness', weakness: 'Commissioni alte' },
    { name: 'Just Eat', marketShare: 35, growth: 8, strength: 'Merchant base', weakness: 'UX datata' },
    { name: 'Uber Eats', marketShare: 25, growth: 15, strength: 'Tecnologia', weakness: 'Pricing' },
    { name: 'Glovo', marketShare: 12, growth: 20, strength: 'Multi-servizio', weakness: 'Focus disperso' }
  ]

  return (
    <AdminLayoutNew>
      <div className="space-y-4 md:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
              <Target className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
              CEO Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Vista strategica e KPI aziendali</p>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
          >
            <option value="week">Questa Settimana</option>
            <option value="month">Questo Mese</option>
            <option value="quarter">Questo Trimestre</option>
            <option value="year">Quest'Anno</option>
          </select>
        </div>

        {/* Executive Summary Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              {metrics.revenue.growth > 0 ? (
                <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm font-semibold">
                  <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                  +{metrics.revenue.growth}%
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600 text-xs md:text-sm font-semibold">
                  <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4" />
                  {metrics.revenue.growth}%
                </div>
              )}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">€{metrics.revenue.value.toFixed(0)}</h3>
            <p className="text-gray-600 text-xs md:text-sm mt-1">Revenue Totale</p>
            <div className="mt-3 md:mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="truncate">Target: €{metrics.revenue.target.toLocaleString()}</span>
                <span className="ml-2">{metrics.revenue.achieved.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, metrics.revenue.achieved)}%` }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm font-semibold">
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                +{metrics.orders.growth}%
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{metrics.orders.value}</h3>
            <p className="text-gray-600 text-xs md:text-sm mt-1">Ordini Totali</p>
            <div className="mt-3 md:mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Target: {metrics.orders.target}</span>
                <span className="ml-2">{metrics.orders.achieved.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, metrics.orders.achieved)}%` }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm font-semibold">
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                +{metrics.customers.growth}%
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{metrics.customers.value}</h3>
            <p className="text-gray-600 text-xs md:text-sm mt-1">Clienti Attivi</p>
            <div className="mt-3 md:mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Target: {metrics.customers.target}</span>
                <span className="ml-2">{metrics.customers.achieved.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, metrics.customers.achieved)}%` }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm font-semibold">
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                +{metrics.satisfaction.growth}%
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{metrics.satisfaction.value}/5.0</h3>
            <p className="text-gray-600 text-xs md:text-sm mt-1">Soddisfazione Cliente</p>
            <div className="mt-3 md:mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Target: {metrics.satisfaction.target}</span>
                <span className="ml-2">{metrics.satisfaction.achieved.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, metrics.satisfaction.achieved)}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Strategic Priorities - Mobile Optimized */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Target className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Priorità Strategiche</h2>
          </div>
          <div className="space-y-3 md:space-y-4">
            {priorities.map((priority, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-3 md:p-4"
              >
                {/* Header Mobile-First */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div className="flex-1">
                    {/* Title + Badge Stack su Mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{priority.title}</h3>
                      {priority.status === 'on-track' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full self-start whitespace-nowrap">On Track</span>
                      )}
                      {priority.status === 'ahead' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full self-start whitespace-nowrap">Ahead</span>
                      )}
                      {priority.status === 'at-risk' && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full self-start whitespace-nowrap">At Risk</span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-gray-600">{priority.description}</p>
                  </div>
                  <div className="text-left sm:text-right sm:ml-4">
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{priority.progress}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      priority.status === 'ahead'
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : priority.status === 'at-risk'
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                    style={{ width: `${priority.progress}%` }}
                  />
                </div>

                {/* Footer - Stack su Mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs md:text-sm">
                  <span className="text-gray-600">
                    Owner: <span className="font-medium text-gray-900">{priority.owner}</span>
                  </span>
                  <span className="text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    {priority.deadline}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Insights Chiave</h2>
            </div>
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const Icon = insight.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      insight.type === 'success'
                        ? 'bg-green-50 border-green-200'
                        : insight.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`w-5 h-5 mt-0.5 ${
                          insight.type === 'success'
                            ? 'text-green-600'
                            : insight.type === 'warning'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                        <p className="text-xs font-medium text-gray-600">→ {insight.action}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Competitive Analysis */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Analisi Competitiva</h2>
            </div>
            <div className="space-y-4">
              {competitors.map((comp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{comp.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Market Share:</span>
                      <span className="font-bold text-gray-900">{comp.marketShare}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Crescita:</p>
                      <p className="font-semibold text-green-600">+{comp.growth}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Forza:</p>
                      <p className="font-semibold text-gray-900">{comp.strength}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">Debolezza: <span className="text-red-600 font-medium">{comp.weakness}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutNew>
  )
}

export default AdminCEOPage
