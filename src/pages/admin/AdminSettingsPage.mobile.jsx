import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Bell, Clock, Truck, CreditCard, Mail, Phone, MapPin,
  Save, AlertCircle, CheckCircle
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'

function AdminSettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState({
    storeName: 'Food Ordering App',
    storeEmail: 'info@foodapp.com',
    storePhone: '+39 333 1234567',
    storeAddress: 'Via Roma 123, Milano, Italia',
    deliveryEnabled: true,
    minimumOrder: 10,
    deliveryFee: 3.50,
    freeDeliveryThreshold: 30,
    acceptCash: true,
    acceptCard: true,
    acceptDigitalWallet: true,
    emailNotifications: true,
    pushNotifications: true,
    businessHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '22:00', closed: false }
    }
  })

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')
  }, [navigate])

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'general', label: 'Generale', icon: Store },
    { id: 'delivery', label: 'Consegna', icon: Truck },
    { id: 'payment', label: 'Pagamenti', icon: CreditCard },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
    { id: 'hours', label: 'Orari', icon: Clock }
  ]

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayLabels = {
    monday: 'Lunedì',
    tuesday: 'Martedì',
    wednesday: 'Mercoledì',
    thursday: 'Giovedì',
    friday: 'Venerdì',
    saturday: 'Sabato',
    sunday: 'Domenica'
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Impostazioni</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Configura l'app</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-semibold w-full sm:w-auto"
          >
            <Save className="w-5 h-5" />
            <span>Salva</span>
          </button>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold text-sm sm:text-base">Salvato!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs - Mobile Optimized */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex space-x-1 min-w-max sm:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-md font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Generale</h3>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Nome Negozio
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={settings.storePhone}
                    onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Indirizzo
                </label>
                <input
                  type="text"
                  value={settings.storeAddress}
                  onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                />
              </div>
            </div>
          )}

          {/* Delivery Settings */}
          {activeTab === 'delivery' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Consegna</h3>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-sm sm:text-base">Abilita Consegne</span>
                <button
                  onClick={() => setSettings({ ...settings, deliveryEnabled: !settings.deliveryEnabled })}
                  className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-all ${
                    settings.deliveryEnabled ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-md transform transition-transform ${
                    settings.deliveryEnabled ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Ordine Minimo (€)
                  </label>
                  <input
                    type="number"
                    value={settings.minimumOrder}
                    onChange={(e) => setSettings({ ...settings, minimumOrder: parseFloat(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Costo Consegna (€)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={settings.deliveryFee}
                    onChange={(e) => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Consegna Gratis Da (€)
                  </label>
                  <input
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: parseFloat(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Pagamenti</h3>

              <div className="space-y-3">
                {[
                  { key: 'acceptCash', label: 'Contanti' },
                  { key: 'acceptCard', label: 'Carta' },
                  { key: 'acceptDigitalWallet', label: 'Wallet Digitale' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-sm sm:text-base">{label}</span>
                    <button
                      onClick={() => setSettings({ ...settings, [key]: !settings[key] })}
                      className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-all ${
                        settings[key] ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-md transform transition-transform ${
                        settings[key] ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Notifiche</h3>

              <div className="space-y-3">
                {[
                  { key: 'emailNotifications', label: 'Email' },
                  { key: 'pushNotifications', label: 'Push' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-sm sm:text-base">{label}</span>
                    <button
                      onClick={() => setSettings({ ...settings, [key]: !settings[key] })}
                      className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-all ${
                        settings[key] ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-md transform transition-transform ${
                        settings[key] ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Hours */}
          {activeTab === 'hours' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Orari Apertura</h3>

              <div className="space-y-2 sm:space-y-3">
                {days.map((day) => (
                  <div key={day} className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm sm:text-base">{dayLabels[day]}</span>
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          businessHours: {
                            ...settings.businessHours,
                            [day]: { ...settings.businessHours[day], closed: !settings.businessHours[day].closed }
                          }
                        })}
                        className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold ${
                          settings.businessHours[day].closed
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {settings.businessHours[day].closed ? 'Chiuso' : 'Aperto'}
                      </button>
                    </div>
                    {!settings.businessHours[day].closed && (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <input
                          type="time"
                          value={settings.businessHours[day].open}
                          onChange={(e) => setSettings({
                            ...settings,
                            businessHours: {
                              ...settings.businessHours,
                              [day]: { ...settings.businessHours[day], open: e.target.value }
                            }
                          })}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-xs sm:text-sm"
                        />
                        <input
                          type="time"
                          value={settings.businessHours[day].close}
                          onChange={(e) => setSettings({
                            ...settings,
                            businessHours: {
                              ...settings.businessHours,
                              [day]: { ...settings.businessHours[day], close: e.target.value }
                            }
                          })}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-xs sm:text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminSettingsPage
