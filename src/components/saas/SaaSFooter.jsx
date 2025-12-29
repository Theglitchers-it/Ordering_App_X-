import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Facebook, Instagram, Linkedin, Twitter, Mail } from 'lucide-react';

const SaaSFooter = () => {
  const footerSections = [
    {
      title: 'Prodotto',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Prezzi', href: '#pricing' },
        { label: 'Demo', href: '#demo' },
        { label: 'Integrazioni', href: '#' }
      ]
    },
    {
      title: 'Azienda',
      links: [
        { label: 'Chi Siamo', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Carriere', href: '#' },
        { label: 'Partner', href: '#' }
      ]
    },
    {
      title: 'Supporto',
      links: [
        { label: 'FAQ', href: '#' },
        { label: 'Contatti', href: '#contact' },
        { label: 'Documentazione', href: '#' },
        { label: 'Guida', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Termini di Servizio', href: '#' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'GDPR', href: '#' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg sm:rounded-xl flex items-center justify-center">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">OrderHub</span>
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
              La piattaforma SaaS per digitalizzare il tuo ristorante in 5 minuti.
            </p>
            {/* Social Links */}
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">{section.title}</h3>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors duration-200 text-xs sm:text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <div className="max-w-md">
            <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Resta Aggiornato</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
              Ricevi news, tips e offerte esclusive direttamente nella tua inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="La tua email"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors duration-200"
              />
              <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary hover:bg-opacity-90 rounded-lg font-medium transition-all duration-200 flex items-center">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-400 gap-3 sm:gap-0">
          <p>© 2025 OrderHub. Tutti i diritti riservati.</p>
          <p>
            Made with ❤️ in Italy
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SaaSFooter;
