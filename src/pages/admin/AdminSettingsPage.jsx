import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Settings, Store, Bell, Palette, Clock, DollarSign,
  Mail, Phone, MapPin, Save, Globe, Truck, CreditCard, Shield,
  Users, Package, FileText, AlertCircle
} from 'lucide-react'

function AdminSettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState({
    // General Settings
    storeName: 'Food Ordering App',
    storeEmail: 'info@foodapp.com',
    storePhone: '+39 333 1234567',
    storeAddress: 'Via Roma 123, Milano, Italia',
    currency: 'EUR',
    timezone: 'Europe/Rome',
    language: 'it',

    // Delivery Settings
    deliveryEnabled: true,
    minimumOrder: 10,
    deliveryFee: 3.50,
    freeDeliveryThreshold: 30,
    estimatedDeliveryTime: 30,
    deliveryRadius: 10,

    // Payment Settings
    acceptCash: true,
    acceptCard: true,
    acceptDigitalWallet: true,
    taxRate: 10,

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderNotifications: true,
    promotionNotifications: true,

    // Business Hours
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
    // Save settings logic
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Impostazioni</h2>
              <p className="text-sm text-gray-500">Configura le impostazioni dell'app</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            <Save className="w-5 h-5" />
            <span>Salva Modifiche</span>
          </button>
        </div>
      </header>

      {/* Success Message */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold">Impostazioni salvate con successo!</span>
        </motion.div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 sticky top-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-orange-50 text-orange-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Impostazioni Generali</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nome Negozio
                        </label>
                        <input
                          type="text"
                          value={settings.storeName}
                          onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email
                          </label>
                          <input
                            type="email"
                            value={settings.storeEmail}
                            onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Telefono
                          </label>
                          <input
                            type="tel"
                            value={settings.storePhone}
                            onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Indirizzo
                        </label>
                        <input
                          type="text"
                          value={settings.storeAddress}
                          onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Valuta
                          </label>
                          <select
                            value={settings.currency}
                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          >
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Fuso Orario
                          </label>
                          <select
                            value={settings.timezone}
                            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          >
                            <option value="Europe/Rome">Europa/Roma</option>
                            <option value="Europe/London">Europa/Londra</option>
                            <option value="America/New_York">America/New York</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Lingua
                          </label>
                          <select
                            value={settings.language}
                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          >
                            <option value="it">Italiano</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Settings */}
              {activeTab === 'delivery' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Impostazioni Consegna</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">Abilita Consegna</p>
                          <p className="text-sm text-gray-500">Permetti ordini con consegna</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.deliveryEnabled}
                            onChange={(e) => setSettings({ ...settings, deliveryEnabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ordine Minimo (€)
                          </label>
                          <input
                            type="number"
                            value={settings.minimumOrder}
                            onChange={(e) => setSettings({ ...settings, minimumOrder: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Costo Consegna (€)
                          </label>
                          <input
                            type="number"
                            step="0.50"
                            value={settings.deliveryFee}
                            onChange={(e) => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Soglia Consegna Gratis (€)
                          </label>
                          <input
                            type="number"
                            value={settings.freeDeliveryThreshold}
                            onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tempo Consegna Stimato (min)
                          </label>
                          <input
                            type="number"
                            value={settings.estimatedDeliveryTime}
                            onChange={(e) => setSettings({ ...settings, estimatedDeliveryTime: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Raggio Consegna (km)
                        </label>
                        <input
                          type="number"
                          value={settings.deliveryRadius}
                          onChange={(e) => setSettings({ ...settings, deliveryRadius: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Metodi di Pagamento</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Contanti</p>
                            <p className="text-sm text-gray-500">Pagamento alla consegna</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.acceptCash}
                            onChange={(e) => setSettings({ ...settings, acceptCash: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Carta di Credito/Debito</p>
                            <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.acceptCard}
                            onChange={(e) => setSettings({ ...settings, acceptCard: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Digital Wallet</p>
                            <p className="text-sm text-gray-500">Apple Pay, Google Pay, PayPal</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.acceptDigitalWallet}
                            onChange={(e) => setSettings({ ...settings, acceptDigitalWallet: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Aliquota IVA (%)
                        </label>
                        <input
                          type="number"
                          value={settings.taxRate}
                          onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Notifiche</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Notifiche Email</p>
                            <p className="text-sm text-gray-500">Ricevi notifiche via email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Notifiche SMS</p>
                            <p className="text-sm text-gray-500">Ricevi notifiche via SMS</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.smsNotifications}
                            onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Notifiche Push</p>
                            <p className="text-sm text-gray-500">Ricevi notifiche push sul dispositivo</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.pushNotifications}
                            onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <hr className="my-6" />

                      <h4 className="font-bold text-gray-900 mb-4">Tipi di Notifiche</h4>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">Notifiche Ordini</p>
                          <p className="text-sm text-gray-500">Ricevi notifiche sui nuovi ordini</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.orderNotifications}
                            onChange={(e) => setSettings({ ...settings, orderNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">Notifiche Promozionali</p>
                          <p className="text-sm text-gray-500">Ricevi notifiche su offerte e promozioni</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.promotionNotifications}
                            onChange={(e) => setSettings({ ...settings, promotionNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Hours */}
              {activeTab === 'hours' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Orari di Apertura</h3>
                    <div className="space-y-3">
                      {Object.entries(settings.businessHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-24">
                              <p className="font-semibold text-gray-900 capitalize">{day === 'monday' ? 'Lunedì' : day === 'tuesday' ? 'Martedì' : day === 'wednesday' ? 'Mercoledì' : day === 'thursday' ? 'Giovedì' : day === 'friday' ? 'Venerdì' : day === 'saturday' ? 'Sabato' : 'Domenica'}</p>
                            </div>
                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  businessHours: {
                                    ...settings.businessHours,
                                    [day]: { ...hours, open: e.target.value }
                                  }
                                })}
                                disabled={hours.closed}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                              />
                              <span className="text-gray-500">-</span>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  businessHours: {
                                    ...settings.businessHours,
                                    [day]: { ...hours, close: e.target.value }
                                  }
                                })}
                                disabled={hours.closed}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                              />
                            </div>
                          </div>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hours.closed}
                              onChange={(e) => setSettings({
                                ...settings,
                                businessHours: {
                                  ...settings.businessHours,
                                  [day]: { ...hours, closed: e.target.checked }
                                }
                              })}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-600">Chiuso</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettingsPage
