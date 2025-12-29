import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const SaaSCTA = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-32 bg-gradient-to-br from-primary via-secondary to-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
            Pronto a Trasformare il Tuo Ristorante?
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
            Unisciti a centinaia di ristoratori che hanno già digitalizzato il loro locale.
            Setup in 5 minuti, risultati immediati.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
            <Link
              to="/merchant/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary rounded-xl font-semibold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105"
            >
              Inizia la Prova Gratuita
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a
              href="mailto:info@orderhub.com"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold text-base sm:text-lg border-2 border-white/30 transition-all duration-200"
            >
              Contatta il Team
            </a>
          </div>

          {/* Trust Note */}
          <p className="text-white/80 text-xs sm:text-sm mt-6 sm:mt-8 px-4">
            🔒 Nessuna carta di credito richiesta · 14 giorni di prova gratuita · Cancella quando vuoi
          </p>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default SaaSCTA;
