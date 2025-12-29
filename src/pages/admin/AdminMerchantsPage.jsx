import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Search, Plus, Edit, Trash2, Eye, MapPin, Clock, Phone,
  Mail, DollarSign, TrendingUp, X, Check, AlertCircle, Star, Package
} from 'lucide-react'
import { useRBAC, PERMISSIONS } from '../../context/RBACContext'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'

function AdminMerchantsPage() {
  const navigate = useNavigate()
  const { hasPermission } = useRBAC()
  const [merchants, setMerchants] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedMerchant, setSelectedMerchant] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('view') // 'view', 'create', 'edit'

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')

    // Load merchants from localStorage
    loadMerchants()
  }, [navigate])

  const loadMerchants = () => {
    const saved = localStorage.getItem('merchants')
    if (saved) {
      setMerchants(JSON.parse(saved))
    } else {
      // Demo data
      const demoMerchants = [
        {
          id: 1,
          name: 'Pizzeria Da Mario',
          description: 'Autentica pizza napoletana',
          email: 'mario@pizzeria.it',
          phone: '+39 333 1234567',
          address: 'Via Roma 123, Milano',
          city: 'Milano',
          commissionRate: 15,
          status: 'active',
          rating: 4.8,
          totalOrders: 1250,
          revenue: 45230.50,
          category: 'Pizzeria',
          openingHours: '12:00 - 23:00',
          minOrder: 10,
          deliveryTime: '30-45 min',
          createdAt: new Date('2024-01-15').toISOString()
        },
        {
          id: 2,
          name: 'Sushi Express',
          description: 'Sushi fresco e veloce',
          email: 'info@sushiexpress.it',
          phone: '+39 333 7654321',
          address: 'Corso Italia 45, Milano',
          city: 'Milano',
          commissionRate: 18,
          status: 'active',
          rating: 4.6,
          totalOrders: 890,
          revenue: 35120.00,
          category: 'Sushi',
          openingHours: '11:30 - 22:30',
          minOrder: 15,
          deliveryTime: '40-50 min',
          createdAt: new Date('2024-02-10').toISOString()
        },
        {
          id: 3,
          name: 'Burger House',
          description: 'I migliori burger in città',
          email: 'contact@burgerhouse.it',
          phone: '+39 333 9876543',
          address: 'Via Dante 78, Milano',
          city: 'Milano',
          commissionRate: 12,
          status: 'pending',
          rating: 4.5,
          totalOrders: 567,
          revenue: 28450.75,
          category: 'Fast Food',
          openingHours: '12:00 - 24:00',
          minOrder: 8,
          deliveryTime: '25-35 min',
          createdAt: new Date('2024-03-05').toISOString()
        }
      ]
      setMerchants(demoMerchants)
      localStorage.setItem('merchants', JSON.stringify(demoMerchants))
    }
  }

  const saveMerchants = (updatedMerchants) => {
    setMerchants(updatedMerchants)
    localStorage.setItem('merchants', JSON.stringify(updatedMerchants))
  }

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch =
      merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || merchant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreate = () => {
    if (!hasPermission(PERMISSIONS.CREATE_MERCHANTS)) {
      alert('Non hai il permesso di creare ristoranti')
      return
    }
    setSelectedMerchant({
      name: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      commissionRate: 15,
      status: 'pending',
      category: '',
      openingHours: '',
      minOrder: 0,
      deliveryTime: ''
    })
    setModalMode('create')
    setShowModal(true)
  }

  const handleEdit = (merchant) => {
    if (!hasPermission(PERMISSIONS.UPDATE_MERCHANTS)) {
      alert('Non hai il permesso di modificare ristoranti')
      return
    }
    setSelectedMerchant({ ...merchant })
    setModalMode('edit')
    setShowModal(true)
  }

  const handleView = (merchant) => {
    setSelectedMerchant(merchant)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (!hasPermission(PERMISSIONS.DELETE_MERCHANTS)) {
      alert('Non hai il permesso di eliminare ristoranti')
      return
    }
    if (confirm('Sei sicuro di voler eliminare questo ristorante?')) {
      const updated = merchants.filter(m => m.id !== id)
      saveMerchants(updated)
    }
  }

  const handleSave = () => {
    if (modalMode === 'create') {
      const newMerchant = {
        ...selectedMerchant,
        id: Math.max(0, ...merchants.map(m => m.id)) + 1,
        totalOrders: 0,
        revenue: 0,
        rating: 0,
        createdAt: new Date().toISOString()
      }
      saveMerchants([...merchants, newMerchant])
    } else if (modalMode === 'edit') {
      const updated = merchants.map(m =>
        m.id === selectedMerchant.id ? selectedMerchant : m
      )
      saveMerchants(updated)
    }
    setShowModal(false)
  }

  const handleApprove = (id) => {
    const updated = merchants.map(m =>
      m.id === id ? { ...m, status: 'active' } : m
    )
    saveMerchants(updated)
  }

  const handleSuspend = (id) => {
    const updated = merchants.map(m =>
      m.id === id ? { ...m, status: 'suspended' } : m
    )
    saveMerchants(updated)
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      suspended: 'bg-red-100 text-red-700',
      inactive: 'bg-gray-100 text-gray-700'
    }
    return colors[status] || colors.inactive
  }

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Attivo',
      pending: 'In attesa',
      suspended: 'Sospeso',
      inactive: 'Inattivo'
    }
    return labels[status] || 'Inattivo'
  }

  return (
    <AdminLayoutNew>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestione Ristoranti</h1>
            <p className="text-gray-500 mt-1">
              {filteredMerchants.length} {filteredMerchants.length === 1 ? 'ristorante trovato' : 'ristoranti trovati'}
            </p>
          </div>
          {hasPermission(PERMISSIONS.CREATE_MERCHANTS) && (
            <button
              onClick={handleCreate}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Nuovo Ristorante</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per nome, email o città..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none appearance-none bg-white"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attivi</option>
            <option value="pending">In attesa</option>
            <option value="suspended">Sospesi</option>
            <option value="inactive">Inattivi</option>
          </select>
        </div>
      </div>

      {/* Merchants Grid */}
      {filteredMerchants.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nessun ristorante trovato</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMerchants.map((merchant) => (
            <motion.div
              key={merchant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{merchant.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(merchant.status)}`}>
                    {getStatusLabel(merchant.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  {hasPermission(PERMISSIONS.VIEW_MERCHANTS) && (
                    <button
                      onClick={() => handleView(merchant)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Visualizza"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  {hasPermission(PERMISSIONS.UPDATE_MERCHANTS) && (
                    <button
                      onClick={() => handleEdit(merchant)}
                      className="p-2 hover:bg-blue-50 rounded-lg"
                      title="Modifica"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  {hasPermission(PERMISSIONS.DELETE_MERCHANTS) && (
                    <button
                      onClick={() => handleDelete(merchant.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                      title="Elimina"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Info */}
              <p className="text-sm text-gray-600 mb-4">{merchant.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{merchant.address}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{merchant.openingHours}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="w-4 h-4 mr-2 flex-shrink-0 text-yellow-500" />
                  <span>{merchant.rating || 0}/5</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Ordini</p>
                  <p className="text-lg font-bold text-gray-900">{merchant.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fatturato</p>
                  <p className="text-lg font-bold text-gray-900">€{merchant.revenue.toFixed(0)}</p>
                </div>
              </div>

              {/* Commission */}
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-orange-900">Commissione</span>
                  <span className="text-sm font-bold text-orange-600">{merchant.commissionRate}%</span>
                </div>
              </div>

              {/* Quick Actions */}
              {merchant.status === 'pending' && hasPermission(PERMISSIONS.UPDATE_MERCHANTS) && (
                <button
                  onClick={() => handleApprove(merchant.id)}
                  className="w-full mt-4 flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Approva</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedMerchant && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="text-2xl font-bold">
                  {modalMode === 'view' ? 'Dettagli Ristorante' :
                   modalMode === 'create' ? 'Nuovo Ristorante' : 'Modifica Ristorante'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {modalMode === 'view' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Nome</label>
                        <p className="text-gray-900">{selectedMerchant.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Stato</label>
                        <p><span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedMerchant.status)}`}>
                          {getStatusLabel(selectedMerchant.status)}
                        </span></p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedMerchant.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Telefono</label>
                        <p className="text-gray-900">{selectedMerchant.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-semibold text-gray-700">Indirizzo</label>
                        <p className="text-gray-900">{selectedMerchant.address}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Commissione</label>
                        <p className="text-gray-900">{selectedMerchant.commissionRate}%</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Ordine Minimo</label>
                        <p className="text-gray-900">€{selectedMerchant.minOrder}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Ristorante</label>
                      <input
                        type="text"
                        value={selectedMerchant.name}
                        onChange={(e) => setSelectedMerchant({ ...selectedMerchant, name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descrizione</label>
                      <textarea
                        value={selectedMerchant.description}
                        onChange={(e) => setSelectedMerchant({ ...selectedMerchant, description: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        rows="3"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={selectedMerchant.email}
                          onChange={(e) => setSelectedMerchant({ ...selectedMerchant, email: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Telefono</label>
                        <input
                          type="tel"
                          value={selectedMerchant.phone}
                          onChange={(e) => setSelectedMerchant({ ...selectedMerchant, phone: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Indirizzo</label>
                      <input
                        type="text"
                        value={selectedMerchant.address}
                        onChange={(e) => setSelectedMerchant({ ...selectedMerchant, address: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Città</label>
                        <input
                          type="text"
                          value={selectedMerchant.city}
                          onChange={(e) => setSelectedMerchant({ ...selectedMerchant, city: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                        <input
                          type="text"
                          value={selectedMerchant.category}
                          onChange={(e) => setSelectedMerchant({ ...selectedMerchant, category: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Commissione (%)</label>
                        <input
                          type="number"
                          value={selectedMerchant.commissionRate}
                          onChange={(e) => setSelectedMerchant({ ...selectedMerchant, commissionRate: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ordine Min. (€)</label>
                        <input
                          type="number"
                          value={selectedMerchant.minOrder}
                          onChange={(e) => setSelectedMerchant({ ...selectedMerchant, minOrder: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stato</label>
                        <select
                          value={selectedMerchant.status}
                          onChange={(e) => setSelectedMerchant({ ...selectedMerchant, status: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                        >
                          <option value="pending">In attesa</option>
                          <option value="active">Attivo</option>
                          <option value="suspended">Sospeso</option>
                          <option value="inactive">Inattivo</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex space-x-4 pt-4">
                      <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg"
                      >
                        Salva
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

export default AdminMerchantsPage
