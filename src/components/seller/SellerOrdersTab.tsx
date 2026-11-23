/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SellerOrder } from '../../types/index.ts';
import { formatCurrency, formatDate, formatDateTimeIST } from '../../utils/formatters.ts';
import { Button } from '../ui/Button.tsx';
import { 
  ShoppingBag, 
  Truck, 
  QrCode, 
  Clock, 
  ShieldCheck, 
  Printer, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.ts';

interface SellerOrdersTabProps {
  orders: SellerOrder[];
  onOpenOtpModal: () => void;
}

export const SellerOrdersTab: React.FC<SellerOrdersTabProps> = ({
  orders,
  onOpenOtpModal,
}) => {
  const { showToast } = useToast();

  const handlePrintLabel = (_carrier: string, trackingNumber?: string) => {
    showToast(
      'Insured Dispatch Label Ready',
      `Courier label #${trackingNumber || 'BD-924180-BLR-JAI'} generated with pre-paid ${formatCurrency(2850)} replacement insurance.`,
      'info'
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">Active Orders & Escrow Fulfillment</h2>
        <p className="text-xs text-slate-500">
          All orders are backed by 100% funded buyer deposits held safely in the ONTRA escrow vault.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900">
                  Order #{order.id}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-mono">
                  Tx: {order.transactionId}
                </span>
              </div>

              <div>
                {order.orderStatus === 'under_inspection' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                    <Clock className="w-3.5 h-3.5" /> 48h Inspection Window Active
                  </span>
                )}
                {order.orderStatus === 'ready_to_ship' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <QrCode className="w-3.5 h-3.5" /> Handover Meeting Scheduled
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Product Info (5 cols) */}
              <div className="md:col-span-5 flex items-center gap-3">
                <img
                  src={order.productImage}
                  alt={order.productTitle}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {order.productTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Buyer: <strong>{order.buyerName}</strong> ({order.buyerLocation})
                  </p>
                  <p className="font-mono font-bold text-emerald-700 text-sm mt-1">
                    {formatCurrency(order.productPrice)} Escrow Locked
                  </p>
                </div>
              </div>

              {/* Delivery Details (4 cols) */}
              <div className="md:col-span-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  {order.deliveryMethod === 'courier' ? (
                    <>
                      <Truck className="w-3.5 h-3.5 text-slate-700" />
                      <span>{order.carrier || 'Blue Dart Air Express (Insured)'}</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-3.5 h-3.5 text-slate-700" />
                      <span>Direct Physical Handover (OTP)</span>
                    </>
                  )}
                </span>

                {order.trackingNumber && (
                  <p className="font-mono text-slate-600">
                    Tracking: <strong>{order.trackingNumber}</strong>
                  </p>
                )}

                {order.inspectionDeadline && (
                  <p className="text-[11px] text-blue-900 font-medium">
                    Inspection finishes: {formatDateTimeIST(order.inspectionDeadline)}
                  </p>
                )}
              </div>

              {/* Actions (3 cols) */}
              <div className="md:col-span-3 flex flex-col gap-2 justify-center">
                <a
                  href={`/order-tracking/${order.transactionId || order.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Track Timeline</span>
                </a>
                {order.deliveryMethod === 'courier' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintLabel(order.carrier || 'Blue Dart', order.trackingNumber)}
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                      className="justify-center text-xs"
                    >
                      Print Courier Label
                    </Button>
                    <span className="text-[10px] text-slate-400 text-center">
                      Doorstep signature recorded on {formatDate('2026-11-03')}
                    </span>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onOpenOtpModal}
                    className="bg-slate-900 hover:bg-slate-800 text-white justify-center text-xs font-semibold"
                  >
                    Enter 6-Digit OTP
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
