import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Edit, Trash2, Tag, Gift, Award, X, Save, Users
} from 'lucide-react'
import { useCoupons } from '../../context/CouponsContext'
import { useLoyalty } from '../../context/LoyaltyContext'
import AdminLayout from '../../components/admin/AdminLayout'

function AdminCouponsPage() {
  const navigate = useNavigate()
  const { coupons } = useCoupons()
  const { tiers } = useLoyalty()
  const [activeTab, setActiveTab] = useState('coupons')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxUses: '',
    expiryDate: '',
    tierRequired: 'Bronze'
  })

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')
  }, [navigate])

  const handleCreateCoupon = () => {
    console.log('Creating coupon:', formData)
    setShowCreateModal(false)
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '',
      maxUses: '',
      expiryDate: '',
      tierRequired: 'Bronze'
    })
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Coupon & Loyalty</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Gestisci sconti e premi</p>
          </div>
          {activeTab === 'coupons' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-semibold w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Nuovo Coupon</span>
            </button>
          )}
        </div>

        {/* Tabs - Mobile Optimized */}
        <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-200 mb-6 grid grid-cols-2 gap-1">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold rounded-xl transition-all text-sm sm:text-base ${
              activeTab === 'coupons'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Coupon</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold rounded-xl transition-all text-sm sm:text-base ${
              activeTab === 'loyalty'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Programma</span>
              <span className="sm:hidden">Fedeltà</span>
            </div>
          </button>
        </div>

        {activeTab === 'coupons' ? (
          <div>
            {/* Search */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-200 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cerca coupon..."
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Coupons Grid - Mobile Optimized */}
            {filteredCoupons.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm border border-gray-200">
                <Tag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm sm:text-base">Nessun coupon trovato</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredCoupons.map((coupon, index) => (
                  <motion.div
                    key={coupon.code}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-orange-50 p-2 sm:p-3 rounded-xl">
                        <Tag className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        </button>
                        <button className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-mono truncate">{coupon.code}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{coupon.description}</p>

                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Sconto:</span>
                        <span className="font-semibold text-orange-600">
                          {coupon.type === 'percentage' ? `${coupon.discount}%` : `€${coupon.discount}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Min. Spesa:</span>
                        <span className="font-semibold">€{coupon.minOrder}</span>
                      </div>
                      {coupon.requiresTier && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Tier:</span>
                          <span className="px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            {coupon.requiresTier}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Loyalty Tiers - Mobile Optimized */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gradient-to-br ${
                    tier.name === 'Bronze' ? 'from-orange-400 to-orange-600' :
                    tier.name === 'Silver' ? 'from-gray-300 to-gray-500' :
                    tier.name === 'Gold' ? 'from-yellow-400 to-yellow-600' :
                    'from-purple-400 to-purple-600'
                  } rounded-2xl p-4 sm:p-5 text-white shadow-lg`}
                >
                  <Award className="w-8 h-8 sm:w-10 sm:h-10 mb-3" />
                  <h3 className="text-lg sm:text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-white/90 mb-2 text-sm sm:text-base">Sconto: {tier.discount}%</p>
                  <div className="space-y-0.5 text-xs sm:text-sm">
                    <p>Min: {tier.minPoints} pts</p>
                    {tier.maxPoints && <p>Max: {tier.maxPoints} pts</p>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Loyalty Stats - Mobile Optimized */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Statistiche Fedeltà</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs sm:text-sm text-gray-600">Membri</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs sm:text-sm text-gray-600">Premi</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs sm:text-sm text-gray-600">Punti Tot.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Coupon Modal - Mobile Optimized */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: '100%', scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '100%', scale: 1 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900">Nuovo Coupon</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Codice</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="ESTATE2024"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-mono text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Descrizione</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Sconto estivo"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">€</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Valore</label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder="20"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Min. Spesa</label>
                    <input
                      type="number"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Tier</label>
                    <select
                      value={formData.tierRequired}
                      onChange={(e) => setFormData({ ...formData, tierRequired: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                    >
                      <option value="Bronze">Bronze</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 sm:py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 text-sm sm:text-base"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateCoupon}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Crea</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

export default AdminCouponsPage
