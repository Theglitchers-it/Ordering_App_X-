import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SaaSHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Prezzi', href: '#pricing' },
    { label: 'Contatti', href: '#contact' }
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    // Wait for menu to close before scrolling
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        const offset = 60; // Header height
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-cream-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg sm:rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
              <Utensils className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-strongBlack">
              OrderHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-700 hover:text-primary transition-colors duration-200 font-medium"
            >
              Accedi
            </Link>
            <Link
              to="/merchant/register"
              className="px-6 py-2.5 bg-primary hover:bg-opacity-90 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              Prova Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-cream-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-cream-200 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className="block px-4 py-2 text-gray-700 hover:bg-cream-100 rounded-lg transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 space-y-2 border-t border-cream-200">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-center text-gray-700 hover:bg-cream-100 rounded-lg transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Accedi
                </Link>
                <Link
                  to="/merchant/register"
                  className="block px-4 py-2.5 text-center bg-primary text-white rounded-lg font-medium shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Prova Gratis
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SaaSHeader;
