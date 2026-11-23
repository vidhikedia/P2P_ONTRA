/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BuyerNegotiationThread } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import { Button } from '../ui/Button.tsx';
import { Tag, CheckCircle2, Clock, XCircle, ArrowRight, Lock, MessageSquare } from 'lucide-react';

interface BuyerOffersTabProps {
  threads: BuyerNegotiationThread[];
  onNavigateToThread: (threadId: string) => void;
  onProceedToCheckout: (thread: BuyerNegotiationThread, agreedPrice: number) => void;
}

export const BuyerOffersTab: React.FC<BuyerOffersTabProps> = ({
  threads,
  onNavigateToThread,
  onProceedToCheckout,
}) => {
  const offerThreads = threads.filter((t) => t.offer);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">My Submitted Offers & Negotiations</h2>
        <p className="text-xs text-slate-500">
          Track binding purchase proposals submitted to sellers. Accepted offers allow instant escrow checkout.
        </p>
      </div>

      <div className="space-y-4">
        {offerThreads.map((thread) => {
          const offer = thread.offer!;
          const isAccepted = offer.status === 'accepted';
          const isCounter = offer.status === 'counter_received';
          const isDeclined = offer.status === 'declined';
          const agreedPrice = offer.finalAgreedPrice || offer.counterOfferAmount || offer.currentOfferAmount;

          return (
            <div
              key={thread.id}
              className={`p-5 rounded-2xl border transition-all ${
                isAccepted
                  ? 'bg-emerald-50/30 border-emerald-200 shadow-xs'
                  : isCounter
                  ? 'bg-amber-50/30 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={thread.productImage}
                    alt={thread.productTitle}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {thread.productTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Seller: <strong>{thread.sellerName}</strong> ({thread.sellerLocation})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Original Listing Price: <span className="line-through">{formatCurrency(thread.originalPrice)}</span>
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="text-right shrink-0">
                  {isAccepted && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Offer Accepted ({formatCurrency(agreedPrice)})
                    </span>
                  )}
                  {isCounter && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Seller Counteroffer ({formatCurrency(offer.counterOfferAmount || 0)})
                    </span>
                  )}
                  {offer.status === 'pending_seller' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      <Clock className="w-3.5 h-3.5" />
                      Under Seller Consideration
                    </span>
                  )}
                  {isDeclined && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                      <XCircle className="w-3.5 h-3.5" />
                      Offer Declined
                    </span>
                  )}
                </div>
              </div>

              {/* Offer Details & Actions */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 text-slate-600">
                  <p>
                    Your Offer: <strong>{formatCurrency(offer.currentOfferAmount)}</strong>
                    {offer.counterOfferAmount && (
                      <span className="ml-2 text-amber-700">
                        · Counter: <strong>{formatCurrency(offer.counterOfferAmount)}</strong>
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Expiry Window: {offer.expiresAt} · Escrow payment holding guarantees price.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateToThread(thread.id)}
                    className="text-xs"
                    leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                  >
                    Open Negotiation Chat
                  </Button>

                  {isAccepted && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onProceedToCheckout(thread, agreedPrice)}
                      className="bg-emerald-700 hover:bg-emerald-800 font-bold text-xs"
                      leftIcon={<Lock className="w-3.5 h-3.5" />}
                    >
                      Proceed to Checkout ({formatCurrency(agreedPrice)})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
