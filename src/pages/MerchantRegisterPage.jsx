import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Mail, Lock, Building2, ArrowRight } from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { generateSlugFromName, isSlugAvailable } from '../utils/tenantUtils';

const MerchantRegisterPage = () => {
  const navigate = useNavigate();
  const { addMerchant } = useMerchant();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'pizzeria'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validazione
    if (!formData.name || !formData.email || !formData.password) {
      setError('Compila tutti i campi');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La password deve essere almeno 6 caratteri');
      setLoading(false);
      return;
    }

    // Genera slug
    const slug = generateSlugFromName(formData.name);

    if (!isSlugAvailable(slug)) {
      setError('Questo nome è già in uso. Scegli un nome diverso.');
      setLoading(false);
      return;
    }

    // Crea merchant
    const newMerchant = addMerchant({
      name: formData.name,
      slug: slug,
      description: `${formData.type} - ${formData.name}`,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=200&background=FF6B35&color=fff`,
      brandColors: {
        primary: '#FF6B35',
        secondary: '#F7931E',
        accent: '#C0392B'
      },
      contact: {
        email: formData.email,
        phone: '',
        address: '',
        website: ''
      },
      subscription: {
        plan: 'starter',
        price: 29,
        currency: 'EUR',
        billingCycle: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        status: 'trial'
      },
      settings: {
        commissionRate: 0.12,
        tableCount: 10,
        averageOrderValue: 0,
        openingHours: {}
      },
      owner: {
        id: `user_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: 'MERCHANT_ADMIN'
      }
    });

    // Salva auth
    localStorage.setItem('merchantAuth', JSON.stringify({
      merchantId: newMerchant.id,
      email: formData.email,
      role: 'MERCHANT_ADMIN'
    }));

    setLoading(false);

    // Redirect a onboarding wizard
    navigate('/merchant/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Utensils className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-strongBlack">OrderHub</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-cream-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registra il Tuo Locale</h1>
          <p className="text-gray-600 mb-8">Inizia la tua prova gratuita di 14 giorni</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome Ristorante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Ristorante
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Pizzeria Rossi"
                  required
                />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo di Locale
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="pizzeria">Pizzeria</option>
                <option value="ristorante">Ristorante</option>
                <option value="bar">Bar</option>
                <option value="trattoria">Trattoria</option>
                <option value="altro">Altro</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="info@pizzeriarossi.it"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Minimo 6 caratteri"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-opacity-90 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Creazione...' : 'Crea Account'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Hai già un account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Accedi
              </Link>
            </p>
          </div>

          {/* Trust */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              🔒 14 giorni di prova gratuita · Nessuna carta richiesta · Cancella quando vuoi
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MerchantRegisterPage;
