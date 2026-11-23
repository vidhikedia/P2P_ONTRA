/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BuyerNegotiationThread } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { 
  Lock, 
  Truck, 
  QrCode, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.ts';

interface BuyerCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: BuyerNegotiationThread | null;
  agreedPrice: number;
  onConfirmOrder: (orderDetails: {
    productId: string;
    agreedPrice: number;
    deliveryMethod: 'courier' | 'direct_handover';
    paymentMethod: 'upi' | 'debit_card' | 'credit_card' | 'net_banking' | 'card' | 'bank_wire';
  }) => void;
}

export const BuyerCheckoutModal: React.FC<BuyerCheckoutModalProps> = ({
  isOpen,
  onClose,
  thread,
  agreedPrice,
  onConfirmOrder,
}) => {
  const { showToast } = useToast();
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'direct_handover'>('courier');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'debit_card' | 'credit_card' | 'net_banking'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!thread) return null;

  const escrowFee = Math.round(agreedPrice * 0.015);
  const shippingFee = deliveryMethod === 'courier' ? 299 : 0;
  const totalDeposit = agreedPrice + escrowFee + shippingFee;

  const handleExecuteCheckout = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmOrder({
        productId: thread.productId,
        agreedPrice,
        deliveryMethod,
        paymentMethod,
      });
      showToast(
        'Escrow Deposit Secured in Vault',
        `Deposit of ${formatCurrency(totalDeposit)} locked. ${thread.sellerName} will dispatch via ${deliveryMethod === 'courier' ? 'Tracked Insured Courier' : 'Direct Handover with OTP'}.`,
        'success'
      );
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Escrow Checkout"
      subtitle={`Agreed Negotiated Purchase with ${thread.sellerName}`}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-slate-700">
        {/* Item Summary */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <img
            src={thread.productImage}
            alt={thread.productTitle}
            className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate">{thread.productTitle}</p>
            <p className="text-[11px] text-slate-500">
              Seller: <strong>{thread.sellerName}</strong> ({thread.sellerLocation})
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Agreed Price Locked: {formatCurrency(agreedPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Negotiated Purchase Price:</span>
            <span className="font-mono font-bold text-slate-900">{formatCurrency(agreedPrice)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Escrow Custody & Inspection (1.5%):</span>
            <span className="font-mono text-slate-900">{formatCurrency(escrowFee)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Insured Freight / Carrier Signature:</span>
            <span className="font-mono text-slate-900">{formatCurrency(shippingFee)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
            <span>Total Escrow Deposit:</span>
            <span className="font-mono text-emerald-700">
              {formatCurrency(totalDeposit)}
            </span>
          </div>
        </div>

        {/* Delivery Method Selector */}
        <div>
          <label className="block font-semibold text-slate-900 mb-2">Fulfillment Method:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliveryMethod('courier')}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                deliveryMethod === 'courier'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <p className="font-bold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Insured Courier
              </p>
              <p className={`text-[10px] mt-1 ${deliveryMethod === 'courier' ? 'text-slate-300' : 'text-slate-500'}`}>
                Shiprocket-compatible courier ({formatCurrency(299)})
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMethod('direct_handover')}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                deliveryMethod === 'direct_handover'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <p className="font-bold flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" /> Direct Handover
              </p>
              <p className={`text-[10px] mt-1 ${deliveryMethod === 'direct_handover' ? 'text-slate-300' : 'text-slate-500'}`}>
                In-person 6-digit OTP code (Free)
              </p>
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block font-semibold text-slate-900 mb-2">Payment Vault Funding Method (INR):</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                paymentMethod === 'upi'
                  ? 'border-slate-900 bg-slate-100 text-slate-900 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> UPI (Instant)
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('debit_card')}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                paymentMethod === 'debit_card' || paymentMethod === 'credit_card'
                  ? 'border-slate-900 bg-slate-100 text-slate-900 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Debit / Credit
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('net_banking')}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                paymentMethod === 'net_banking'
                  ? 'border-slate-900 bg-slate-100 text-slate-900 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Net Banking
              </span>
            </button>
          </div>
        </div>

        {/* Reassurance Notice */}
        <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-[11px] leading-relaxed flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            <strong>48-Hour Inspection Guarantee:</strong> {thread.sellerName} will not receive settlement until your 48-hour hands-on examination passes without dispute.
          </span>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExecuteCheckout}
            disabled={isSubmitting}
            className="bg-blue-900 hover:bg-blue-950 font-semibold text-xs"
          >
            {isSubmitting ? 'Securing Escrow Vault...' : 'Deposit Funds in Escrow Vault'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
