import { useState, useEffect } from 'react';
import * as productService from '../../api/productService';

/**
 * Hook for fetching products
 *
 * Usage:
 * const { products, loading, error, refresh } = useProducts({ merchant_id: 1 });
 */
export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await productService.getProducts({
        ...filters,
        ...customFilters,
      });

      if (result.success) {
        setProducts(result.products || []);
        setPagination(result.pagination);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    try {
      const result = await productService.createProduct(productData);

      if (result.success) {
        // Add to local state
        setProducts((prev) => [result.product, ...prev]);
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const result = await productService.updateProduct(productId, updates);

      if (result.success) {
        // Update local state
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? result.product : p))
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const result = await productService.deleteProduct(productId);

      if (result.success) {
        // Remove from local state
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const toggleAvailability = async (productId) => {
    try {
      const result = await productService.toggleProductAvailability(productId);

      if (result.success) {
        // Update local state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, is_available: result.product.is_available }
              : p
          )
        );
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  return {
    products,
    pagination,
    loading,
    error,
    refresh: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
  };
}

/**
 * Hook for fetching single product
 */
export function useProduct(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await productService.getProductById(productId);

      if (result.success) {
        setProduct(result.product);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  return {
    product,
    loading,
    error,
    refresh: fetchProduct,
  };
}

export default useProducts;
