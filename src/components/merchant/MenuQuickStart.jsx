import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  Plus,
  X,
  DollarSign,
  Image as ImageIcon,
  Sparkles,
  ChefHat
} from 'lucide-react';

const MenuQuickStart = ({ quickMenu, onChange }) => {
  const [dishes, setDishes] = useState(quickMenu || []);
  const [showForm, setShowForm] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pizza',
    image: ''
  });

  const categories = [
    'Pizza',
    'Pasta',
    'Antipasti',
    'Secondi',
    'Contorni',
    'Dolci',
    'Bevande'
  ];

  const popularDishes = [
    { name: 'Margherita', description: 'Pomodoro, mozzarella, basilico', price: '8.50', category: 'Pizza' },
    { name: 'Carbonara', description: 'Guanciale, uova, pecorino, pepe', price: '12.00', category: 'Pasta' },
    { name: 'Bruschetta', description: 'Pomodoro fresco, aglio, basilico', price: '6.50', category: 'Antipasti' },
    { name: 'Tiramisù', description: 'Mascarpone, caffè, cacao', price: '6.00', category: 'Dolci' }
  ];

  useEffect(() => {
    onChange(dishes);
  }, [dishes]);

  const handleAddDish = () => {
    if (!newDish.name || !newDish.price) return;

    setDishes(prev => [
      ...prev,
      {
        ...newDish,
        id: Date.now(),
        price: parseFloat(newDish.price)
      }
    ]);

    setNewDish({
      name: '',
      description: '',
      price: '',
      category: 'Pizza',
      image: ''
    });
    setShowForm(false);
  };

  const handleRemoveDish = (id) => {
    setDishes(prev => prev.filter(dish => dish.id !== id));
  };

  const handleQuickAdd = (dish) => {
    setDishes(prev => [
      ...prev,
      {
        ...dish,
        id: Date.now(),
        price: parseFloat(dish.price)
      }
    ]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <ChefHat className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Crea il Tuo Primo Menu
        </h2>
        <p className="text-gray-600">
          Aggiungi alcuni piatti per iniziare. Potrai modificarli in seguito.
        </p>
      </div>

      {/* Quick Add Suggestions */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">
            Aggiungi Rapidamente
          </h3>
        </div>
        <p className="text-sm text-blue-700 mb-4">
          Clicca su un piatto popolare per aggiungerlo al tuo menu
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          {popularDishes.map((dish, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAdd(dish)}
              className="bg-white rounded-lg p-4 text-left border-2 border-blue-200 hover:border-primary transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{dish.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{dish.description}</p>
                </div>
                <span className="text-lg font-bold text-primary ml-3">
                  €{dish.price}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {dish.category}
                </span>
                <Plus className="w-4 h-4 text-primary" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Added Dishes */}
      {dishes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-primary" />
            <span>Il Tuo Menu ({dishes.length} piatti)</span>
          </h3>

          <div className="space-y-3">
            <AnimatePresence>
              {dishes.map((dish) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{dish.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className="text-xs bg-primary bg-opacity-10 text-primary px-2 py-1 rounded">
                              {dish.category}
                            </span>
                            <span className="text-lg font-bold text-primary">
                              €{parseFloat(dish.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDish(dish.id)}
                      className="ml-4 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                    >
                      <X className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add Custom Dish */}
      <div>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-all duration-200 flex items-center justify-center space-x-2 text-gray-600 hover:text-primary font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Aggiungi Piatto Personalizzato</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border-2 border-primary p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Nuovo Piatto</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Piatto *
                </label>
                <input
                  type="text"
                  value={newDish.name}
                  onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Es. Pizza Margherita"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={newDish.description}
                  onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Es. Pomodoro, mozzarella, basilico fresco"
                  rows="2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={newDish.category}
                    onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prezzo (€) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.50"
                      value={newDish.price}
                      onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="12.50"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Immagine (Opzionale)
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={newDish.image}
                    onChange={(e) => setNewDish({ ...newDish, image: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://esempio.com/immagine.jpg"
                  />
                </div>
              </div>

              <button
                onClick={handleAddDish}
                disabled={!newDish.name || !newDish.price}
                className="w-full bg-primary hover:bg-opacity-90 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Aggiungi al Menu</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Skip Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
      >
        <p className="text-sm text-yellow-800">
          💡 <strong>Tranquillo!</strong> Puoi saltare questo step e aggiungere il menu completo
          in seguito dal Menu Builder. Questo è solo per iniziare velocemente.
        </p>
      </motion.div>
    </div>
  );
};

export default MenuQuickStart;
