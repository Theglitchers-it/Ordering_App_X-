import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, UserPlus, Ban, CheckCircle, Eye, X, Award, Mail, Phone, MapPin, Shield
} from 'lucide-react'
import { useRBAC, PERMISSIONS } from '../../context/RBACContext'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'

function AdminUsersPageNew() {
  const navigate = useNavigate()
  const { hasPermission } = useRBAC()
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')

    if (!hasPermission(PERMISSIONS.VIEW_USERS)) {
      navigate('/admin/dashboard')
    }

    loadUsers()
  }, [navigate, hasPermission])

  const loadUsers = () => {
    const saved = localStorage.getItem('users')
    if (saved) {
      setUsers(JSON.parse(saved))
    } else {
      // Demo users
      const demoUsers = [
        {
          id: 1,
          name: 'Mario Rossi',
          email: 'mario.rossi@email.com',
          phone: '+39 333 1234567',
          address: 'Via Roma 123, Milano',
          loyaltyPoints: 450,
          loyaltyTier: 'Gold',
          totalSpent: 1250.50,
          totalOrders: 35,
          status: 'active',
          banned: false,
          lastOrder: new Date('2024-03-20').toISOString(),
          createdAt: new Date('2023-01-15').toISOString()
        },
        {
          id: 2,
          name: 'Anna Verdi',
          email: 'anna.verdi@email.com',
          phone: '+39 333 7654321',
          address: 'Corso Italia 45, Milano',
          loyaltyPoints: 850,
          loyaltyTier: 'Platinum',
          totalSpent: 2180.00,
          totalOrders: 58,
          status: 'active',
          banned: false,
          lastOrder: new Date('2024-03-22').toISOString(),
          createdAt: new Date('2023-02-10').toISOString()
        },
        {
          id: 3,
          name: 'Luigi Bianchi',
          email: 'luigi.bianchi@email.com',
          phone: '+39 333 9876543',
          address: 'Via Dante 78, Milano',
          loyaltyPoints: 120,
          loyaltyTier: 'Silver',
          totalSpent: 380.00,
          totalOrders: 12,
          status: 'banned',
          banned: true,
          lastOrder: new Date('2024-02-15').toISOString(),
          createdAt: new Date('2023-11-05').toISOString()
        }
      ]
      setUsers(demoUsers)
      localStorage.setItem('users', JSON.stringify(demoUsers))
    }
  }

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers)
    localStorage.setItem('users', JSON.stringify(updatedUsers))
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !user.banned) ||
      (statusFilter === 'banned' && user.banned)
    return matchesSearch && matchesStatus
  })

  const handleBanUser = (userId) => {
    if (!hasPermission(PERMISSIONS.BAN_USERS)) {
      alert('Non hai il permesso di bannare utenti')
      return
    }

    const user = users.find(u => u.id === userId)
    if (confirm(`Sei sicuro di voler ${user.banned ? 'sbannare' : 'bannare'} ${user.name}?`)) {
      const updated = users.map(u =>
        u.id === userId ? { ...u, banned: !u.banned, status: !u.banned ? 'banned' : 'active' } : u
      )
      saveUsers(updated)
    }
  }

  const handleCreditPoints = (userId, points) => {
    if (!hasPermission(PERMISSIONS.UPDATE_USERS)) {
      alert('Non hai il permesso di modificare i punti loyalty')
      return
    }

    const user = users.find(u => u.id === userId)
    const newPoints = prompt(`Credita punti a ${user.name}\nPunti attuali: ${user.loyaltyPoints}`, '100')

    if (newPoints !== null) {
      const pointsToAdd = parseInt(newPoints)
      if (!isNaN(pointsToAdd)) {
        const updated = users.map(u =>
          u.id === userId ? { ...u, loyaltyPoints: u.loyaltyPoints + pointsToAdd } : u
        )
        saveUsers(updated)
        alert(`${pointsToAdd} punti aggiunti a ${user.name}`)
      }
    }
  }

  const getTierColor = (tier) => {
    const colors = {
      Silver: 'bg-gray-100 text-gray-700',
      Gold: 'bg-yellow-100 text-yellow-700',
      Platinum: 'bg-purple-100 text-purple-700'
    }
    return colors[tier] || colors.Silver
  }

  return (
    <AdminLayoutNew>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
            <p className="text-gray-500 mt-1">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'utente trovato' : 'utenti trovati'}
            </p>
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
              placeholder="Cerca per nome o email..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none bg-white"
          >
            <option value="all">Tutti gli utenti</option>
            <option value="active">Attivi</option>
            <option value="banned">Bannati</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totale Utenti</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Utenti Attivi</p>
              <p className="text-2xl font-bold text-green-600">{users.filter(u => !u.banned).length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bannati</p>
              <p className="text-2xl font-bold text-red-600">{users.filter(u => u.banned).length}</p>
            </div>
            <Ban className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Spesa Media</p>
              <p className="text-2xl font-bold text-purple-600">
                €{(users.reduce((sum, u) => sum + u.totalSpent, 0) / users.length || 0).toFixed(0)}
              </p>
            </div>
            <Award className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nessun utente trovato</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Utente</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contatti</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Loyalty</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Ordini</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Spesa Totale</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Stato</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">ID: {user.id}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getTierColor(user.loyaltyTier)} mb-1`}>
                        {user.loyaltyTier}
                      </span>
                      <p className="text-sm text-gray-600">{user.loyaltyPoints} punti</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700">{user.totalOrders}</td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-gray-900">€{user.totalSpent.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      user.banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.banned ? 'Bannato' : 'Attivo'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowModal(true)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Visualizza"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {hasPermission(PERMISSIONS.UPDATE_USERS) && (
                        <button
                          onClick={() => handleCreditPoints(user.id)}
                          className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                          title="Credita Punti"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      )}
                      {hasPermission(PERMISSIONS.BAN_USERS) && (
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className={`p-2 rounded-lg ${
                            user.banned
                              ? 'hover:bg-green-50 text-green-600'
                              : 'hover:bg-red-50 text-red-600'
                          }`}
                          title={user.banned ? 'Sbanna' : 'Banna'}
                        >
                          {user.banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Detail Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Telefono</label>
                    <p className="text-gray-900">{selectedUser.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Indirizzo</label>
                    <p className="text-gray-900">{selectedUser.address}</p>
                  </div>
                </div>

                {/* Loyalty & Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-purple-600 mb-1">Loyalty Tier</p>
                    <p className="text-2xl font-bold text-purple-900">{selectedUser.loyaltyTier}</p>
                    <p className="text-sm text-purple-600 mt-1">{selectedUser.loyaltyPoints} punti</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm text-green-600 mb-1">Spesa Totale</p>
                    <p className="text-2xl font-bold text-green-900">€{selectedUser.totalSpent.toFixed(2)}</p>
                    <p className="text-sm text-green-600 mt-1">{selectedUser.totalOrders} ordini</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">Registrato il</label>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600">Ultimo ordine</label>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedUser.lastOrder).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  {hasPermission(PERMISSIONS.UPDATE_USERS) && (
                    <button
                      onClick={() => {
                        handleCreditPoints(selectedUser.id)
                        setShowModal(false)
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      <Award className="w-5 h-5" />
                      <span>Credita Punti</span>
                    </button>
                  )}
                  {hasPermission(PERMISSIONS.BAN_USERS) && (
                    <button
                      onClick={() => {
                        handleBanUser(selectedUser.id)
                        setShowModal(false)
                      }}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg ${
                        selectedUser.banned
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {selectedUser.banned ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                      <span>{selectedUser.banned ? 'Sbanna Utente' : 'Banna Utente'}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayoutNew>
  )
}

export default AdminUsersPageNew
