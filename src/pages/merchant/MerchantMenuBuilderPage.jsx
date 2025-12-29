import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import { getFoodsByMerchant } from '../../data/foodData';

const MerchantMenuBuilderPage = () => {
  const merchantAuth = JSON.parse(localStorage.getItem('merchantAuth') || '{}');
  const merchantId = merchantAuth.merchantId || 'merchant_1'; // Fallback for demo

  const [dishes, setDishes] = useState(getFoodsByMerchant(merchantId));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = ['all', 'pizza', 'pasta', 'burgers', 'desserts', 'drinks', 'salads'];

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/merchant/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Menu Builder</h1>
                <p className="text-gray-600 mt-1">{dishes.length} piatti nel tuo menu</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-opacity-90 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Aggiungi Piatto</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca piatti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                <option value="all">Tutte le categorie</option>
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDishes.map((dish, index) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {dish.image ? (
                    <img
                      src={dish.image}
                      alt={dish.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-900">
                      {dish.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{dish.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dish.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary">{dish.currency}{dish.price}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      dish.available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {dish.available ? 'Disponibile' : 'Non disponibile'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200">
                      <Edit2 className="w-4 h-4" />
                      <span>Modifica</span>
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredDishes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun piatto trovato</h3>
            <p className="text-gray-600">Prova a modificare i filtri di ricerca</p>
          </div>
        )}
      </div>

      {/* Add Modal (Placeholder) */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Aggiungi Nuovo Piatto</h2>
              <p className="text-gray-600 mb-6">
                Funzionalità completa in arrivo! Per ora puoi gestire i piatti esistenti.
              </p>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full px-6 py-3 bg-primary hover:bg-opacity-90 text-white rounded-lg font-semibold transition-all duration-200"
              >
                Chiudi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MerchantMenuBuilderPage;
