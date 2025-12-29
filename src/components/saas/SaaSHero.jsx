import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, QrCode, Smartphone, TrendingUp } from 'lucide-react';

const SaaSHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-cream-50 via-cream-100 to-white py-12 sm:py-16 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #FF6B35 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md mb-6"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">
                100+ Ristoranti Attivi
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-strongBlack mb-6 leading-tight">
              <span className="block">Il Tuo Ristorante,</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Digitale
              </span>
              <span className="block">in 5 Minuti</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0">
              Crea menu digitali, genera QR code per i tavoli e gestisci ordini in tempo reale.
              Tutto ciò di cui hai bisogno per digitalizzare il tuo locale.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8 sm:mb-12 px-4 sm:px-0">
              <Link
                to="/merchant/register"
                className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-opacity-90 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Inizia Gratis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-base sm:text-lg border-2 border-gray-200 transition-all duration-200"
              >
                Guarda Demo
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center lg:justify-start text-xs sm:text-sm text-gray-600 px-4 sm:px-0">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">Nessuna carta richiesta</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">14 giorni gratis</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">Cancella quando vuoi</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative hidden lg:block"
          >
            {/* Feature Cards */}
            <div className="relative grid grid-cols-2 gap-4">
              {/* Card 1 - QR Code */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-cream-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">QR Code</h3>
                <p className="text-sm text-gray-600">Genera codici per ogni tavolo</p>
              </motion.div>

              {/* Card 2 - Mobile Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-cream-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ordini Mobile</h3>
                <p className="text-sm text-gray-600">Direttamente dal tavolo</p>
              </motion.div>

              {/* Card 3 - Analytics (Full Width) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="col-span-2 bg-gradient-to-br from-primary to-secondary p-6 rounded-2xl shadow-xl text-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Analytics Real-Time</h3>
                    <p className="text-sm text-white/80">Monitora le performance del tuo locale</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-white/80" />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-2xl font-bold">€2,450</div>
                    <div className="text-xs text-white/70">Revenue Oggi</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">48</div>
                    <div className="text-xs text-white/70">Ordini</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">€51</div>
                    <div className="text-xs text-white/70">AOV</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-primary"
            >
              <span className="text-sm font-semibold text-primary">Setup in 5 min ⚡</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SaaSHero;
