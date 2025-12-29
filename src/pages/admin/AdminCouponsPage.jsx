import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Search, Plus, Edit, Trash2, Tag, Gift, Award,
  X, Save, Percent, Calendar, Users, DollarSign
} from 'lucide-react'
import { useCoupons } from '../../context/CouponsContext'
import { useLoyalty } from '../../context/LoyaltyContext'

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
    // Logic to create coupon
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Coupon & Loyalty</h2>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Crea Coupon</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'coupons'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span>Coupon</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'loyalty'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Programma Fedeltà</span>
            </div>
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'coupons' ? (
          <div>
            {/* Search */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cerca coupon per codice..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map((coupon, index) => (
                <motion.div
                  key={coupon.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-orange-50 p-3 rounded-xl">
                      <Tag className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-mono">{coupon.code}</h3>
                  <p className="text-gray-600 text-sm mb-4">{coupon.description}</p>

                  <div className="space-y-2 text-sm">
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
                    {coupon.maxDiscount && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Max Sconto:</span>
                        <span className="font-semibold">€{coupon.maxDiscount}</span>
                      </div>
                    )}
                    {coupon.requiresTier && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tier:</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {coupon.requiresTier}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredCoupons.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nessun coupon trovato</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Loyalty Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${
                    tier.name === 'Bronze' ? 'from-orange-400 to-orange-600' :
                    tier.name === 'Silver' ? 'from-gray-300 to-gray-500' :
                    tier.name === 'Gold' ? 'from-yellow-400 to-yellow-600' :
                    'from-purple-400 to-purple-600'
                  } rounded-2xl p-6 text-white shadow-lg`}
                >
                  <Award className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-white/90 mb-4">Sconto: {tier.discount}%</p>
                  <div className="space-y-1 text-sm">
                    <p>Min. Punti: {tier.minPoints}</p>
                    {tier.maxPoints && <p>Max Punti: {tier.maxPoints}</p>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Loyalty Stats */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Statistiche Programma Fedeltà</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Membri Attivi</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Gift className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Premi Riscattati</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Punti Totali</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Crea Nuovo Coupon</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Codice Coupon</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="ESTATE2024"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrizione</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Sconto estivo del 20%"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo Sconto</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  >
                    <option value="percentage">Percentuale</option>
                    <option value="fixed">Fisso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Valore Sconto</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="20"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Spesa Minima (€)</label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Utilizzi</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data Scadenza</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tier Richiesto</label>
                  <select
                    value={formData.tierRequired}
                    onChange={(e) => setFormData({ ...formData, tierRequired: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCreateCoupon}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Crea Coupon</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminCouponsPage
