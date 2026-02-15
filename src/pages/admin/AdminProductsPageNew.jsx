import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Search, Plus, Edit, Trash2, Eye, X, Image as ImageIcon,
  DollarSign, Tag, Grid, List, Upload, Download
} from 'lucide-react'
import { useRBAC, PERMISSIONS } from '../../context/RBACContext'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'
import productService from '../../api/productService'

const USE_API = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined'

function AdminProductsPageNew() {
  const navigate = useNavigate()
  const { hasPermission } = useRBAC()
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('view') // 'view', 'create', 'edit'

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')

    if (!hasPermission(PERMISSIONS.VIEW_PRODUCTS)) {
      navigate('/admin/dashboard')
    }

    loadProducts()
  }, [navigate, hasPermission])

  const loadProducts = async () => {
    if (USE_API) {
      try {
        const result = await productService.getProducts()
        if (result.success && result.products) {
          setProducts(result.products.map(p => ({
            ...p,
            available: p.is_available ?? p.available ?? true,
            prepTime: p.prep_time ?? p.prepTime ?? 15,
            tags: p.tags || [],
            variants: p.variants || [],
            addons: p.addons || [],
            sold: p.total_sold ?? p.sold ?? 0,
            rating: p.average_rating ?? p.rating ?? 0
          })))
          return
        }
      } catch (e) { /* fall through to demo */ }
    }

    const saved = localStorage.getItem('products')
    if (saved) {
      setProducts(JSON.parse(saved))
    } else {
      const demoProducts = [
        {
          id: 1,
          name: 'Margherita',
          description: 'Pomodoro, mozzarella, basilico',
          price: 8.50,
          category: 'Pizza',
          image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
          available: true,
          prepTime: 15,
          tags: ['vegetariana', 'classica'],
          variants: [
            { name: 'Piccola', price: 6.50 },
            { name: 'Media', price: 8.50 },
            { name: 'Grande', price: 11.00 }
          ],
          addons: [
            { name: 'Mozzarella extra', price: 2.00 },
            { name: 'Olive', price: 1.00 }
          ],
          sold: 450,
          rating: 4.8,
          createdAt: new Date('2024-01-10').toISOString()
        },
        {
          id: 2,
          name: 'Sushi Mix',
          description: '12 pezzi assortiti',
          price: 18.90,
          category: 'Sushi',
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
          available: true,
          prepTime: 20,
          tags: ['pesce', 'premium'],
          variants: [
            { name: '12 pezzi', price: 18.90 },
            { name: '24 pezzi', price: 35.00 }
          ],
          addons: [
            { name: 'Salsa soia', price: 0.50 },
            { name: 'Wasabi', price: 0.50 }
          ],
          sold: 320,
          rating: 4.9,
          createdAt: new Date('2024-02-15').toISOString()
        },
        {
          id: 3,
          name: 'Cheeseburger',
          description: 'Hamburger con formaggio cheddar',
          price: 9.90,
          category: 'Burger',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
          available: true,
          prepTime: 10,
          tags: ['carne', 'fast-food'],
          variants: [
            { name: 'Singolo', price: 9.90 },
            { name: 'Doppio', price: 13.90 }
          ],
          addons: [
            { name: 'Bacon', price: 2.00 },
            { name: 'Patatine', price: 3.00 }
          ],
          sold: 280,
          rating: 4.5,
          createdAt: new Date('2024-03-01').toISOString()
        }
      ]
      setProducts(demoProducts)
      localStorage.setItem('products', JSON.stringify(demoProducts))
    }
  }

  const saveProducts = (updatedProducts) => {
    setProducts(updatedProducts)
    localStorage.setItem('products', JSON.stringify(updatedProducts))
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...new Set(products.map(p => p.category))]

  const handleCreate = () => {
    if (!hasPermission(PERMISSIONS.CREATE_PRODUCTS)) {
      alert('Non hai il permesso di creare prodotti')
      return
    }
    setSelectedProduct({
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      available: true,
      prepTime: 15,
      tags: [],
      variants: [],
      addons: []
    })
    setModalMode('create')
    setShowModal(true)
  }

  const handleEdit = (product) => {
    if (!hasPermission(PERMISSIONS.UPDATE_PRODUCTS)) {
      alert('Non hai il permesso di modificare prodotti')
      return
    }
    setSelectedProduct({ ...product })
    setModalMode('edit')
    setShowModal(true)
  }

  const handleView = (product) => {
    setSelectedProduct(product)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!hasPermission(PERMISSIONS.DELETE_PRODUCTS)) {
      alert('Non hai il permesso di eliminare prodotti')
      return
    }
    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      if (USE_API) {
        try {
          const result = await productService.deleteProduct(id)
          if (result.success) { await loadProducts(); return }
        } catch (e) { /* fall through */ }
      }
      const updated = products.filter(p => p.id !== id)
      saveProducts(updated)
    }
  }

  const handleSave = async () => {
    if (modalMode === 'create') {
      if (USE_API) {
        try {
          const result = await productService.createProduct(selectedProduct)
          if (result.success) { setShowModal(false); await loadProducts(); return }
        } catch (e) { /* fall through */ }
      }
      const newProduct = {
        ...selectedProduct,
        id: Math.max(0, ...products.map(p => p.id)) + 1,
        sold: 0,
        rating: 0,
        createdAt: new Date().toISOString()
      }
      saveProducts([...products, newProduct])
    } else if (modalMode === 'edit') {
      if (USE_API) {
        try {
          const result = await productService.updateProduct(selectedProduct.id, selectedProduct)
          if (result.success) { setShowModal(false); await loadProducts(); return }
        } catch (e) { /* fall through */ }
      }
      const updated = products.map(p =>
        p.id === selectedProduct.id ? selectedProduct : p
      )
      saveProducts(updated)
    }
    setShowModal(false)
  }

  const handleToggleAvailable = async (id) => {
    if (!hasPermission(PERMISSIONS.UPDATE_PRODUCTS)) {
      alert('Non hai il permesso di modificare prodotti')
      return
    }
    if (USE_API) {
      try {
        const result = await productService.toggleProductAvailability(id)
        if (result.success) { await loadProducts(); return }
      } catch (e) { /* fall through */ }
    }
    const updated = products.map(p =>
      p.id === id ? { ...p, available: !p.available } : p
    )
    saveProducts(updated)
  }

  const addVariant = () => {
    setSelectedProduct({
      ...selectedProduct,
      variants: [...(selectedProduct.variants || []), { name: '', price: 0 }]
    })
  }

  const removeVariant = (index) => {
    setSelectedProduct({
      ...selectedProduct,
      variants: selectedProduct.variants.filter((_, i) => i !== index)
    })
  }

  const addAddon = () => {
    setSelectedProduct({
      ...selectedProduct,
      addons: [...(selectedProduct.addons || []), { name: '', price: 0 }]
    })
  }

  const removeAddon = (index) => {
    setSelectedProduct({
      ...selectedProduct,
      addons: selectedProduct.addons.filter((_, i) => i !== index)
    })
  }

  return (
    <AdminLayoutNew>
      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestione Prodotti</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'prodotto trovato' : 'prodotti trovati'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {hasPermission(PERMISSIONS.BULK_IMPORT_PRODUCTS) && (
              <button
                onClick={() => alert('Import CSV in arrivo!')}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 md:px-4 py-2 rounded-lg hover:bg-gray-200 text-sm md:text-base"
              >
                <Upload className="w-4 h-4 md:w-5 md:h-5" />
                <span>Import CSV</span>
              </button>
            )}
            {hasPermission(PERMISSIONS.CREATE_PRODUCTS) && (
              <button
                onClick={handleCreate}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 md:px-4 py-2 rounded-lg hover:shadow-lg transition-all text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span>Nuovo Prodotto</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-gray-200 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca prodotti..."
                className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-orange-500 focus:outline-none text-sm md:text-base"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-orange-500 focus:outline-none appearance-none bg-white text-sm md:text-base"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Tutte le categorie' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-center sm:justify-start gap-2 bg-gray-100 rounded-lg md:rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <List className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl md:rounded-2xl p-8 md:p-12 text-center shadow-sm border border-gray-200">
          <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
          <p className="text-sm md:text-base text-gray-500">Nessun prodotto trovato</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-40 md:h-48 bg-gray-100">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleToggleAvailable(product.id)}
                    className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                      product.available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.available ? 'Disponibile' : 'Non disp.'}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 md:p-4">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <span className="text-xl md:text-2xl font-bold text-orange-600">€{product.price.toFixed(2)}</span>
                  <span className="text-xs md:text-sm text-gray-500">{product.category}</span>
                </div>

                <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                  <span>⏱️ {product.prepTime} min</span>
                  <span>⭐ {product.rating || 0}/5</span>
                  <span>📦 {product.sold || 0}</span>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3 md:mb-4">
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleView(product)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    title="Visualizza"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {hasPermission(PERMISSIONS.UPDATE_PRODUCTS) && (
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                      title="Modifica"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {hasPermission(PERMISSIONS.DELETE_PRODUCTS) && (
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      title="Elimina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <>
          {/* Mobile Cards (List Mode) */}
          <div className="block lg:hidden space-y-3">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-orange-600">€{product.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">{product.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleAvailable(product.id)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.available ? 'Disp.' : 'Non disp.'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3 pb-3 border-b">
                    <span>📦 {product.sold || 0} venduti</span>
                    <span>⭐ {product.rating || 0}/5</span>
                    <span>⏱️ {product.prepTime} min</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(product)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Dettagli
                    </button>
                    {hasPermission(PERMISSIONS.UPDATE_PRODUCTS) && (
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Modifica
                      </button>
                    )}
                    {hasPermission(PERMISSIONS.DELETE_PRODUCTS) && (
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Prodotto</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Categoria</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Prezzo</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Venduti</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Rating</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Stato</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{product.category}</td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-orange-600">€{product.price.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{product.sold || 0}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">⭐ {product.rating || 0}/5</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleAvailable(product.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.available ? 'Disponibile' : 'Non disp.'}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleView(product)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasPermission(PERMISSIONS.UPDATE_PRODUCTS) && (
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission(PERMISSIONS.DELETE_PRODUCTS) && (
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-lg md:text-2xl font-bold">
                  {modalMode === 'view' ? 'Dettagli Prodotto' :
                   modalMode === 'create' ? 'Nuovo Prodotto' : 'Modifica Prodotto'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                {modalMode === 'view' ? (
                  <>
                    {/* View Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div className="col-span-full">
                        {selectedProduct.image && (
                          <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-48 md:h-64 object-cover rounded-lg md:rounded-xl" />
                        )}
                      </div>
                      <div className="col-span-full">
                        <label className="text-xs md:text-sm font-semibold text-gray-700">Nome</label>
                        <p className="text-sm md:text-base text-gray-900">{selectedProduct.name}</p>
                      </div>
                      <div className="col-span-full">
                        <label className="text-xs md:text-sm font-semibold text-gray-700">Descrizione</label>
                        <p className="text-sm md:text-base text-gray-900">{selectedProduct.description}</p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-semibold text-gray-700">Prezzo</label>
                        <p className="text-sm md:text-base text-gray-900">€{selectedProduct.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-semibold text-gray-700">Categoria</label>
                        <p className="text-sm md:text-base text-gray-900">{selectedProduct.category}</p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-semibold text-gray-700">Tempo Prep.</label>
                        <p className="text-sm md:text-base text-gray-900">{selectedProduct.prepTime} min</p>
                      </div>
                      <div>
                        <label className="text-xs md:text-sm font-semibold text-gray-700">Stato</label>
                        <p className="text-sm md:text-base text-gray-900">{selectedProduct.available ? 'Disponibile' : 'Non disponibile'}</p>
                      </div>

                      {/* Variants */}
                      {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                        <div className="col-span-full">
                          <label className="text-xs md:text-sm font-semibold text-gray-700 block mb-2">Varianti</label>
                          <div className="space-y-2">
                            {selectedProduct.variants.map((v, i) => (
                              <div key={i} className="flex justify-between bg-gray-50 p-2 md:p-3 rounded-lg text-sm md:text-base">
                                <span>{v.name}</span>
                                <span className="font-semibold">€{v.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add-ons */}
                      {selectedProduct.addons && selectedProduct.addons.length > 0 && (
                        <div className="col-span-full">
                          <label className="text-xs md:text-sm font-semibold text-gray-700 block mb-2">Add-ons</label>
                          <div className="space-y-2">
                            {selectedProduct.addons.map((a, i) => (
                              <div key={i} className="flex justify-between bg-gray-50 p-2 md:p-3 rounded-lg text-sm md:text-base">
                                <span>{a.name}</span>
                                <span className="font-semibold">+€{a.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Create/Edit Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div className="col-span-full">
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Nome Prodotto</label>
                        <input
                          type="text"
                          value={selectedProduct.name}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                          className="w-full px-3 md:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm md:text-base"
                        />
                      </div>
                      <div className="col-span-full">
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Descrizione</label>
                        <textarea
                          value={selectedProduct.description}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                          className="w-full px-3 md:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm md:text-base"
                          rows="3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Prezzo (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={selectedProduct.price}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                          className="w-full px-3 md:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                        <input
                          type="text"
                          value={selectedProduct.category}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                          className="w-full px-3 md:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Tempo Prep. (min)</label>
                        <input
                          type="number"
                          value={selectedProduct.prepTime}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, prepTime: parseInt(e.target.value) })}
                          className="w-full px-3 md:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm md:text-base"
                        />
                      </div>
                      <div className="col-span-full">
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">URL Immagine</label>
                        <input
                          type="text"
                          value={selectedProduct.image}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, image: e.target.value })}
                          className="w-full px-3 md:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm md:text-base"
                        />
                      </div>

                      {/* Varianti */}
                      <div className="col-span-full">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs md:text-sm font-semibold text-gray-700">Varianti</label>
                          <button
                            onClick={addVariant}
                            className="text-xs md:text-sm text-orange-600 hover:text-orange-700 font-semibold"
                          >
                            + Aggiungi
                          </button>
                        </div>
                        <div className="space-y-2">
                          {selectedProduct.variants?.map((variant, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Nome"
                                value={variant.name}
                                onChange={(e) => {
                                  const newVariants = [...selectedProduct.variants]
                                  newVariants[index].name = e.target.value
                                  setSelectedProduct({ ...selectedProduct, variants: newVariants })
                                }}
                                className="flex-1 px-2 md:px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                              />
                              <input
                                type="number"
                                step="0.01"
                                placeholder="€"
                                value={variant.price}
                                onChange={(e) => {
                                  const newVariants = [...selectedProduct.variants]
                                  newVariants[index].price = parseFloat(e.target.value)
                                  setSelectedProduct({ ...selectedProduct, variants: newVariants })
                                }}
                                className="w-20 md:w-24 px-2 md:px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                              />
                              <button
                                onClick={() => removeVariant(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add-ons */}
                      <div className="col-span-full">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs md:text-sm font-semibold text-gray-700">Add-ons</label>
                          <button
                            onClick={addAddon}
                            className="text-xs md:text-sm text-orange-600 hover:text-orange-700 font-semibold"
                          >
                            + Aggiungi
                          </button>
                        </div>
                        <div className="space-y-2">
                          {selectedProduct.addons?.map((addon, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Nome"
                                value={addon.name}
                                onChange={(e) => {
                                  const newAddons = [...selectedProduct.addons]
                                  newAddons[index].name = e.target.value
                                  setSelectedProduct({ ...selectedProduct, addons: newAddons })
                                }}
                                className="flex-1 px-2 md:px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                              />
                              <input
                                type="number"
                                step="0.01"
                                placeholder="€"
                                value={addon.price}
                                onChange={(e) => {
                                  const newAddons = [...selectedProduct.addons]
                                  newAddons[index].price = parseFloat(e.target.value)
                                  setSelectedProduct({ ...selectedProduct, addons: newAddons })
                                }}
                                className="w-20 md:w-24 px-2 md:px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                              />
                              <button
                                onClick={() => removeAddon(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3 md:pt-4">
                      <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-3 md:px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm md:text-base font-medium"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg text-sm md:text-base font-medium"
                      >
                        Salva
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayoutNew>
  )
}

export default AdminProductsPageNew
