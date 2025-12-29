import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

const SaaSPricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: 29,
      description: 'Perfetto per piccoli locali',
      popular: false,
      features: [
        '1 Location',
        'Menu digitale illimitato',
        '10 Tavoli con QR code',
        'Gestione ordini base',
        'Supporto email',
        'Dashboard analytics base'
      ]
    },
    {
      name: 'Business',
      price: 79,
      description: 'Il più popolare',
      popular: true,
      features: [
        '3 Locations',
        'Menu digitale illimitato',
        '50 Tavoli con QR code',
        'Gestione ordini avanzata',
        'Supporto prioritario 24/7',
        'Dashboard analytics avanzate',
        'Personalizzazione brand completa',
        'Integrazione con stampanti',
        'Report export CSV'
      ]
    },
    {
      name: 'Enterprise',
      price: null,
      description: 'Per catene e gruppi',
      popular: false,
      features: [
        'Locations illimitate',
        'Menu digitali illimitati',
        'Tavoli illimitati',
        'Gestione multi-ristorante',
        'Account manager dedicato',
        'API personalizzate',
        'White label completo',
        'Integrazioni custom',
        'SLA garantito 99.9%'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-32 bg-gradient-to-br from-cream-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-strongBlack mb-3 sm:mb-4 px-2">
            Piani Tariffari{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Chiari e Trasparenti
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Scegli il piano più adatto alle tue esigenze. Nessun costo nascosto, cancella quando vuoi.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`relative bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 ${
                plan.popular ? 'border-primary' : 'border-cream-200'
              } p-6 sm:p-8 ${plan.popular ? 'md:scale-105' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary to-secondary px-4 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                    <Star className="w-4 h-4 text-white fill-current" />
                    <span className="text-white font-semibold text-sm">Più Popolare</span>
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{plan.name}</h3>
                <p className="text-sm sm:text-base text-gray-600">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6 sm:mb-8">
                {plan.price ? (
                  <>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl sm:text-5xl font-bold text-gray-900">€{plan.price}</span>
                      <span className="text-gray-600 ml-2 text-sm sm:text-base">/mese</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">Fatturato mensilmente</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl sm:text-4xl font-bold text-gray-900">Personalizzato</div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">Contattaci per un preventivo</p>
                  </>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mr-2 sm:mr-3 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                to="/merchant/register"
                className={`block text-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 ${
                  plan.popular
                    ? 'bg-primary hover:bg-opacity-90 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {plan.price ? 'Inizia Ora' : 'Contattaci'}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center text-sm sm:text-base text-gray-600 mt-8 sm:mt-12 px-4"
        >
          Tutti i piani includono 14 giorni di prova gratuita. Nessuna carta di credito richiesta.
        </motion.p>
      </div>
    </section>
  );
};

export default SaaSPricing;
