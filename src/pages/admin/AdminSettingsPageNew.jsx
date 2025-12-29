import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Globe,
  Bell,
  Mail,
  MessageSquare,
  CreditCard,
  Key,
  Truck,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Shield,
  Save,
  RefreshCw,
  Check,
  X,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from 'lucide-react'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'
import { useRBAC } from '../../context/RBACContext'
import { PERMISSIONS } from '../../context/RBACContext'

const AdminSettingsPageNew = () => {
  const { hasPermission } = useRBAC()
  const [activeTab, setActiveTab] = useState('general')
  const [showApiKey, setShowApiKey] = useState({})
  const [saveStatus, setSaveStatus] = useState(null)

  // Settings state
  const [settings, setSettings] = useState({
    // General
    general: {
      appName: 'FoodApp',
      appUrl: 'https://foodapp.com',
      supportEmail: 'support@foodapp.com',
      supportPhone: '+39 123 456 7890',
      timezone: 'Europe/Rome',
      currency: 'EUR',
      language: 'it'
    },
    // Notifications
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      orderConfirmation: true,
      orderStatusUpdate: true,
      deliveryConfirmation: true,
      merchantNotifications: true,
      adminAlerts: true
    },
    // Email
    email: {
      provider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@foodapp.com',
      fromName: 'FoodApp'
    },
    // SMS
    sms: {
      provider: 'twilio',
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioPhoneNumber: '',
      enabled: false
    },
    // Payments
    payments: {
      stripeEnabled: true,
      stripePublishableKey: 'pk_test_...',
      stripeSecretKey: 'sk_test_...',
      paypalEnabled: false,
      paypalClientId: '',
      paypalSecret: '',
      cashOnDelivery: true,
      commissionRate: 15
    },
    // Delivery
    delivery: {
      provider: 'internal',
      googleMapsApiKey: '',
      deliveryRadius: 10,
      minOrderAmount: 10,
      deliveryFee: 2.50,
      freeDeliveryThreshold: 30,
      estimatedTime: 30
    },
    // API Keys
    apiKeys: {
      googleMaps: '',
      firebase: '',
      stripe: '',
      twilio: '',
      sendgrid: ''
    },
    // Security
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireSpecialChars: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15
    }
  })

  // Check permission
  useEffect(() => {
    if (!hasPermission(PERMISSIONS.VIEW_SETTINGS)) {
      alert('Non hai il permesso di visualizzare le impostazioni')
      window.location.href = '/admin/dashboard'
    }
  }, [hasPermission])

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('adminSettings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  // Save settings
  const handleSave = () => {
    if (!hasPermission(PERMISSIONS.UPDATE_SETTINGS)) {
      alert('Non hai il permesso di modificare le impostazioni')
      return
    }

    localStorage.setItem('adminSettings', JSON.stringify(settings))
    setSaveStatus('success')
    setTimeout(() => setSaveStatus(null), 3000)
  }

  // Update setting
  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  // Toggle API key visibility
  const toggleApiKeyVisibility = (key) => {
    setShowApiKey(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setSaveStatus('copied')
    setTimeout(() => setSaveStatus(null), 2000)
  }

  // Generate new API key
  const generateApiKey = () => {
    const newKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    return newKey
  }

  const tabs = [
    { id: 'general', label: 'Generale', icon: Globe },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'payments', label: 'Pagamenti', icon: CreditCard },
    { id: 'delivery', label: 'Consegna', icon: Truck },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'security', label: 'Sicurezza', icon: Shield }
  ]

  return (
    <AdminLayoutNew>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Impostazioni</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Configura l'applicazione e le integrazioni</p>
          </div>

          {hasPermission(PERMISSIONS.UPDATE_SETTINGS) && (
            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 flex items-center justify-center gap-2 transition-all shadow-md text-sm md:text-base"
            >
              <Save className="w-4 h-4" />
              Salva Modifiche
            </button>
          )}
        </div>

        {/* Save Status */}
        <AnimatePresence>
          {saveStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 text-green-800 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="text-sm md:text-base">Impostazioni salvate con successo!</span>
            </motion.div>
          )}
          {saveStatus === 'copied' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-50 border border-blue-200 text-blue-800 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="text-sm md:text-base">Copiato negli appunti!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <div className="flex">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-3 md:p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Impostazioni Generali</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Nome Applicazione</label>
                    <input
                      type="text"
                      value={settings.general.appName}
                      onChange={(e) => updateSetting('general', 'appName', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">URL Applicazione</label>
                    <input
                      type="text"
                      value={settings.general.appUrl}
                      onChange={(e) => updateSetting('general', 'appUrl', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Email Supporto</label>
                    <input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Telefono Supporto</label>
                    <input
                      type="tel"
                      value={settings.general.supportPhone}
                      onChange={(e) => updateSetting('general', 'supportPhone', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Fuso Orario</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    >
                      <option value="Europe/Rome">Europe/Rome (UTC+1)</option>
                      <option value="Europe/London">Europe/London (UTC+0)</option>
                      <option value="America/New_York">America/New York (UTC-5)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Valuta</label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Impostazioni Notifiche</h3>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 pr-3">
                      <h4 className="text-sm md:text-base font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-xs md:text-sm text-gray-600">Abilita notifiche via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailEnabled}
                        onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 pr-3">
                      <h4 className="text-sm md:text-base font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-xs md:text-sm text-gray-600">Abilita notifiche via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsEnabled}
                        onChange={(e) => updateSetting('notifications', 'smsEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 pr-3">
                      <h4 className="text-sm md:text-base font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-xs md:text-sm text-gray-600">Abilita notifiche push</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushEnabled}
                        onChange={(e) => updateSetting('notifications', 'pushEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <hr className="my-4 md:my-6" />

                  <h4 className="text-sm md:text-base font-medium text-gray-900 mb-3 md:mb-4">Eventi Notifiche</h4>

                  {[
                    { key: 'orderConfirmation', label: 'Conferma Ordine', desc: 'Notifica quando un ordine viene confermato' },
                    { key: 'orderStatusUpdate', label: 'Aggiornamento Stato', desc: 'Notifica quando lo stato ordine cambia' },
                    { key: 'deliveryConfirmation', label: 'Conferma Consegna', desc: 'Notifica quando ordine è consegnato' },
                    { key: 'merchantNotifications', label: 'Notifiche Merchant', desc: 'Notifica ai ristoranti per nuovi ordini' },
                    { key: 'adminAlerts', label: 'Alert Admin', desc: 'Notifica admin per eventi importanti' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 pr-3">
                        <h4 className="text-sm md:text-base font-medium text-gray-900">{item.label}</h4>
                        <p className="text-xs md:text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={settings.notifications[item.key]}
                          onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Configurazione Email</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Provider</label>
                    <select
                      value={settings.email.provider}
                      onChange={(e) => updateSetting('email', 'provider', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    >
                      <option value="smtp">SMTP</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailgun">Mailgun</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.email.smtpHost}
                      onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">SMTP Port</label>
                    <input
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">SMTP User</label>
                    <input
                      type="text"
                      value={settings.email.smtpUser}
                      onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">SMTP Password</label>
                    <input
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">From Email</label>
                    <input
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">From Name</label>
                    <input
                      type="text"
                      value={settings.email.fromName}
                      onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SMS Settings */}
            {activeTab === 'sms' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Configurazione SMS</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Provider</label>
                    <select
                      value={settings.sms.provider}
                      onChange={(e) => updateSetting('sms', 'provider', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    >
                      <option value="twilio">Twilio</option>
                      <option value="nexmo">Nexmo</option>
                      <option value="messagebird">MessageBird</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Twilio Account SID</label>
                    <input
                      type="text"
                      value={settings.sms.twilioAccountSid}
                      onChange={(e) => updateSetting('sms', 'twilioAccountSid', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Twilio Auth Token</label>
                    <input
                      type="password"
                      value={settings.sms.twilioAuthToken}
                      onChange={(e) => updateSetting('sms', 'twilioAuthToken', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Twilio Phone Number</label>
                    <input
                      type="tel"
                      value={settings.sms.twilioPhoneNumber}
                      onChange={(e) => updateSetting('sms', 'twilioPhoneNumber', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payments Settings */}
            {activeTab === 'payments' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Configurazione Pagamenti</h3>

                <div className="space-y-4 md:space-y-6">
                  {/* Stripe */}
                  <div className="border border-gray-200 rounded-lg p-3 md:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <h4 className="text-sm md:text-base font-medium text-gray-900">Stripe</h4>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={settings.payments.stripeEnabled}
                          onChange={(e) => updateSetting('payments', 'stripeEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Publishable Key</label>
                        <input
                          type="text"
                          value={settings.payments.stripePublishableKey}
                          onChange={(e) => updateSetting('payments', 'stripePublishableKey', e.target.value)}
                          className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Secret Key</label>
                        <input
                          type="password"
                          value={settings.payments.stripeSecretKey}
                          onChange={(e) => updateSetting('payments', 'stripeSecretKey', e.target.value)}
                          className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PayPal */}
                  <div className="border border-gray-200 rounded-lg p-3 md:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <h4 className="text-sm md:text-base font-medium text-gray-900">PayPal</h4>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={settings.payments.paypalEnabled}
                          onChange={(e) => updateSetting('payments', 'paypalEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Client ID</label>
                        <input
                          type="text"
                          value={settings.payments.paypalClientId}
                          onChange={(e) => updateSetting('payments', 'paypalClientId', e.target.value)}
                          className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Secret</label>
                        <input
                          type="password"
                          value={settings.payments.paypalSecret}
                          onChange={(e) => updateSetting('payments', 'paypalSecret', e.target.value)}
                          className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Other Settings */}
                  <div className="border border-gray-200 rounded-lg p-3 md:p-6">
                    <h4 className="text-sm md:text-base font-medium text-gray-900 mb-3 md:mb-4">Altre Opzioni</h4>
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-3">
                          <h5 className="text-sm md:text-base font-medium text-gray-900">Contanti alla Consegna</h5>
                          <p className="text-xs md:text-sm text-gray-600">Abilita pagamento in contanti</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={settings.payments.cashOnDelivery}
                            onChange={(e) => updateSetting('payments', 'cashOnDelivery', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Tasso Commissione (%)</label>
                        <input
                          type="number"
                          value={settings.payments.commissionRate}
                          onChange={(e) => updateSetting('payments', 'commissionRate', parseFloat(e.target.value))}
                          className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Settings */}
            {activeTab === 'delivery' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Configurazione Consegna</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Provider</label>
                    <select
                      value={settings.delivery.provider}
                      onChange={(e) => updateSetting('delivery', 'provider', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    >
                      <option value="internal">Interno</option>
                      <option value="uber">Uber Eats</option>
                      <option value="deliveroo">Deliveroo</option>
                      <option value="just-eat">Just Eat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Raggio Consegna (km)</label>
                    <input
                      type="number"
                      value={settings.delivery.deliveryRadius}
                      onChange={(e) => updateSetting('delivery', 'deliveryRadius', parseInt(e.target.value))}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Ordine Minimo (€)</label>
                    <input
                      type="number"
                      value={settings.delivery.minOrderAmount}
                      onChange={(e) => updateSetting('delivery', 'minOrderAmount', parseFloat(e.target.value))}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Costo Consegna (€)</label>
                    <input
                      type="number"
                      value={settings.delivery.deliveryFee}
                      onChange={(e) => updateSetting('delivery', 'deliveryFee', parseFloat(e.target.value))}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Consegna Gratis da (€)</label>
                    <input
                      type="number"
                      value={settings.delivery.freeDeliveryThreshold}
                      onChange={(e) => updateSetting('delivery', 'freeDeliveryThreshold', parseFloat(e.target.value))}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Tempo Stimato (min)</label>
                    <input
                      type="number"
                      value={settings.delivery.estimatedTime}
                      onChange={(e) => updateSetting('delivery', 'estimatedTime', parseInt(e.target.value))}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Google Maps API Key</label>
                    <input
                      type="text"
                      value={settings.delivery.googleMapsApiKey}
                      onChange={(e) => updateSetting('delivery', 'googleMapsApiKey', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* API Keys */}
            {activeTab === 'api' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">API Keys & Integrazioni</h3>

                <div className="space-y-3 md:space-y-4">
                  {[
                    { key: 'googleMaps', label: 'Google Maps API Key', icon: MapPin },
                    { key: 'firebase', label: 'Firebase API Key', icon: Bell },
                    { key: 'stripe', label: 'Stripe API Key', icon: CreditCard },
                    { key: 'twilio', label: 'Twilio API Key', icon: MessageSquare },
                    { key: 'sendgrid', label: 'SendGrid API Key', icon: Mail }
                  ].map(item => {
                    const Icon = item.icon
                    return (
                      <div key={item.key} className="border border-gray-200 rounded-lg p-3 md:p-4">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                          <Icon className="w-4 h-4 md:w-5 md:h-5 text-orange-600 flex-shrink-0" />
                          <h4 className="text-sm md:text-base font-medium text-gray-900">{item.label}</h4>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type={showApiKey[item.key] ? 'text' : 'password'}
                            value={settings.apiKeys[item.key]}
                            onChange={(e) => updateSetting('apiKeys', item.key, e.target.value)}
                            className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                            placeholder="Inserisci API key..."
                          />
                          <button
                            onClick={() => toggleApiKeyVisibility(item.key)}
                            className="px-2 md:px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0"
                          >
                            {showApiKey[item.key] ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(settings.apiKeys[item.key])}
                            className="px-2 md:px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0"
                          >
                            <Copy className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Impostazioni Sicurezza</h3>

                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 pr-3">
                      <h4 className="text-sm md:text-base font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-xs md:text-sm text-gray-600">Richiedi 2FA per tutti gli admin</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorEnabled}
                        onChange={(e) => updateSetting('security', 'twoFactorEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Session Timeout (min)</label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Password Min Length</label>
                      <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Max Login Attempts</label>
                      <input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Lockout Duration (min)</label>
                      <input
                        type="number"
                        value={settings.security.lockoutDuration}
                        onChange={(e) => updateSetting('security', 'lockoutDuration', parseInt(e.target.value))}
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 pr-3">
                      <h4 className="text-sm md:text-base font-medium text-gray-900">Richiedi Caratteri Speciali</h4>
                      <p className="text-xs md:text-sm text-gray-600">Password deve contenere caratteri speciali</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.security.requireSpecialChars}
                        onChange={(e) => updateSetting('security', 'requireSpecialChars', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayoutNew>
  )
}

export default AdminSettingsPageNew
