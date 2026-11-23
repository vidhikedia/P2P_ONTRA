/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SellerOffer } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Modal } from '../ui/Modal.tsx';
import { 
  Tag, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Star, 
  Truck, 
  QrCode,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.ts';

interface SellerOffersTabProps {
  offers: SellerOffer[];
  onAcceptOffer: (offerId: string) => void;
  onDeclineOffer: (offerId: string) => void;
  onCounterOffer: (offerId: string, counterAmount: number) => void;
}

export const SellerOffersTab: React.FC<SellerOffersTabProps> = ({
  offers,
  onAcceptOffer,
  onDeclineOffer,
  onCounterOffer,
}) => {
  const { showToast } = useToast();
  const [counterModalOffer, setCounterModalOffer] = useState<SellerOffer | null>(null);
  const [counterAmount, setCounterAmount] = useState<number>(0);

  const handleOpenCounter = (offer: SellerOffer) => {
    setCounterModalOffer(offer);
    setCounterAmount(Math.round((offer.askingPrice + offer.offeredAmount) / 2));
  };

  const handleSendCounter = () => {
    if (!counterModalOffer) return;
    onCounterOffer(counterModalOffer.id, counterAmount);
    showToast(
      'Counter-Offer Transmitted',
      `Sent counter-offer of ${formatCurrency(counterAmount)} to ${counterModalOffer.buyerName}.`,
      'success'
    );
    setCounterModalOffer(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">Incoming Buyer Offers</h2>
        <p className="text-xs text-slate-500">
          All offers are legally binding. When you accept an offer, the buyer has 24 hours to fund the escrow deposit.
        </p>
      </div>

      <div className="space-y-4">
        {offers.map((offer) => {
          const discountPercent = Math.round(
            ((offer.askingPrice - offer.offeredAmount) / offer.askingPrice) * 100
          );

          return (
            <div
              key={offer.id}
              className={`p-5 rounded-2xl border transition-all ${
                offer.status === 'pending'
                  ? 'bg-white border-slate-200 shadow-xs'
                  : offer.status === 'accepted'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-slate-50/80 border-slate-200 opacity-75'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <img
                    src={offer.productImage}
                    alt={offer.productTitle}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {offer.productTitle}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>Listed: {formatCurrency(offer.askingPrice)}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-900">
                        Offered: {formatCurrency(offer.offeredAmount)}
                      </span>
                      {discountPercent > 0 && (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          {discountPercent}% below asking
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="text-right shrink-0">
                  {offer.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      Expires in 18 hrs
                    </span>
                  ) : offer.status === 'accepted' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Accepted by You
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium capitalize">
                      {offer.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Buyer profile & message */}
              <div className="py-3 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                <div className="md:col-span-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{offer.buyerName}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
                      ID Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-0.5 font-bold text-slate-800">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {offer.buyerRating}
                    </span>
                    <span>·</span>
                    <span>{offer.buyerCompletedTrades} trades</span>
                    <span>·</span>
                    <span>{offer.buyerLocation}</span>
                  </div>
                </div>

                <div className="md:col-span-8 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-600 flex flex-col justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">Buyer Note:</span>
                    <p className="italic">"{offer.message}"</p>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1">
                    {offer.deliveryPreference === 'courier' ? (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Truck className="w-3.5 h-3.5" /> Buyer requested Insured Courier delivery
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-600">
                        <QrCode className="w-3.5 h-3.5" /> Buyer requested Direct Handover
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {offer.status === 'pending' && (
                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeclineOffer(offer.id)}
                    className="text-xs text-rose-600 hover:text-rose-700"
                  >
                    Decline
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenCounter(offer)}
                    className="text-xs font-semibold"
                  >
                    Counter-Offer
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAcceptOffer(offer.id)}
                    className="bg-blue-900 hover:bg-blue-950 text-xs font-semibold"
                  >
                    Accept Offer ({formatCurrency(offer.offeredAmount)})
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Counter Offer Modal */}
      {counterModalOffer && (
        <Modal
          isOpen={!!counterModalOffer}
          onClose={() => setCounterModalOffer(null)}
          title="Submit Counter-Offer"
          subtitle={`Item: ${counterModalOffer.productTitle} · Buyer: ${counterModalOffer.buyerName}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
              <span className="text-slate-500">Buyer's Offer:</span>
              <span className="font-bold text-slate-900">{formatCurrency(counterModalOffer.offeredAmount)}</span>
            </div>

            <Input
              label="Your Counter-Offer (INR ₹)"
              type="number"
              min={counterModalOffer.offeredAmount + 500}
              max={counterModalOffer.askingPrice}
              value={counterAmount}
              onChange={(e) => setCounterAmount(Number(e.target.value))}
              helperText="If accepted by buyer, price locks into escrow checkout."
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setCounterModalOffer(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSendCounter} className="bg-blue-900">
                Send Binding Counter-Offer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
