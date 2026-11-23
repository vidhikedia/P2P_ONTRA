/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import { CONDITION_LABELS } from '../../utils/statusHelpers.ts';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Modal } from '../ui/Modal.tsx';
import { 
  Package, 
  Search, 
  Plus, 
  Eye, 
  Heart, 
  Tag, 
  Lock, 
  Edit3, 
  PauseCircle, 
  PlayCircle, 
  Trash2, 
  ShieldCheck, 
  FileCheck2, 
  AlertCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SellerMyListingsTabProps {
  products: Product[];
  onAddNew: () => void;
  onUpdateStatus: (id: string, status: Product['status']) => void;
  onDeleteListing: (id: string) => void;
  onEditListing: (product: Product) => void;
}

type FilterStatus = 'all' | 'active' | 'draft' | 'paused' | 'sold';

export const SellerMyListingsTab: React.FC<SellerMyListingsTabProps> = ({
  products,
  onAddNew,
  onUpdateStatus,
  onDeleteListing,
  onEditListing,
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lockedNoticeItem, setLockedNoticeItem] = useState<Product | null>(null);

  // Filter listings
  const filteredProducts = products.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active / Live
          </span>
        );
      case 'draft':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Draft Saved
          </span>
        );
      case 'paused':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            Paused (Hidden)
          </span>
        );
      case 'sold':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
            Sold & Settled
          </span>
        );
      case 'unavailable':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            Unavailable
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & New Listing CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Inventory & Listings Management</h2>
          <p className="text-xs text-slate-500">
            Track active inventory, view buyer engagement metrics, and maintain accurate evidence manifests.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddNew}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-blue-900 hover:bg-blue-950 font-semibold"
        >
          Add New Product
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {(['all', 'active', 'draft', 'paused', 'sold'] as FilterStatus[]).map((st) => {
            const count = st === 'all' 
              ? products.length 
              : products.filter((p) => p.status === st).length;
            const isSelected = filterStatus === st;

            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer capitalize whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <Input
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
          />
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No listings found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No items match your active filter. Create a new transparent listing or clear your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Product Details</th>
                  <th className="p-3.5">Condition Grade</th>
                  <th className="p-3.5">Asking Price</th>
                  <th className="p-3.5">Buyer Interest</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((item) => {
                  // Check if item is tied to an active order (e.g. Omega Speedmaster)
                  const hasActiveOrder = item.id === 'prod_speedmaster_pro';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Product Details */}
                      <td className="p-3.5 max-w-xs">
                        <div className="flex items-start gap-3">
                          <img
                            src={item.featuredImage}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/product/${item.id}`}
                              className="font-bold text-slate-900 hover:underline line-clamp-1 flex items-center gap-1"
                            >
                              <span>{item.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 inline" />
                            </Link>
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.brand} {item.model}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                {item.verification.serialNumberMasked}
                              </span>
                              {item.hasOriginalInvoice && (
                                <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5">
                                  <FileCheck2 className="w-3 h-3" /> Invoice
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Condition */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {CONDITION_LABELS[item.condition].label}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {item.sellerLocation}
                        </span>
                      </td>

                      {/* Asking Price */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(item.askingPrice)}
                        </span>
                        {item.minOfferAllowed && (
                          <span className="block text-[10px] text-slate-400">
                            Floor: {formatCurrency(item.minOfferAllowed)}
                          </span>
                        )}
                      </td>

                      {/* Buyer Interest */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-slate-600">
                          <span className="flex items-center gap-1 text-[11px]" title="Catalog Views">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono font-medium">{item.viewsCount ?? 110}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px]" title="Saved to Wishlist">
                            <Heart className="w-3.5 h-3.5 text-rose-400" />
                            <span className="font-mono font-medium">{item.savesCount ?? 14}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px]" title="Received Offers">
                            <Tag className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-mono font-medium">{item.offersCount ?? 1}</span>
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStatusBadge(item.status)}
                          {hasActiveOrder && (
                            <span
                              onClick={() => setLockedNoticeItem(item)}
                              className="text-[10px] text-blue-900 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                            >
                              <Lock className="w-3 h-3" /> Escrow Locked
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Listing */}
                          {hasActiveOrder ? (
                            <button
                              type="button"
                              onClick={() => setLockedNoticeItem(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                              title="Locked during active inspection"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onEditListing(item)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Edit Listing"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Pause / Resume */}
                          {item.status === 'active' && !hasActiveOrder && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(item.id, 'paused')}
                              className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg cursor-pointer"
                              title="Pause Listing (Hide from catalog)"
                            >
                              <PauseCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {item.status === 'paused' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(item.id, 'active')}
                              className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              title="Resume Listing (Publish to catalog)"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Publish Draft */}
                          {item.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[11px] py-1 px-2"
                              onClick={() => onUpdateStatus(item.id, 'active')}
                            >
                              Publish
                            </Button>
                          )}

                          {/* Mark Unavailable */}
                          {item.status === 'active' && !hasActiveOrder && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(item.id, 'unavailable')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Mark Unavailable"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete (Only allowed for drafts or paused without active orders) */}
                          {(item.status === 'draft' || item.status === 'unavailable') && (
                            <button
                              type="button"
                              onClick={() => onDeleteListing(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Evidence Lock Protection Modal */}
      {lockedNoticeItem && (
        <Modal
          isOpen={!!lockedNoticeItem}
          onClose={() => setLockedNoticeItem(null)}
          title="Historical Evidence Protection Active"
          subtitle={`Item: ${lockedNoticeItem.title} · Order #ord_101`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-blue-900">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Lock className="w-4 h-4 text-blue-900" />
                <span>Transaction Integrity Shield</span>
              </div>
              <p className="leading-relaxed">
                This item currently has an active escrow transaction in progress with buyer Ananya Sharma.
                Under ONTRA rules, once an order is funded and delivered, <strong>historical photos, serial manifests, and declared defect descriptions are immutably locked</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <p className="font-semibold text-slate-900">Why are edits restricted?</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                The buyer is physically verifying the item against the exact photographs and specifications you declared at the moment of checkout. Modifying claims during inspection would compromise neutral dispute arbitration.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setLockedNoticeItem(null)}>
                Understood
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
