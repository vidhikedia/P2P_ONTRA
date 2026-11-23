/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Select } from '../components/ui/Select.tsx';
import { useProducts } from '../hooks/useProducts.ts';
import { useToast } from '../hooks/useToast.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { Product } from '../types/index.ts';
import { MOCK_CATEGORIES } from '../data/mockData.ts';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  LayoutGrid, 
  List, 
  SlidersHorizontal, 
  MapPin, 
  Truck, 
  QrCode, 
  FileText, 
  ShieldCheck,
  ChevronDown,
  X
} from 'lucide-react';

const BRAND_OPTIONS = [
  { value: '', label: 'All Brands' },
  { value: 'apple', label: 'Apple' },
  { value: 'google', label: 'Google' },
  { value: 'leica', label: 'Leica' },
  { value: 'omega', label: 'Omega' },
  { value: 'ribble', label: 'Ribble' },
  { value: 'rancilio', label: 'Rancilio' },
  { value: 'audeze', label: 'Audeze' },
  { value: 'artisan studio pune', label: 'Artisan Studio Pune' },
  { value: 'academic press', label: 'Academic Press' },
  { value: 'artisan heritage', label: 'Artisan Heritage' },
  { value: 'nintendo', label: 'Nintendo' },
];

const CONDITION_OPTIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'mint_in_box', label: 'Mint in Box' },
  { value: 'like_new', label: 'Like New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'very_good', label: 'Very Good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'for_parts', label: 'For Parts / Salvage' },
];

const LOCATION_OPTIONS = [
  { value: '', label: 'All India Locations' },
  { value: 'jaipur', label: 'Jaipur, Rajasthan (Launch City)' },
  { value: 'bengaluru', label: 'Bengaluru, Karnataka' },
  { value: 'new delhi', label: 'New Delhi, Delhi NCR' },
  { value: 'pune', label: 'Pune, Maharashtra' },
  { value: 'mumbai', label: 'Mumbai, Maharashtra' },
  { value: 'gurugram', label: 'Gurugram, Haryana' },
  { value: 'chennai', label: 'Chennai, Tamil Nadu' },
];

const DELIVERY_OPTIONS = [
  { value: 'all', label: 'Any Delivery Method' },
  { value: 'courier', label: 'Tracked Insured Courier' },
  { value: 'direct_handover', label: 'Physical Handover with OTP' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Verified' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
  { value: 'trust_score', label: 'Highest Seller Rating' },
];

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('query') || '';
  const initialLocation = searchParams.get('location') || '';

  const { products, loading, filters, updateFilters, resetFilters } = useProducts({
    category: initialCategory,
    query: initialQuery,
    location: initialLocation,
  });

  const { showToast } = useToast();

  // Layout View Mode (Grid vs List)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedDelivery, setSelectedDelivery] = useState<'courier' | 'direct_handover' | 'all'>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [invoiceOnly, setInvoiceOnly] = useState(false);
  const [selectedSort, setSelectedSort] = useState<'newest' | 'price_low_high' | 'price_high_low' | 'trust_score'>('newest');

  // Pagination limit state
  const [displayLimit, setDisplayLimit] = useState(8);

  // Sync category from URL if changed
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    if (cat !== selectedCategory) {
      setSelectedCategory(cat);
      updateFilters({ category: cat || undefined });
    }
  }, [searchParams]);

  const handleApplyFilters = () => {
    updateFilters({
      query: searchQuery || undefined,
      category: selectedCategory || undefined,
      brand: selectedBrand || undefined,
      condition: selectedCondition || undefined,
      location: selectedLocation || undefined,
      deliveryMethod: selectedDelivery,
      invoiceOnly: invoiceOnly || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: selectedSort,
    });
    setDisplayLimit(8);
    setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedCondition('');
    setSelectedLocation('');
    setSelectedDelivery('all');
    setMinPrice('');
    setMaxPrice('');
    setInvoiceOnly(false);
    setSelectedSort('newest');
    resetFilters();
    setSearchParams({});
    setDisplayLimit(8);
    showToast('Filters Cleared', 'Displaying all verified marketplace listings.', 'info');
  };

  const visibleProducts = products.slice(0, displayLimit);
  const hasMore = products.length > displayLimit;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Explore Verified Products
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-owned items with cryptographic serial verification, optical manifests, and 48-hour physical inspection.
          </p>
        </div>

        {/* View Mode & Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Grid / List Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Product Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar (Desktop + Mobile Drawer) */}
        <aside
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } md:block md:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-700" />
              <span>Filter Catalog</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-slate-500 hover:text-slate-900 underline cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="md:hidden p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1. Search Query */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Keywords
            </label>
            <Input
              placeholder="Title, brand, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>

          {/* 2. Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <Select
              options={[{ value: '', label: 'All 8 Categories' }, ...MOCK_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))]}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>

          {/* 3. Price Range Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Price Range (INR ₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* 4. Brand Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Brand
            </label>
            <Select
              options={BRAND_OPTIONS}
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            />
          </div>

          {/* 5. Condition Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Condition
            </label>
            <Select
              options={CONDITION_OPTIONS}
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
            />
          </div>

          {/* 6. Location Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Seller Location
            </label>
            <Select
              options={LOCATION_OPTIONS}
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            />
          </div>

          {/* 7. Delivery Method Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Delivery Method
            </label>
            <Select
              options={DELIVERY_OPTIONS}
              value={selectedDelivery}
              onChange={(e) => setSelectedDelivery(e.target.value as any)}
            />
          </div>

          {/* 8. Invoice Availability Checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={invoiceOnly}
                onChange={(e) => setInvoiceOnly(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span>Original Invoice Included Only</span>
            </label>
          </div>

          {/* Apply Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center bg-slate-900 hover:bg-slate-800 font-semibold text-white shadow-xs"
              onClick={handleApplyFilters}
            >
              Apply Filter Parameters
            </Button>
          </div>
        </aside>

        {/* Product Results Stream */}
        <main className="md:col-span-3 space-y-4">
          {/* Header Bar: Result Count & Sorting */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Showing</span>
              <strong className="font-mono tabular-nums text-slate-900 font-bold">
                {visibleProducts.length}
              </strong>
              <span>of</span>
              <strong className="font-mono tabular-nums text-slate-900 font-bold">
                {products.length}
              </strong>
              <span>verified marketplace items</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">Sort by:</span>
              <Select
                options={SORT_OPTIONS}
                value={selectedSort}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setSelectedSort(val);
                  updateFilters({ sortBy: val });
                }}
                className="py-1 text-xs"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Loading verified marketplace listings...
            </div>
          ) : visibleProducts.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Matching Products Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  We could not find any verified pre-owned items matching your active filter criteria. Try widening your price range or clearing keyword restrictions.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleResetFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            /* Products Grid or List */
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                  : 'flex flex-col gap-4'
              }
            >
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Load More Pagination */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                size="md"
                onClick={() => setDisplayLimit((prev) => prev + 8)}
                className="px-8 font-medium"
              >
                Load More Verified Products ({products.length - displayLimit} remaining)
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
