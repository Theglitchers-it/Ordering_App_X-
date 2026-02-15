import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Camera, Mail, Phone, MapPin, Calendar, Award,
  Edit2, Save, X, Trophy, Star, Gift, ShoppingBag, Heart,
  Bell, LogOut, User
} from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useLoyalty } from '../context/LoyaltyContext'
import { useOrders } from '../context/OrdersContext'
import { useFavorites } from '../context/FavoritesContext'
import Header from '../components/common/Header'
import SpotlightCard from '../components/common/SpotlightCard'

function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateProfile, updateProfileImage, logout } = useUser()
  const { loyaltyPoints, tier, currentTier, nextTier } = useLoyalty()
  const { orders } = useOrders()
  const { favorites } = useFavorites()

  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(user || {
    name: '',
    email: '',
    phone: '',
    address: '',
    joinedDate: new Date().toISOString(),
    profileImage: null
  })
  const fileInputRef = useRef(null)

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Show loading or null if user doesn't exist
  if (!user) {
    return null
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateProfileImage(reader.result)
        setEditedUser(prev => ({ ...prev, profileImage: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    updateProfile(editedUser)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedUser(user)
    setIsEditing(false)
  }

  const getTierColor = () => {
    const colors = {
      Bronze: 'from-orange-400 to-orange-600',
      Silver: 'from-gray-300 to-gray-500',
      Gold: 'from-yellow-400 to-yellow-600',
      Platinum: 'from-purple-400 to-purple-600'
    }
    return colors[tier] || colors.Bronze
  }

  // Interactive stats with navigation
  const stats = [
    {
      icon: ShoppingBag,
      label: 'Ordini',
      value: orders.length,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      route: '/notifications',
      gradient: 'from-blue-50 to-cyan-50'
    },
    {
      icon: Heart,
      label: 'Preferiti',
      value: favorites.length,
      color: 'text-red-600',
      bg: 'bg-red-50',
      route: '/favorites',
      gradient: 'from-red-50 to-pink-50'
    },
    {
      icon: Award,
      label: 'Punti',
      value: loyaltyPoints,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      route: '/loyalty',
      gradient: 'from-purple-50 to-indigo-50'
    },
    {
      icon: Trophy,
      label: 'Tier',
      value: tier,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      route: '/loyalty',
      gradient: 'from-yellow-50 to-orange-50'
    }
  ]

  const progress = nextTier
    ? ((loyaltyPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Indietro</span>
        </motion.button>

        {/* Profile Header Card with Spotlight Effect */}
        <SpotlightCard
          className="mb-6"
          spotlightColor="rgba(255, 255, 255, 0.35)"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${getTierColor()} rounded-3xl p-6 sm:p-8 shadow-xl`}
          >
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl sm:text-6xl font-bold text-gray-400">
                    {user.name[0].toUpperCase()}
                  </span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
              >
                <Camera className="w-4 h-4 text-gray-700" />
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {user.name}
              </h1>
              <p className="text-white/90 text-sm sm:text-base mb-3">
                {user.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                  <p className="text-white text-xs font-medium">
                    Membro dal {formatDate(user.joinedDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white text-gray-700 px-6 py-2.5 rounded-full font-semibold shadow-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Annulla</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  <span>Modifica</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Loyalty Progress */}
          <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-white" />
                <span className="text-white font-bold">{tier}</span>
              </div>
              <span className="text-white text-sm font-medium">
                {loyaltyPoints} {nextTier && `/ ${nextTier.minPoints}`} punti
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-white h-full rounded-full shadow-lg"
              />
            </div>
            {nextTier && (
              <p className="text-white/90 text-xs mt-2 text-center font-semibold">
                🎯 Sei a {nextTier.minPoints - loyaltyPoints} punti dal livello {nextTier.name} — ordina ora e sblocca -{nextTier.discount}%
              </p>
            )}
          </div>
          </motion.div>
        </SpotlightCard>

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.button
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(stat.route)}
              className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer text-left`}
            >
              <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
            </motion.button>
          ))}
        </div>

        {/* Personal Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 shadow-lg mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Informazioni Personali</h2>
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="bg-primary text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Salva</span>
              </motion.button>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 p-3 rounded-xl">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-1">Nome Completo</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none font-medium"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{user.name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none font-medium"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{user.email}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4">
              <div className="bg-green-50 p-3 rounded-xl">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-1">Telefono</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedUser.phone}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none font-medium"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{user.phone}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-4">
              <div className="bg-purple-50 p-3 rounded-xl">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-1">Indirizzo</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.address}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none font-medium"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{user.address}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Change Account Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="w-full bg-blue-50 text-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>Cambia Account</span>
          </motion.button>

          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Esci dall'Account</span>
          </motion.button>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
