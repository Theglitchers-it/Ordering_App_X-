import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Search, Plus, Edit, Trash2, Eye, Upload, Download,
  X, Save, Image as ImageIcon, DollarSign, Tag, Clock
} from 'lucide-react'
import { foodItems } from '../../data/foodData'

function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
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
    image: '',
    allergens: [],
    variants: [],
    addOns: []
  })

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/admin/login')
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
      image: '',
      allergens: [],
      variants: [],
      addOns: []
    })
  }

  const handleEdit = (product) => {
    setIsEditing(true)
    setSelectedProduct(product)
    setFormData({
      ...product,
      allergens: product.allergens || [],
      variants: product.variants || [],
      addOns: product.addOns || []
    })
  }

  const handleSave = () => {
    // Qui andresti a salvare nel database
    console.log('Saving product:', formData)
    setIsEditing(false)
    setIsCreating(false)
    // Ricarica prodotti (mock)
    loadProducts()
  }

  const handleDelete = (productId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      // Qui andresti a eliminare dal database
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Gestione Prodotti</h2>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Nuovo Prodotto</span>
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca prodotti..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50">
              <Download className="w-5 h-5" />
              <span>Esporta CSV</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50">
              <Upload className="w-5 h-5" />
              <span>Importa CSV</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 truncate">{product.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">€{product.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">{product.rating} ⭐</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {(isEditing || isCreating) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full my-8"
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-2xl font-bold">
                {isCreating ? 'Nuovo Prodotto' : 'Modifica Prodotto'}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setIsCreating(false)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Titolo Prodotto *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="Es: Margherita Pizza"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Seleziona categoria</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prezzo (€) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      placeholder="12.99"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tempo di Preparazione (min)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({...formData, prepTime: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      placeholder="25"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chef / Autore
                  </label>
                  <input
                    type="text"
                    value={formData.chef}
                    onChange={(e) => setFormData({...formData, chef: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="Chef Giuseppe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Descrizione dettagliata del prodotto..."
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Immagine
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                {formData.image && (
                  <div className="mt-4">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setIsCreating(false)
                }}
                className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                <Save className="w-5 h-5" />
                <span>Salva Prodotto</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage
