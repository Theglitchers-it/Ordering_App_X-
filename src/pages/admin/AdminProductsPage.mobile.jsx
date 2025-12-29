import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Edit, Trash2, X, Save, Image as ImageIcon,
  DollarSign, Clock, Package
} from 'lucide-react'
import { foodItems } from '../../data/foodData'
import AdminLayout from '../../components/admin/AdminLayout'

function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    chef: '',
    prepTime: '',
    rating: '4.5',
    image: ''
  })

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')
    loadProducts()
  }, [navigate])

  const loadProducts = () => {
    setProducts(foodItems)
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      chef: '',
      prepTime: '',
      rating: '4.5',
      image: ''
    })
  }

  const handleEdit = (product) => {
    setIsEditing(true)
    setFormData({ ...product })
  }

  const handleSave = () => {
    console.log('Saving product:', formData)
    setIsEditing(false)
    setIsCreating(false)
    loadProducts()
  }

  const handleDelete = (productId) => {
    if (window.confirm('Elimina questo prodotto?')) {
      console.log('Deleting product:', productId)
      loadProducts()
    }
  }

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = ['Pizza', 'Pasta', 'Burgers', 'Sushi', 'Dessert', 'Bevande', 'Insalate']

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Prodotti</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{filteredProducts.length} prodotti</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-semibold w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Nuovo</span>
          </button>
        </div>

        {/* Search - Mobile Optimized */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca prodotti..."
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Products Grid - Mobile Optimized */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm border border-gray-200">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm sm:text-base">Nessun prodotto trovato</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-32 sm:h-40 lg:h-48">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1 truncate">{product.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold text-gray-900">€{product.price.toFixed(2)}</span>
                    <span className="text-xs sm:text-sm text-gray-500">{product.rating} ⭐</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Modal - Mobile Optimized */}
      <AnimatePresence>
        {(isEditing || isCreating) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: '100%', scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '100%', scale: 1 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            >
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg sm:text-2xl font-bold">
                  {isCreating ? 'Nuovo Prodotto' : 'Modifica'}
                </h3>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setIsCreating(false)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Titolo *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                      placeholder="Es: Margherita Pizza"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                    >
                      <option value="">Seleziona</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Prezzo (€) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                        placeholder="12.99"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Tempo prep. (min)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.prepTime}
                        onChange={(e) => setFormData({...formData, prepTime: e.target.value})}
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                        placeholder="25"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-sm sm:text-base"
                    placeholder="Descrizione del prodotto..."
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    URL Immagine
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                      placeholder="https://..."
                    />
                  </div>
                  {formData.image && (
                    <div className="mt-3">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-32 sm:h-48 object-cover rounded-xl"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setIsCreating(false)
                  }}
                  className="flex-1 px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 text-sm sm:text-base"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 text-sm sm:text-base"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Salva</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

export default AdminProductsPage
