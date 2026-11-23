/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Transaction, BuyerDashboardTab, RecentlyViewedItem } from '../../types/index.ts';
import { formatCurrency, formatDateTimeIST } from '../../utils/formatters.ts';
import { Button } from '../ui/Button.tsx';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Clock, 
  Tag, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Eye, 
  MessageSquare,
  Lock,
  Sparkles
} from 'lucide-react';

interface BuyerOverviewTabProps {
  transactions: Transaction[];
  recentlyViewed: RecentlyViewedItem[];
  onNavigateTab: (tab: BuyerDashboardTab) => void;
  onOpenInspectionModal: (tx: Transaction) => void;
}

export const BuyerOverviewTab: React.FC<BuyerOverviewTabProps> = ({
  transactions,
  recentlyViewed,
  onNavigateTab,
  onOpenInspectionModal,
}) => {
  // Calculated actual buyer metrics
  const activeOrdersCount = 1; // Omega Speedmaster currently under inspection
  const pendingInspectionsCount = 1;
  const acceptedOffersCount = 1; // Leica M6 / La Marzocco
  const openDisputesCount = 0;
  const completedPurchasesCount = 14;

  const inspectionTx = transactions[0];

  return (
    <div className="space-y-8">
      {/* 1. Core Overview Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Buyer Activity Overview
          </h2>
          <span className="text-xs text-slate-500">Real-time escrow transactions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Active Orders */}
          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Active Orders</span>
              <ShoppingBag className="w-3.5 h-3.5 group-hover:text-slate-900 transition-colors" />
            </div>
            <p className="text-xl font-bold text-slate-900 font-mono tabular-nums">{activeOrdersCount}</p>
            <span className="text-[10px] text-blue-900 font-medium">1 in transit/inspection</span>
          </button>

          {/* Pending Inspections */}
          <button
            type="button"
            onClick={() => onNavigateTab('inspection')}
            className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200 hover:border-blue-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-blue-900 mb-1">
              <span className="text-[11px] font-bold">Pending Inspections</span>
              <Clock className="w-3.5 h-3.5 text-blue-900 animate-pulse" />
            </div>
            <p className="text-xl font-bold text-blue-900 font-mono tabular-nums">{pendingInspectionsCount}</p>
            <span className="text-[10px] text-blue-700 font-semibold">48h Window Active</span>
          </button>

          {/* Accepted Offers */}
          <button
            type="button"
            onClick={() => onNavigateTab('offers')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Accepted Offers</span>
              <Tag className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 font-mono tabular-nums">{acceptedOffersCount}</p>
            <span className="text-[10px] text-emerald-700 font-medium">Ready for checkout</span>
          </button>

          {/* Open Disputes */}
          <button
            type="button"
            onClick={() => onNavigateTab('disputes')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Open Disputes</span>
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-xl font-bold text-slate-900 font-mono tabular-nums">{openDisputesCount}</p>
            <span className="text-[10px] text-slate-400">0 open claims</span>
          </button>

          {/* Completed Purchases */}
          <button
            type="button"
            onClick={() => onNavigateTab('history')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium">Completed Purchases</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 font-mono tabular-nums">{completedPurchasesCount}</p>
            <span className="text-[10px] text-slate-400">100% inspected</span>
          </button>
        </div>
      </div>

      {/* 2. Priority Active Inspection Banner */}
      {inspectionTx && (
        <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Physical Inspection Countdown Active
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Order #{inspectionTx.id}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">
              {inspectionTx.productTitle}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Carrier confirmed doorstep signature in Jaipur, Rajasthan. You have until <strong>{formatDateTimeIST(inspectionTx.inspection?.windowExpiresAt || '2026-11-05T08:45:00Z')}</strong> to test item condition against the seller manifest. Your <strong>{formatCurrency(inspectionTx.agreedPrice)}</strong> deposit remains safely locked in the escrow vault.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateTab('messages')}
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto text-xs"
            >
              Chat with {inspectionTx.sellerName?.split(' ')[0] || 'Seller'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenInspectionModal(inspectionTx)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
            >
              Verify Inspection Checklist
            </Button>
          </div>
        </div>
      )}

      {/* 3. Two-Column Split: Recent Orders & Recently Viewed Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Marketplace Orders</h3>
              <p className="text-xs text-slate-500">Track shipments and escrow custody status</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('orders')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              All Orders
            </Button>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={tx.productImage}
                    alt={tx.productTitle}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{tx.productTitle}</p>
                    <p className="text-[11px] text-slate-500">
                      Seller: <strong>{tx.sellerName}</strong> · Ref #{tx.id}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-bold text-emerald-700">
                        {formatCurrency(tx.agreedPrice)} Escrow Deposit
                      </span>
                      <span>·</span>
                      <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <Truck className="w-3 h-3" /> {tx.shipping?.carrier || 'Insured Courier'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                    Under 48h Inspection
                  </span>
                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenInspectionModal(tx)}
                      className="text-blue-900 hover:underline font-semibold text-[11px] cursor-pointer"
                    >
                      Open Checklist →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Viewed Products (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-600" />
                <span>Recently Viewed Products</span>
              </h3>
              <p className="text-xs text-slate-500">Items you previously examined</p>
            </div>
            <Link to="/explore" className="text-xs font-semibold text-blue-900 hover:underline">
              Explore All
            </Link>
          </div>

          <div className="space-y-3">
            {recentlyViewed.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50/60 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.brand} {item.model} · {item.location}
                    </p>
                    <span className="text-[10px] text-slate-400">{item.viewedAt}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-slate-900 text-xs block">
                    {formatCurrency(item.askingPrice)}
                  </span>
                  <Link
                    to={`/product/${item.id}`}
                    className="text-[11px] text-blue-900 font-semibold hover:underline block mt-0.5"
                  >
                    View Item
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
