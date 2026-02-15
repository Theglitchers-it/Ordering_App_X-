import { useState, useEffect, useMemo } from 'react'
import * as productService from '../api/productService'
import { categories as staticCategories, foodItems, getFoodsByMerchant } from '../data/foodData'
import { foods } from '../data/mockData'

const USE_API = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined'

const normalizeProduct = (p) => ({
  id: p.id,
  name: p.name,
  title: p.name,
  description: p.description || '',
  price: parseFloat(p.price),
  image: p.image_url || p.image,
  rating: parseFloat(p.average_rating || p.rating || 4.5),
  category: p.category?.name || p.category || 'altro',
  deliveryTime: p.preparation_time ? `${p.preparation_time} min` : '15-25 min',
  is_available: p.is_available !== false,
  is_featured: p.is_featured || false,
  calories: p.calories,
  allergens: p.allergens
})

export function useProducts(merchantId = null) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (USE_API) {
      loadFromAPI()
    } else {
      loadFromStaticData()
    }
  }, [merchantId])

  const loadFromAPI = async () => {
    setLoading(true)
    setError(null)
    try {
      const filters = { is_available: true, limit: 100 }
      if (merchantId) filters.merchant_id = merchantId
      const result = await productService.getProducts(filters)
      if (result.success && result.products?.length > 0) {
        setProducts(result.products.map(normalizeProduct))
      } else {
        // Fallback to static data if API returns empty or fails
        loadFromStaticData()
      }
    } catch {
      loadFromStaticData()
    } finally {
      setLoading(false)
    }
  }

  const loadFromStaticData = () => {
    let items = merchantId ? getFoodsByMerchant(merchantId) : foodItems
    const mapped = items.map(item => ({
      id: item.id,
      name: item.title || item.name,
      title: item.title || item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      rating: item.rating,
      category: item.category,
      deliveryTime: item.deliveryTime
    }))
    setProducts([...mapped, ...foods])
    setLoading(false)
  }

  const categories = useMemo(() => {
    if (USE_API && products.length > 0) {
      const unique = [...new Set(products.map(p => p.category))].filter(Boolean)
      const categoryIcons = { pizza: '🍕', pasta: '🍝', burgers: '🍔', desserts: '🍰', drinks: '🥤', salads: '🥗', pesce: '🐟', carne: '🥩', antipasti: '🥖' }
      return [
        { id: 'all', label: 'Tutte', icon: '🍽️' },
        ...unique.map(name => ({
          id: name.toLowerCase(),
          label: name.charAt(0).toUpperCase() + name.slice(1),
          icon: categoryIcons[name.toLowerCase()] || '🍽️'
        }))
      ]
    }
    return staticCategories
  }, [products])

  return { products, categories, loading, error, refresh: USE_API ? loadFromAPI : loadFromStaticData }
}

export function useProductById(productId) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productId) return

    if (USE_API) {
      productService.getProductById(productId).then(result => {
        if (result.success) {
          setProduct(normalizeProduct(result.product))
        } else {
          findInStaticData()
        }
        setLoading(false)
      }).catch(() => {
        findInStaticData()
        setLoading(false)
      })
    } else {
      findInStaticData()
      setLoading(false)
    }

    function findInStaticData() {
      const found = [...foodItems, ...foods].find(f =>
        f.id === productId || f.id === parseInt(productId) || String(f.id) === String(productId)
      )
      if (found) {
        setProduct({
          ...found,
          name: found.title || found.name,
          title: found.title || found.name
        })
      }
    }
  }, [productId])

  return { product, loading }
}
