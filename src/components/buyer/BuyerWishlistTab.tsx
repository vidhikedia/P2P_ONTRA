/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { MOCK_PRODUCTS } from '../../data/mockData.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import { Button } from '../ui/Button.tsx';
import { Heart, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BuyerWishlistTab: React.FC = () => {
  const { wishlistIds, toggleWishlist } = useWishlist();

  // Look up products matching wishlist IDs
  const savedProducts = MOCK_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Saved Wishlist Items</h2>
          <p className="text-xs text-slate-500">
            Bookmarked items with verified serial tracking and price-drop alerts.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 font-bold">
          {savedProducts.length} saved
        </span>
      </div>

      {savedProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Heart className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse verified listings across electronics, horology, and designer goods to bookmark items.
          </p>
          <Link to="/explore">
            <Button variant="primary" size="sm" className="bg-blue-900 text-xs">
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedProducts.map((product) => (
            <div
              key={product.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4 text-xs"
            >
              <img
                src={product.featuredImage}
                alt={product.title}
                className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block truncate">
                  {product.brand} · {product.model}
                </span>

                <Link
                  to={`/product/${product.id}`}
                  className="font-bold text-slate-900 hover:underline line-clamp-1 block"
                >
                  {product.title}
                </Link>

                <p className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(product.askingPrice)}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-500">{product.sellerLocation}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Remove from Saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link to={`/product/${product.id}`}>
                      <Button variant="outline" size="sm" className="text-[11px] py-1 px-2.5">
                        View Dossier
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
