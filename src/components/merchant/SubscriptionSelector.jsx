import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Check,
  Star,
  Zap,
  TrendingUp,
  Crown,
  Sparkles
} from 'lucide-react';

const SubscriptionSelector = ({ selectedPlan, onChange }) => {
  const [selected, setSelected] = useState(selectedPlan.plan || 'business');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      icon: Zap,
      popular: false,
      description: 'Perfetto per iniziare',
      features: [
        '1 Location',
        'Fino a 10 Tavoli',
        'Menu Digitale Illimitato',
        'QR Codes Personalizzati',
        'Gestione Ordini Base',
        'Analytics Base',
        'Supporto Email'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'business',
      name: 'Business',
      price: 79,
      icon: Star,
      popular: true,
      description: 'Il più scelto dai ristoratori',
      features: [
        '3 Locations',
        'Fino a 50 Tavoli',
        'Menu Digitale Illimitato',
        'QR Codes Personalizzati',
        'Gestione Ordini Avanzata',
        'Analytics Avanzate',
        'Dashboard Personalizzata',
        'Supporto Prioritario',
        'Branding Personalizzato',
        'Integrazione WhatsApp'
      ],
      color: 'from-primary to-secondary',
      badge: '🔥 PIÙ POPOLARE'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: null,
      icon: Crown,
      popular: false,
      description: 'Soluzione su misura',
      features: [
        'Locations Illimitate',
        'Tavoli Illimitati',
        'Multi-Brand Management',
        'API Access Completo',
        'White Label',
        'Account Manager Dedicato',
        'Formazione Personalizzata',
        'SLA 99.9% Uptime',
        'Backup Giornalieri',
        'Custom Integrations'
      ],
      color: 'from-purple-500 to-purple-600',
      badge: '👑 ENTERPRISE'
    }
  ];

  useEffect(() => {
    const selectedPlanData = plans.find(p => p.id === selected);
    onChange({
      plan: selected,
      price: selectedPlanData?.price || 0
    });
  }, [selected]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Scegli il Piano Perfetto per Te
        </h2>
        <p className="text-gray-600">
          Tutti i piani includono 14 giorni di prova gratuita
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelected(plan.id)}
            className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-200 ${
              selected === plan.id
                ? 'border-primary shadow-xl scale-105 bg-gradient-to-br from-orange-50 to-white'
                : 'border-gray-200 hover:border-primary hover:shadow-lg bg-white'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  {plan.badge}
                </div>
              </div>
            )}

            {plan.badge && !plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  {plan.badge}
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                {/* Price */}
                <div className="mb-4">
                  {plan.price ? (
                    <>
                      <div className="flex items-baseline justify-center space-x-2">
                        <span className="text-4xl font-bold text-gray-900">
                          €{plan.price}
                        </span>
                        <span className="text-gray-600">/mese</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Fatturazione mensile
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-gray-900">
                        Contattaci
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Prezzo personalizzato
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mt-0.5`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Select Button */}
              <button
                onClick={() => setSelected(plan.id)}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  selected === plan.id
                    ? `bg-gradient-to-r ${plan.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selected === plan.id ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Check className="w-5 h-5" />
                    <span>Selezionato</span>
                  </span>
                ) : (
                  'Seleziona Piano'
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
        >
          <Sparkles className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-900">
            14 Giorni Gratis
          </p>
          <p className="text-xs text-green-700 mt-1">
            Nessuna carta richiesta
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
        >
          <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-blue-900">
            Upgrade Facile
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Cambia piano in ogni momento
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center"
        >
          <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-purple-900">
            Cancella Quando Vuoi
          </p>
          <p className="text-xs text-purple-700 mt-1">
            Nessun vincolo contrattuale
          </p>
        </motion.div>
      </div>

      {/* FAQ Link */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Hai domande sui piani?{' '}
          <a href="#" className="text-primary hover:underline font-medium">
            Consulta le FAQ
          </a>
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSelector;
