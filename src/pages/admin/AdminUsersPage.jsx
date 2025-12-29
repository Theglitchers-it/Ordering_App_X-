import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Users, Ban, Award, Mail, Phone } from 'lucide-react'

function AdminUsersPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Mock users data
  const users = [
    { id: 1, name: 'Mario Rossi', email: 'mario@email.com', phone: '+39 333 1234567', totalSpent: 245.50, points: 245, tier: 'Silver', orders: 12, status: 'active' },
    { id: 2, name: 'Giulia Bianchi', email: 'giulia@email.com', phone: '+39 334 7654321', totalSpent: 589.20, points: 589, tier: 'Gold', orders: 28, status: 'active' },
    { id: 3, name: 'Luca Verdi', email: 'luca@email.com', phone: '+39 335 9876543', totalSpent: 3250.00, points: 3250, tier: 'Platinum', orders: 85, status: 'active' }
  ]

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/admin/login')
  }, [navigate])

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Bronze': return 'bg-orange-100 text-orange-700'
      case 'Silver': return 'bg-gray-100 text-gray-700'
      case 'Gold': return 'bg-yellow-100 text-yellow-700'
      case 'Platinum': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Utenti</h2>
        </div>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca utenti..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Utente</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contatti</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Ordini</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Totale Speso</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Punti</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tier</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <p className="text-sm flex items-center space-x-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{user.email}</span>
                      </p>
                      <p className="text-sm flex items-center space-x-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{user.phone}</span>
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">{user.orders}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-lg text-gray-900">€{user.totalSpent.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-blue-600">{user.points} pts</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${getTierColor(user.tier)}`}>
                      <Award className="w-3 h-3" />
                      <span>{user.tier}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="p-2 hover:bg-red-50 rounded-lg text-red-600" title="Blocca utente">
                      <Ban className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUsersPage
