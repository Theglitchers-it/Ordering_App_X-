import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  Bell,
  Camera,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Crown,
  Calendar,
  Activity,
  Award,
  TrendingUp
} from 'lucide-react'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'
import { useRBAC } from '../../context/RBACContext'

const AdminProfilePage = () => {
  const { currentUser, ROLES } = useRBAC()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || 'Admin',
    email: currentUser?.email || 'admin@example.com',
    phone: '+39 123 456 7890',
    address: 'Via Roma 123, Milano, Italy',
    bio: 'Amministratore del sistema FoodApp',
    avatar: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    merchantUpdates: true,
    systemAlerts: true,
    weeklyReports: true,
    monthlyReports: true
  })

  const handleSaveProfile = () => {
    // Simulate save
    setSaveStatus('success')
    setTimeout(() => setSaveStatus(null), 3000)
  }

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
      return
    }
    // Simulate save
    setSaveStatus('success')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setTimeout(() => setSaveStatus(null), 3000)
  }

  const getRoleBadge = (role) => {
    const badges = {
      [ROLES.SUPER_ADMIN]: { label: 'Super Admin', color: 'from-purple-500 to-purple-600', icon: Crown },
      [ROLES.ADMIN]: { label: 'Admin', color: 'from-blue-500 to-blue-600', icon: Shield },
      [ROLES.MERCHANT_ADMIN]: { label: 'Merchant Admin', color: 'from-orange-500 to-orange-600', icon: Shield },
      [ROLES.SUPPORT_AGENT]: { label: 'Support Agent', color: 'from-green-500 to-green-600', icon: Shield },
      [ROLES.FINANCE]: { label: 'Finance Manager', color: 'from-emerald-500 to-emerald-600', icon: Shield },
      [ROLES.LOGISTICS]: { label: 'Logistics Manager', color: 'from-indigo-500 to-indigo-600', icon: Shield }
    }
    return badges[role] || badges[ROLES.ADMIN]
  }

  const roleBadge = getRoleBadge(currentUser?.role)
  const RoleIcon = roleBadge.icon

  // Activity stats (simulated)
  const activityStats = [
    { label: 'Ordini Gestiti', value: '1,247', icon: Activity, trend: '+12%' },
    { label: 'Tempo Medio Risposta', value: '2.3 min', icon: TrendingUp, trend: '-8%' },
    { label: 'Problemi Risolti', value: '892', icon: CheckCircle, trend: '+15%' },
    { label: 'Rating Clienti', value: '4.9/5', icon: Award, trend: '+0.2' }
  ]

  return (
    <AdminLayoutNew>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Il mio Profilo</h1>
            <p className="text-gray-600 mt-1">Gestisci le tue informazioni personali e preferenze</p>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              saveStatus === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {saveStatus === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">
              {saveStatus === 'success' ? 'Modifiche salvate con successo!' : 'Errore: le password non corrispondono'}
            </span>
          </motion.div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className={`h-32 bg-gradient-to-r ${roleBadge.color}`} />
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16">
              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${roleBadge.color} flex items-center justify-center`}>
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-700 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Info */}
                <div className="pb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                  <p className="text-gray-600">{profileData.email}</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${roleBadge.color} text-white text-sm font-semibold mt-2`}>
                    <RoleIcon className="w-4 h-4" />
                    {roleBadge.label}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 pb-2">
                <Calendar className="w-4 h-4" />
                <span>Membro da Gennaio 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activityStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-semibold text-green-600">{stat.trend}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'profile', label: 'Informazioni Personali', icon: User },
                { id: 'security', label: 'Sicurezza', icon: Lock },
                { id: 'notifications', label: 'Notifiche', icon: Bell }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefono
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Indirizzo
                    </label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 flex items-center gap-2 transition-all shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Salva Modifiche
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Sicurezza Account</h4>
                      <p className="text-sm text-blue-800">
                        Assicurati di utilizzare una password forte con almeno 8 caratteri, includendo lettere maiuscole, minuscole, numeri e simboli.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Attuale</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nuova Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conferma Nuova Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 flex items-center gap-2 transition-all shadow-md"
                >
                  <Lock className="w-4 h-4" />
                  Cambia Password
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferenze Notifiche</h3>

                  {[
                    { key: 'emailNotifications', label: 'Notifiche Email', desc: 'Ricevi notifiche via email' },
                    { key: 'pushNotifications', label: 'Notifiche Push', desc: 'Ricevi notifiche push nel browser' },
                    { key: 'smsNotifications', label: 'Notifiche SMS', desc: 'Ricevi notifiche via SMS' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.label}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key]}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  ))}

                  <hr className="my-6" />

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo di Notifiche</h3>

                  {[
                    { key: 'orderUpdates', label: 'Aggiornamenti Ordini', desc: 'Notifiche per nuovi ordini e cambi stato' },
                    { key: 'merchantUpdates', label: 'Aggiornamenti Merchant', desc: 'Notifiche su nuovi ristoranti e modifiche' },
                    { key: 'systemAlerts', label: 'Alert di Sistema', desc: 'Notifiche per eventi critici e problemi' },
                    { key: 'weeklyReports', label: 'Report Settimanali', desc: 'Ricevi report riepilogativo settimanale' },
                    { key: 'monthlyReports', label: 'Report Mensili', desc: 'Ricevi report riepilogativo mensile' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.label}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key]}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 flex items-center gap-2 transition-all shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Salva Preferenze
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayoutNew>
  )
}

export default AdminProfilePage
