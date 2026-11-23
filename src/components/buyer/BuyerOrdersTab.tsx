/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Transaction } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';
import { Button } from '../ui/Button.tsx';
import { 
  ShoppingBag, 
  Truck, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

interface BuyerOrdersTabProps {
  transactions: Transaction[];
  onOpenInspectionModal: (tx: Transaction) => void;
  onNavigateToMessages: () => void;
}

export const BuyerOrdersTab: React.FC<BuyerOrdersTabProps> = ({
  transactions,
  onOpenInspectionModal,
  onNavigateToMessages,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">My Orders & Escrow Custody</h2>
        <p className="text-xs text-slate-500">
          Every purchase is protected by platform escrow. Your payment remains locked until you approve the 48-hour hands-on inspection.
        </p>
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-900">Order #{tx.id}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 font-mono">Date: {formatDate(tx.updatedAt)}</span>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                <Clock className="w-3.5 h-3.5" /> 48h Inspection Window Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Product Info (5 cols) */}
              <div className="md:col-span-5 flex items-center gap-3">
                <img
                  src={tx.productImage}
                  alt={tx.productTitle}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {tx.productTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Seller: <strong>{tx.sellerName}</strong>
                  </p>
                  <p className="font-mono font-bold text-emerald-700 text-sm mt-1">
                    {formatCurrency(tx.agreedPrice)} Escrow Deposit
                  </p>
                </div>
              </div>

              {/* Delivery & Tracking (4 cols) */}
              <div className="md:col-span-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-700" />
                  <span>{tx.shipping?.carrier || 'Blue Dart Air Express (Insured)'}</span>
                </span>
                <p className="font-mono text-slate-600">
                  Tracking: <strong>{tx.shipping?.trackingNumber || 'BD-924180-BLR-JAI'}</strong>
                </p>
                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Doorstep Signature Recorded ({formatDate(tx.shipping?.deliveredAt || '2026-11-03')})
                </p>
              </div>

              {/* Actions (3 cols) */}
              <div className="md:col-span-3 flex flex-col gap-2 justify-center">
                <a
                  href={`/order-tracking/${tx.orderId || tx.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Track Full Timeline</span>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenInspectionModal(tx)}
                  className="font-semibold text-xs justify-center"
                >
                  Quick Inspection
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onNavigateToMessages}
                  className="text-xs justify-center"
                >
                  Message Seller
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
