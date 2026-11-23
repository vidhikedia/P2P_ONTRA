/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, CategoryDefinition, ProductFilterOptions, ApiResponse, PaginatedResponse } from '../types/index.ts';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SELLER_EXTENDED_LISTINGS } from '../data/mockData.ts';
import { apiClient, USE_MOCK_API, simulateNetworkDelay, createApiResponse } from './apiClient.ts';
import { formatCurrency } from '../utils/formatters.ts';

// In-memory data store for the session (ready to swap with fetch(API_BASE_URL + '/products'))
let productsCache: Product[] = [...MOCK_PRODUCTS, ...MOCK_SELLER_EXTENDED_LISTINGS];

export const productService = {
  /**
   * Fetch products with optional filtering, search, and sorting
   */
  async getProducts(filters?: ProductFilterOptions): Promise<PaginatedResponse<Product>> {
    if (!USE_MOCK_API) {
      const res = await apiClient.get<PaginatedResponse<Product>>('/products', filters);
      return res.data;
    }

    await simulateNetworkDelay(120);
    
    let result = [...productsCache];

    if (filters) {
      if (filters.category) {
        result = result.filter((p) => p.category === filters.category);
      }
      if (filters.condition) {
        result = result.filter((p) => p.condition === filters.condition);
      }
      if (filters.verifiedOnly) {
        result = result.filter((p) => p.verification.serialVerified && p.verification.authenticityGuaranteed);
      }
      if (filters.minPrice !== undefined) {
        result = result.filter((p) => p.askingPrice >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        result = result.filter((p) => p.askingPrice <= filters.maxPrice!);
      }
      if (filters.query && filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.model.toLowerCase().includes(q) ||
            p.subtitle.toLowerCase().includes(q)
        );
      }
      if (filters.brand) {
        result = result.filter((p) => p.brand.toLowerCase() === filters.brand!.toLowerCase());
      }
      if (filters.location) {
        result = result.filter((p) =>
          p.sellerLocation.toLowerCase().includes(filters.location!.toLowerCase()) ||
          (p.approximateLocation && p.approximateLocation.toLowerCase().includes(filters.location!.toLowerCase()))
        );
      }
      if (filters.deliveryMethod && filters.deliveryMethod !== 'all') {
        result = result.filter((p) =>
          p.deliveryMethods ? p.deliveryMethods.includes(filters.deliveryMethod as any) : true
        );
      }
      if (filters.invoiceOnly) {
        result = result.filter((p) => p.hasOriginalInvoice);
      }
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_low_high':
            result.sort((a, b) => a.askingPrice - b.askingPrice);
            break;
          case 'price_high_low':
            result.sort((a, b) => b.askingPrice - a.askingPrice);
            break;
          case 'trust_score':
            result.sort((a, b) => b.sellerTrustScore - a.sellerTrustScore);
            break;
          case 'newest':
          default:
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
      }
    }

    return {
      data: result,
      total: result.length,
      page: 1,
      limit: 20,
      hasMore: false,
    };
  },

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<ApiResponse<Product | null>> {
    if (!USE_MOCK_API) {
      return apiClient.get<Product | null>(`/products/${id}`);
    }

    await simulateNetworkDelay(80);
    const item = productsCache.find((p) => p.id === id) || null;
    return createApiResponse(item);
  },

  /**
   * Get all product categories
   */
  async getCategories(): Promise<ApiResponse<CategoryDefinition[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<CategoryDefinition[]>('/categories');
    }

    await simulateNetworkDelay(50);
    return createApiResponse(MOCK_CATEGORIES);
  },

  /**
   * Submit a binding peer-to-peer purchase offer
   */
  async submitOffer(productId: string, offerAmount: number, message?: string): Promise<ApiResponse<{ offerId: string; status: string }>> {
    if (!USE_MOCK_API) {
      return apiClient.post<{ offerId: string; status: string }>(`/products/${productId}/offers`, {
        offerAmount,
        message,
      });
    }

    await simulateNetworkDelay(250);
    const targetProduct = productsCache.find((p) => p.id === productId);
    if (!targetProduct) {
      throw new Error('Product not found');
    }

    if (targetProduct.minOfferAllowed && offerAmount < targetProduct.minOfferAllowed) {
      throw new Error(`Minimum offer for this item is ${formatCurrency(targetProduct.minOfferAllowed)}`);
    }

    return createApiResponse({
      offerId: `off_${Date.now()}`,
      status: 'offer_submitted_to_seller',
    }, `Offer of ${formatCurrency(offerAmount)} submitted to seller with escrow reservation guarantee.`);
  },

  /**
   * Add a new verified product listing or draft (Seller role)
   */
  async createListing(
    newProduct: Omit<Product, 'id' | 'createdAt' | 'status'>,
    status: 'active' | 'draft' = 'active'
  ): Promise<ApiResponse<Product>> {
    if (!USE_MOCK_API) {
      return apiClient.post<Product>('/products', {
        ...newProduct,
        status,
      });
    }

    await simulateNetworkDelay(300);
    const created: Product = {
      ...newProduct,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status,
      viewsCount: 0,
      savesCount: 0,
      offersCount: 0,
    };
    productsCache = [created, ...productsCache];
    return createApiResponse(
      created,
      status === 'draft' ? 'Listing draft saved safely.' : 'Listing published with ONTRA verified criteria checklist.'
    );
  },

  /**
   * Update an existing listing's information (Blocked if under active order)
   */
  async updateListing(id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    if (!USE_MOCK_API) {
      return apiClient.put<Product>(`/products/${id}`, updates);
    }

    await simulateNetworkDelay(200);
    const index = productsCache.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Listing not found');
    }
    const current = productsCache[index];
    if (current.status === 'escrow_locked') {
      throw new Error('Historical evidence is locked during active escrow inspection.');
    }
    const updated = { ...current, ...updates };
    productsCache[index] = updated;
    return createApiResponse(updated, 'Listing updated successfully.');
  },

  /**
   * Update listing status (e.g. pause, unpause, draft to active, unavailable)
   */
  async updateListingStatus(id: string, status: Product['status']): Promise<ApiResponse<Product>> {
    if (!USE_MOCK_API) {
      return apiClient.patch<Product>(`/products/${id}/status`, { status });
    }

    await simulateNetworkDelay(150);
    const index = productsCache.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Listing not found');
    }
    productsCache[index] = { ...productsCache[index], status };
    return createApiResponse(productsCache[index], `Listing status changed to ${status}.`);
  },

  /**
   * Delete eligible listing (Only drafts or inactive listings without active orders)
   */
  async deleteListing(id: string): Promise<ApiResponse<boolean>> {
    if (!USE_MOCK_API) {
      return apiClient.delete<boolean>(`/products/${id}`);
    }

    await simulateNetworkDelay(180);
    const item = productsCache.find((p) => p.id === id);
    if (!item) {
      throw new Error('Listing not found');
    }
    if (item.status === 'escrow_locked') {
      throw new Error('Cannot delete an item that is currently under escrow.');
    }
    productsCache = productsCache.filter((p) => p.id !== id);
    return createApiResponse(true, 'Listing removed.');
  }
};
