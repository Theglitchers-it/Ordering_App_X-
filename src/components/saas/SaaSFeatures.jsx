import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, QrCode, BarChart3, Palette, Building2, Headphones } from 'lucide-react';

const SaaSFeatures = () => {
  const features = [
    {
      icon: Smartphone,
      title: 'Menu Digitali Personalizzabili',
      description: 'Crea il tuo menu digitale con immagini, descrizioni, prezzi e varianti. Modifica tutto in tempo reale senza stampare nulla.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Dashboard Analytics',
      description: 'Monitora vendite, piatti più ordinati, orari di punta e revenue in tempo reale. Decisioni basate sui dati.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: QrCode,
      title: 'Gestione Ordini Automatizzata',
      description: 'Gli ordini arrivano direttamente in cucina con il numero del tavolo. Zero errori, zero attese.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Building2,
      title: 'Multi-Ristorante',
      description: 'Gestisci più location dalla stessa piattaforma. Perfetto per catene e gruppi di ristoranti.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Palette,
      title: 'Personalizzazione Completa Brand',
      description: 'Logo, colori, font personalizzati. Il menu digitale rispecchia al 100% la tua identità.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Headphones,
      title: 'Supporto Clienti 24/7',
      description: 'Team di supporto dedicato sempre disponibile. Chat live, email e telefono per risolvere ogni problema.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="features" className="py-12 sm:py-16 lg:py-32 bg-white">
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
            Perché Scegliere{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              OrderHub
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Tutto ciò di cui hai bisogno per portare il tuo ristorante nell'era digitale.
            Semplice, veloce, efficace.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-cream-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border border-cream-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default SaaSFeatures;
