/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/index.ts';
import { useToast } from '../hooks/useToast.ts';

interface WishlistContextValue {
  wishlistIds: string[];
  wishlistCount: number;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pre-seed with 2 realistic bookmarked items
  const [wishlistIds, setWishlistIds] = useState<string[]>([
    'prod_speedmaster_pro',
    'prod_audeze_lcd_reference',
  ]);
  const { showToast } = useToast();

  const isInWishlist = (id: string) => wishlistIds.includes(id);

  const toggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(
          'Removed from Wishlist',
          `${product.brand} ${product.model} removed from your saved items.`,
          'info'
        );
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(
          'Saved to Wishlist',
          `${product.brand} ${product.model} bookmarked with serial tracking alerts.`,
          'success'
        );
        return [...prev, product.id];
      }
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
