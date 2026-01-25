import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Ticket, Search, Plus, Edit, Trash2, Eye, X, Percent, DollarSign,
  Calendar, Tag, Copy, TrendingUp, Users, ShoppingBag, Loader2
} from 'lucide-react'
import { useRBAC, PERMISSIONS } from '../../context/RBACContext'
import { useCoupons } from '../../context/CouponsContext'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'

function AdminCouponsPageNew() {
  const navigate = useNavigate()
  const { hasPermission } = useRBAC()
  const {
    coupons: contextCoupons,
    loading,
    createCoupon: createCouponAPI,
    updateCoupon: updateCouponAPI,
    deleteCoupon: deleteCouponAPI,
    toggleCouponStatus
  } = useCoupons()

  const [coupons, setCoupons] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('view')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')

    if (!hasPermission(PERMISSIONS.VIEW_COUPONS)) {
      navigate('/admin/dashboard')
    }
  }, [navigate, hasPermission])

  // Sync coupons from context
  useEffect(() => {
    if (contextCoupons && contextCoupons.length > 0) {
      // Normalize coupon data for display
      const normalizedCoupons = contextCoupons.map(c => ({
        id: c.id,
        code: c.code,
        type: c.discount_type === 'percentage' ? 'percent' : 'fixed',
        value: parseFloat(c.discount_value || c.value || 0),
        minOrder: parseFloat(c.min_order_amount || c.minOrder || 0),
        maxDiscount: c.max_discount_amount || c.maxDiscount || null,
        usageLimit: c.max_uses || c.usageLimit || 100,
        usageCount: c.times_used || c.usageCount || 0,
        stackable: c.stackable || false,
        active: c.is_active !== undefined ? c.is_active : c.active,
        validFrom: c.valid_from || c.validFrom,
        validUntil: c.valid_until || c.validUntil,
        applicableCategories: c.applicable_categories || c.applicableCategories || ['all'],
        description: c.description || '',
        title: c.title || '',
        createdAt: c.createdAt || c.created_at
      }))
      setCoupons(normalizedCoupons)
    }
  }, [contextCoupons])

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || coupon.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleCreate = () => {
    if (!hasPermission(PERMISSIONS.CREATE_COUPONS)) {
      alert('Non hai il permesso di creare coupon')
      return
    }
    setSelectedCoupon({
      code: '',
      type: 'percent',
      value: 10,
      minOrder: 0,
      maxDiscount: null,
      usageLimit: 100,
      usageCount: 0,
      stackable: false,
      active: true,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      applicableCategories: ['all'],
      description: ''
    })
    setModalMode('create')
    setShowModal(true)
  }

  const handleEdit = (coupon) => {
    if (!hasPermission(PERMISSIONS.UPDATE_COUPONS)) {
      alert('Non hai il permesso di modificare coupon')
      return
    }
    setSelectedCoupon({ ...coupon })
    setModalMode('edit')
    setShowModal(true)
  }

  const handleView = (coupon) => {
    setSelectedCoupon(coupon)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!hasPermission(PERMISSIONS.DELETE_COUPONS)) {
      alert('Non hai il permesso di eliminare coupon')
      return
    }
    if (confirm('Sei sicuro di voler eliminare questo coupon?')) {
      setSaving(true)
      const result = await deleteCouponAPI(id)
      setSaving(false)

      if (result.success) {
        if (result.deactivated) {
          // Update local state to show as deactivated
          setCoupons(prev => prev.map(c =>
            c.id === id ? { ...c, active: false } : c
          ))
          alert('Il coupon è stato disattivato (ha già degli utilizzi)')
        } else {
          setCoupons(prev => prev.filter(c => c.id !== id))
        }
      } else {
        alert(result.message || 'Errore durante l\'eliminazione')
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)

    // Prepare data for API
    const couponData = {
      code: selectedCoupon.code,
      title: selectedCoupon.title || selectedCoupon.description,
      description: selectedCoupon.description,
      discount_type: selectedCoupon.type === 'percent' ? 'percentage' : 'fixed_amount',
      discount_value: selectedCoupon.value,
      max_discount_amount: selectedCoupon.maxDiscount,
      min_order_amount: selectedCoupon.minOrder || 0,
      max_uses: selectedCoupon.usageLimit,
      valid_from: selectedCoupon.validFrom,
      valid_until: selectedCoupon.validUntil,
      applicable_categories: selectedCoupon.applicableCategories,
      is_active: selectedCoupon.active !== false
    }

    let result
    if (modalMode === 'create') {
      result = await createCouponAPI(couponData)
      if (result.success) {
        // Add normalized coupon to local state
        const newCoupon = {
          id: result.coupon.id,
          code: result.coupon.code,
          type: selectedCoupon.type,
          value: selectedCoupon.value,
          minOrder: selectedCoupon.minOrder || 0,
          maxDiscount: selectedCoupon.maxDiscount,
          usageLimit: selectedCoupon.usageLimit,
          usageCount: 0,
          stackable: selectedCoupon.stackable || false,
          active: true,
          validFrom: selectedCoupon.validFrom,
          validUntil: selectedCoupon.validUntil,
          applicableCategories: selectedCoupon.applicableCategories,
          description: selectedCoupon.description,
          createdAt: new Date().toISOString()
        }
        setCoupons(prev => [newCoupon, ...prev])
      }
    } else if (modalMode === 'edit') {
      result = await updateCouponAPI(selectedCoupon.id, couponData)
      if (result.success) {
        setCoupons(prev => prev.map(c =>
          c.id === selectedCoupon.id ? selectedCoupon : c
        ))
      }
    }

    setSaving(false)

    if (result.success) {
      setShowModal(false)
    } else {
      alert(result.message || 'Errore durante il salvataggio')
    }
  }

  const handleToggleActive = async (id) => {
    if (!hasPermission(PERMISSIONS.UPDATE_COUPONS)) {
      alert('Non hai il permesso di modificare coupon')
      return
    }

    const result = await toggleCouponStatus(id)

    if (result.success) {
      setCoupons(prev => prev.map(c =>
        c.id === id ? { ...c, active: !c.active } : c
      ))
    } else {
      alert(result.message || 'Errore durante l\'aggiornamento')
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    alert(`Codice ${code} copiato!`)
  }

  const isExpired = (coupon) => {
    return new Date(coupon.validUntil) < new Date()
  }

  const isFullyUsed = (coupon) => {
    return coupon.usageCount >= coupon.usageLimit
  }

  const getStatusColor = (coupon) => {
    if (!coupon.active) return 'bg-gray-100 text-gray-700'
    if (isExpired(coupon)) return 'bg-red-100 text-red-700'
    if (isFullyUsed(coupon)) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const getStatusLabel = (coupon) => {
    if (!coupon.active) return 'Disattivato'
    if (isExpired(coupon)) return 'Scaduto'
    if (isFullyUsed(coupon)) return 'Esaurito'
    return 'Attivo'
  }

  // Stats
  const totalCoupons = coupons.length
  const activeCoupons = coupons.filter(c => c.active && !isExpired(c) && !isFullyUsed(c)).length
  const totalUsage = coupons.reduce((sum, c) => sum + c.usageCount, 0)
  const conversionRate = totalCoupons > 0 ? ((totalUsage / coupons.reduce((sum, c) => sum + c.usageLimit, 0)) * 100).toFixed(1) : 0

  return (
    <AdminLayoutNew>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coupon & Loyalty</h1>
            <p className="text-gray-500 mt-1">
              {filteredCoupons.length} {filteredCoupons.length === 1 ? 'coupon trovato' : 'coupon trovati'}
            </p>
          </div>
          {hasPermission(PERMISSIONS.CREATE_COUPONS) && (
            <button
              onClick={handleCreate}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Nuovo Coupon</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totale Coupon</p>
              <p className="text-2xl font-bold text-gray-900">{totalCoupons}</p>
            </div>
            <Ticket className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Coupon Attivi</p>
              <p className="text-2xl font-bold text-green-600">{activeCoupons}</p>
            </div>
            <Tag className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Utilizzi Totali</p>
              <p className="text-2xl font-bold text-purple-600">{totalUsage}</p>
            </div>
            <Users className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasso Conversione</p>
              <p className="text-2xl font-bold text-orange-600">{conversionRate}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per codice o descrizione..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none bg-white"
          >
            <option value="all">Tutti i tipi</option>
            <option value="percent">Percentuale</option>
            <option value="fixed">Importo fisso</option>
          </select>
        </div>
      </div>

      {/* Coupons Grid */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nessun coupon trovato</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="font-mono text-lg font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                    >
                      <span>{coupon.code}</span>
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(coupon)}`}>
                    {getStatusLabel(coupon)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleView(coupon)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {hasPermission(PERMISSIONS.UPDATE_COUPONS) && (
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {hasPermission(PERMISSIONS.DELETE_COUPONS) && (
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{coupon.description}</p>

              {/* Discount Info */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  {coupon.type === 'percent' ? (
                    <>
                      <Percent className="w-6 h-6 text-orange-600" />
                      <span className="text-3xl font-bold text-orange-600">{coupon.value}%</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-6 h-6 text-orange-600" />
                      <span className="text-3xl font-bold text-orange-600">€{coupon.value.toFixed(2)}</span>
                    </>
                  )}
                </div>
                <p className="text-center text-xs text-orange-600 mt-1">
                  {coupon.type === 'percent' ? 'Sconto percentuale' : 'Sconto fisso'}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Ordine minimo:</span>
                  <span className="font-semibold text-gray-900">€{coupon.minOrder.toFixed(2)}</span>
                </div>
                {coupon.maxDiscount && (
                  <div className="flex justify-between text-gray-600">
                    <span>Sconto max:</span>
                    <span className="font-semibold text-gray-900">€{coupon.maxDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Utilizzi:</span>
                  <span className="font-semibold text-gray-900">{coupon.usageCount}/{coupon.usageLimit}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Cumulabile:</span>
                  <span className="font-semibold text-gray-900">{coupon.stackable ? 'Sì' : 'No'}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Utilizzo</span>
                  <span>{Math.round((coupon.usageCount / coupon.usageLimit) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                    style={{ width: `${Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Validity */}
              <div className="text-xs text-gray-500 flex items-center space-x-1 mb-4">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(coupon.validFrom).toLocaleDateString('it-IT')} - {new Date(coupon.validUntil).toLocaleDateString('it-IT')}
                </span>
              </div>

              {/* Toggle Active */}
              {hasPermission(PERMISSIONS.UPDATE_COUPONS) && (
                <button
                  onClick={() => handleToggleActive(coupon.id)}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                    coupon.active
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {coupon.active ? 'Disattiva' : 'Attiva'}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedCoupon && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-2xl font-bold">
                  {modalMode === 'view' ? 'Dettagli Coupon' :
                   modalMode === 'create' ? 'Nuovo Coupon' : 'Modifica Coupon'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {modalMode === 'view' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Codice</label>
                      <p className="text-gray-900 font-mono text-lg">{selectedCoupon.code}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Descrizione</label>
                      <p className="text-gray-900">{selectedCoupon.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Tipo</label>
                      <p className="text-gray-900">{selectedCoupon.type === 'percent' ? 'Percentuale' : 'Fisso'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Valore</label>
                      <p className="text-gray-900">
                        {selectedCoupon.type === 'percent' ? `${selectedCoupon.value}%` : `€${selectedCoupon.value}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Ordine Minimo</label>
                      <p className="text-gray-900">€{selectedCoupon.minOrder.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Limite Utilizzi</label>
                      <p className="text-gray-900">{selectedCoupon.usageLimit}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Codice Coupon</label>
                        <input
                          type="text"
                          value={selectedCoupon.code}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, code: e.target.value.toUpperCase() })}
                          placeholder="es. WELCOME20"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Descrizione</label>
                        <textarea
                          value={selectedCoupon.description}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, description: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                          rows="2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                        <select
                          value={selectedCoupon.type}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, type: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        >
                          <option value="percent">Percentuale (%)</option>
                          <option value="fixed">Fisso (€)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Valore {selectedCoupon.type === 'percent' ? '(%)' : '(€)'}
                        </label>
                        <input
                          type="number"
                          step={selectedCoupon.type === 'percent' ? '1' : '0.01'}
                          value={selectedCoupon.value}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, value: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ordine Minimo (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={selectedCoupon.minOrder}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, minOrder: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Limite Utilizzi</label>
                        <input
                          type="number"
                          value={selectedCoupon.usageLimit}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, usageLimit: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Valido Da</label>
                        <input
                          type="date"
                          value={selectedCoupon.validFrom?.split('T')[0]}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, validFrom: new Date(e.target.value).toISOString() })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Valido Fino a</label>
                        <input
                          type="date"
                          value={selectedCoupon.validUntil?.split('T')[0]}
                          onChange={(e) => setSelectedCoupon({ ...selectedCoupon, validUntil: new Date(e.target.value).toISOString() })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedCoupon.stackable}
                            onChange={(e) => setSelectedCoupon({ ...selectedCoupon, stackable: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-semibold text-gray-700">Cumulabile con altri coupon</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button
                        onClick={() => setShowModal(false)}
                        disabled={saving}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Salvataggio...</span>
                          </>
                        ) : (
                          <span>Salva</span>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayoutNew>
  )
}

export default AdminCouponsPageNew
