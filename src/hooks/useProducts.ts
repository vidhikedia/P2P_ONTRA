/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilterOptions } from '../types/index.ts';
import { productService } from '../services/productService.ts';

export function useProducts(initialFilters?: ProductFilterOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilterOptions>(initialFilters || {});

  const fetchProducts = useCallback(async (currentFilters: ProductFilterOptions) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts(currentFilters);
      setProducts(response.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  const updateFilters = (newFilters: Partial<ProductFilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    products,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: () => fetchProducts(filters),
  };
}
