/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import { CONDITION_LABELS } from '../../utils/statusHelpers.ts';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { 
  ShieldCheck, 
  Heart, 
  Camera, 
  Star, 
  MapPin, 
  FileText,
  ArrowRight,
  Truck
} from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onSelect?: (product: Product) => void;
  onMakeOffer?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
  onSelect,
  onMakeOffer,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const isSaved = isInWishlist(product.id);
  const conditionMeta = CONDITION_LABELS[product.condition];

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
      <article
        onClick={handleCardClick}
        className="group relative flex flex-col sm:flex-row bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
      >
        {/* List Image */}
        <div className="relative w-full sm:w-60 h-48 sm:h-auto bg-slate-100 overflow-hidden shrink-0">
          {!imageFailed ? (
            <img
              src={product.featuredImage}
              alt={product.title}
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4">
              <Camera className="w-8 h-8 mb-2 stroke-1" />
              <span className="text-xs font-medium text-slate-500">{product.brand} {product.model}</span>
            </div>
          )}

          {/* Subtle wishlist button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md shadow-xs transition-colors cursor-pointer ${
              isSaved
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/85 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* List Body */}
        <div className="flex flex-col flex-1 p-5 justify-between">
          <div className="space-y-2">
            {/* Metadata line with typographic separators */}
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-800">
                {product.brand}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium">
                {conditionMeta.label}
              </span>
              {product.verification.serialVerified && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 text-slate-700 font-mono text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{product.verification.serialNumberMasked}</span>
                  </span>
                </>
              )}
              {product.hasOriginalInvoice && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Invoice Available
                  </span>
                </>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
              {product.title}
            </h3>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {product.subtitle} · {product.conditionDetails}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {product.sellerLocation}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-mono tabular-nums">{product.sellerRating}</span> ({product.sellerName})
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Truck className="w-3.5 h-3.5" /> 48h Inspection Window
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(product.askingPrice, product.currency)}
                </span>
                {product.originalRetailPrice > product.askingPrice && (
                  <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                    {formatCurrency(product.originalRetailPrice, product.currency)}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 block">
                Escrow protected · Delayed seller settlement
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMakeOffer ? onMakeOffer(product) : handleCardClick();
                }}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Make Offer
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // GRID VIEW LAYOUT (Standard)
  return (
    <article
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
    >
      {/* Product Image Slot */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {!imageFailed ? (
          <img
            src={product.featuredImage}
            alt={product.title}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4">
            <Camera className="w-8 h-8 mb-2 stroke-1" />
            <span className="text-xs font-medium text-slate-500">{product.brand} {product.model}</span>
          </div>
        )}

        {/* Top Floating Controls */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.condition === 'for_parts' ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-md text-[10px] font-bold text-white shadow-xs">
                For Parts / Repair
              </span>
            ) : product.verification.serialVerified ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-[11px] font-semibold text-slate-800 shadow-xs">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified Serial</span>
              </div>
            ) : null}

            {/* Photo count indicator for authentic peer listing */}
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/75 backdrop-blur-md text-[10px] font-medium text-white shadow-xs">
              <Camera className="w-2.5 h-2.5 text-slate-300" />
              <span>{(product.galleryImages?.length || 1)} photos</span>
            </span>
          </div>

          {/* Interactive Wishlist Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md shadow-xs transition-colors cursor-pointer ${
              isSaved
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/90 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="flex flex-col flex-1 p-4 justify-between">
        <div>
          {/* Brand & Condition */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-800">
              {product.brand}
            </span>
            <span className="text-slate-500 text-[11px] font-medium">
              {conditionMeta.label}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-1 leading-snug">
            {product.title}
          </h3>

          {/* Location & Seller Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 text-[11px] text-slate-600 truncate max-w-[130px]">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{product.sellerLocation.split(',')[0]}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-mono tabular-nums">{product.sellerRating || 4.9}</span>
            </div>
          </div>
        </div>

        {/* Price & View Details Action */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                {formatCurrency(product.askingPrice, product.currency)}
              </span>
              {product.originalRetailPrice > product.askingPrice && (
                <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                  {formatCurrency(product.originalRetailPrice, product.currency)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 block">
              48h Physical Inspection
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-white hover:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
};
