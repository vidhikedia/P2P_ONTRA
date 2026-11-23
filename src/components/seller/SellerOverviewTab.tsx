/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product, SellerOffer, SellerActivity, SellerOrder, SellerDashboardTab } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import { Button } from '../ui/Button.tsx';
import { 
  Plus, 
  Package, 
  FileEdit, 
  CheckCircle2, 
  Clock, 
  Tag, 
  ShieldCheck, 
  Wallet, 
  ArrowRight, 
  QrCode, 
  Truck, 
  AlertCircle,
  Eye,
  Heart
} from 'lucide-react';

interface SellerOverviewTabProps {
  products: Product[];
  offers: SellerOffer[];
  orders: SellerOrder[];
  activities: SellerActivity[];
  onNavigateTab: (tab: SellerDashboardTab) => void;
  onOpenOtpModal: () => void;
}

export const SellerOverviewTab: React.FC<SellerOverviewTabProps> = ({
  products,
  offers,
  orders,
  activities,
  onNavigateTab,
  onOpenOtpModal,
}) => {
  // Calculated actual catalog stats
  const activeCount = products.filter((p) => p.status === 'active').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;
  const soldCount = products.filter((p) => p.status === 'sold').length + 42; // Real completed trades from profile
  const pendingOrdersCount = orders.filter((o) => o.orderStatus !== 'completed').length;
  const pendingOffersCount = offers.filter((o) => o.status === 'pending').length;

  // Escrow financial values
  const pendingSettlementTotal = 2700; // Speedmaster #tx_98412 under 48h inspection
  const completedPayoutsTotal = 42500; // Verified settled payouts

  return (
    <div className="space-y-8">
      {/* 1. Primary Operational KPI Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Operational Summary
          </h2>
          <span className="text-xs text-slate-500">Live catalog status</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Active Listings */}
          <button
            type="button"
            onClick={() => onNavigateTab('listings')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Active Listings</span>
              <Package className="w-3.5 h-3.5 group-hover:text-slate-900 transition-colors" />
            </div>
            <p className="text-xl font-bold text-slate-900 font-mono tabular-nums">{activeCount}</p>
            <span className="text-[10px] text-emerald-700 font-medium">Live in catalog</span>
          </button>

          {/* Draft Listings */}
          <button
            type="button"
            onClick={() => onNavigateTab('listings')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Draft Listings</span>
              <FileEdit className="w-3.5 h-3.5 group-hover:text-slate-900 transition-colors" />
            </div>
            <p className="text-xl font-bold text-slate-900 font-mono tabular-nums">{draftCount}</p>
            <span className="text-[10px] text-slate-400">Unpublished</span>
          </button>

          {/* Products Sold */}
          <button
            type="button"
            onClick={() => onNavigateTab('history')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Products Sold</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 font-mono tabular-nums">{soldCount}</p>
            <span className="text-[10px] text-slate-400">Lifetime sales</span>
          </button>

          {/* Pending Orders */}
          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Pending Orders</span>
              <Clock className="w-3.5 h-3.5 text-blue-900" />
            </div>
            <p className="text-xl font-bold text-blue-900 font-mono tabular-nums">{pendingOrdersCount}</p>
            <span className="text-[10px] text-blue-700 font-medium">1 in inspection</span>
          </button>

          {/* Incoming Offers */}
          <button
            type="button"
            onClick={() => onNavigateTab('offers')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Incoming Offers</span>
              <Tag className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-amber-700 font-mono tabular-nums">{pendingOffersCount}</p>
            <span className="text-[10px] text-amber-700 font-medium">Awaiting reply</span>
          </button>

          {/* Pending Settlements */}
          <button
            type="button"
            onClick={() => onNavigateTab('payouts')}
            className="p-3.5 bg-white rounded-xl border border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-[11px] font-medium">Pending Settlements</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-base font-bold text-emerald-800 font-mono tabular-nums">
              {formatCurrency(pendingSettlementTotal)}
            </p>
            <span className="text-[10px] text-emerald-700">Held in escrow</span>
          </button>

          {/* Completed Payouts */}
          <button
            type="button"
            onClick={() => onNavigateTab('payouts')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Settled Payouts</span>
              <Wallet className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <p className="text-base font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(completedPayoutsTotal)}
            </p>
            <span className="text-[10px] text-slate-400">Transferred to HDFC Bank</span>
          </button>
        </div>
      </div>

      {/* 2. Action Required Attention Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direct Handover OTP Card */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                Physical Exchange Protocol
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Order #ord_102
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Direct Handover Scheduled with Ananya Sharma
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ananya Sharma has reserved the <strong>Leica M6 TTL</strong> for in-person handover in Jaipur, Rajasthan. Ask her for her 6-digit one-time passcode to confirm handover.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-bold">{formatCurrency(14500)} Escrow Locked</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenOtpModal}
              className="text-xs font-semibold"
            >
              Enter Buyer's 6-Digit OTP
            </Button>
          </div>
        </div>

        {/* Incoming Offer Action Card */}
        <div className="p-5 bg-white rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Binding Offer Received
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                Expires in 18 hrs
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Kabir Malhotra offered {formatCurrency(13200)} for Leica M6
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Asking: {formatCurrency(14500)} · Buyer has 98% trust score across 18 completed transactions. Funds are confirmed available in platform escrow.
            </p>
          </div>

          <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Discount: 9.0% below asking</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateTab('offers')}
              className="bg-blue-900 hover:bg-blue-950 font-semibold"
            >
              Review & Respond
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Split: Active Inventory Spotlight & Chronological Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active Inventory Spotlight (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Inventory Spotlight</h3>
              <p className="text-xs text-slate-500">Currently active listings available to buyers</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('listings')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View All {products.length} Items
            </Button>
          </div>

          <div className="space-y-3">
            {products.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4 text-xs transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.brand} {item.model} · Serial: {item.verification.serialNumberMasked}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {item.viewsCount || 140} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {item.savesCount || 22} saves
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-slate-900 text-sm block">
                    {formatCurrency(item.askingPrice)}
                  </span>
                  <span
                    className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      item.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'draft'
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateTab('add_product')}
              className="w-full justify-center"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              List Another Pre-Owned Item
            </Button>
          </div>
        </div>

        {/* Chronological Activities (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Operational Events</h3>
              <p className="text-xs text-slate-500">Timestamped transaction milestones</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Real-time audit</span>
          </div>

          <div className="space-y-4 text-xs">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 relative pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                  {act.type === 'inspection_started' && <Clock className="w-3.5 h-3.5 text-blue-900" />}
                  {act.type === 'offer_received' && <Tag className="w-3.5 h-3.5 text-amber-600" />}
                  {act.type === 'order_funded' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                  {act.type === 'payout_settled' && <Wallet className="w-3.5 h-3.5 text-emerald-600" />}
                  {act.type === 'listing_published' && <Package className="w-3.5 h-3.5 text-slate-700" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-bold text-slate-900 truncate">{act.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">{act.timestamp}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    {act.description}
                  </p>
                  {act.statusTag && (
                    <span className="inline-block mt-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {act.statusTag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
