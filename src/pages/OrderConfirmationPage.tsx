/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { transactionService } from '../services/transactionService.ts';
import { Transaction } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { Button } from '../components/ui/Button.tsx';
import { useToast } from '../hooks/useToast.ts';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  QrCode,
  ArrowRight,
  Printer,
  Copy,
  ExternalLink,
  ChevronRight,
  Lock,
  Box,
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const idToLookup = orderId || 'ORD-89241';
        const res = await transactionService.getTransactionById(idToLookup);
        if (res.data) {
          setOrder(res.data);
        } else {
          const listRes = await transactionService.getTransactions();
          if (listRes.data && listRes.data.length > 0) {
            setOrder(listRes.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load confirmed order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied', `${label} copied to clipboard.`, 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-medium">Loading transaction confirmation receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Receipt Not Found</h2>
        <p className="text-slate-600 text-sm mb-6">Could not locate transaction confirmation details.</p>
        <Link to="/buyer/dashboard">
          <Button variant="primary">Go to Buyer Dashboard</Button>
        </Link>
      </div>
    );
  }

  const demoTxId = order.paymentDetails?.demoReference || `ONTRA-DEMO-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      {/* Visual Success Hero Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Verified · Held for Inspection
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight pt-2">
            Order Confirmed & Protected
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Your payment authorization was completed. The seller has been alerted to prepare the item with tamper-evident seal protection.
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link to={`/order-tracking/${order.orderId || order.id}`}>
            <Button
              variant="primary"
              size="md"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Track Order Progress
            </Button>
          </Link>
          <Link to="/buyer/dashboard">
            <Button variant="outline" size="md">
              View in Buyer Dashboard
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Main Receipt & Dossier Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden mb-8">
        {/* IDs & References Strip */}
        <div className="p-6 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Order ID</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
              <span>{order.orderId || order.id}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(order.orderId || order.id, 'Order ID')}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Transaction ID</span>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-900">
              <span className="truncate max-w-[140px]">{demoTxId}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(demoTxId, 'Transaction Reference')}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Payment Status</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Verified (Escrow Vault)
            </span>
          </div>

          <div>
            <span className="text-slate-500 block mb-0.5">Inspection Window</span>
            <span className="font-semibold text-blue-900 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 48 Hours upon delivery
            </span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Purchased Product Details
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={order.productImage}
                alt={order.productTitle}
                className="w-18 h-18 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">{order.productTitle}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Listing Ref: <span className="font-mono">{order.productId}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    Seller: {order.sellerName}
                  </span>
                  <span className="text-xs text-blue-900 font-medium">
                    {order.sellerTrustScore}% Trust Score
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6">
              <span className="text-xs text-slate-500 block">Final Agreed Price</span>
              <span className="text-xl font-mono font-bold text-slate-900">
                {formatCurrency(order.agreedPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Buyer & Seller Information + Delivery Choice */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          {/* Buyer & Seller Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Counterparty Information
            </h3>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer:</span>
                <span className="font-semibold text-slate-900">{order.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer Contact:</span>
                <span className="font-mono text-slate-800">{order.buyerEmail || 'ananya.sharma@ontra.in'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/80 pt-2">
                <span className="text-slate-500">Seller:</span>
                <span className="font-semibold text-slate-900">{order.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seller City:</span>
                <span className="text-slate-800">{order.sellerLocation || 'Bengaluru, Karnataka'}</span>
              </div>
            </div>
          </div>

          {/* Delivery Method & Address/Handover details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Fulfillment Method & Destination
            </h3>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Selected Method:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  {order.deliveryMethod === 'courier' ? (
                    <>
                      <Truck className="w-3.5 h-3.5 text-blue-900" />
                      <span>Insured Courier (Shiprocket-Compatible)</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-3.5 h-3.5 text-blue-900" />
                      <span>Direct Physical Handover (OTP)</span>
                    </>
                  )}
                </span>
              </div>

              {order.deliveryMethod === 'courier' && order.deliveryAddress ? (
                <div className="pt-2 border-t border-slate-200/80 space-y-0.5">
                  <span className="text-slate-500 text-[11px] block">Shipping To:</span>
                  <p className="font-semibold text-slate-900">{order.deliveryAddress.fullName}</p>
                  <p className="text-slate-600">
                    {order.deliveryAddress.houseFlat ? `${order.deliveryAddress.houseFlat}, ` : ''}
                    {order.deliveryAddress.streetAddress}
                    {order.deliveryAddress.area ? `, ${order.deliveryAddress.area}` : ''}
                  </p>
                  <p className="text-slate-600">
                    {order.deliveryAddress.city}
                    {order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''} - {order.deliveryAddress.postalCode}, {order.deliveryAddress.country}
                  </p>
                </div>
              ) : order.handoverDetails ? (
                <div className="pt-2 border-t border-slate-200/80 space-y-1">
                  <span className="text-slate-500 text-[11px] block">Meeting Plan:</span>
                  <p className="font-semibold text-slate-900">{order.handoverDetails.locationName}</p>
                  <p className="text-slate-600">{order.handoverDetails.scheduledDate}</p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-blue-900 font-mono font-bold">
                    <span>One-Time Code (OTP):</span>
                    <span className="bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                      {order.handoverDetails.otpCode || '582-904'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200/80 text-slate-600">
                  Insured courier dispatch to registered buyer address.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Preview (What Happens Next) */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Transaction Journey · What Happens Next
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Here is the sequence of events ensuring safe exchange and seller settlement.
              </p>
            </div>
            <Link
              to={`/order-tracking/${order.orderId || order.id}`}
              className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
            >
              <span>Full Interactive Timeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Step 1: Paid & Verified
              </div>
              <p className="text-[11px] text-emerald-900">
                Payment verified through platform provider. Funds held in vault.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-blue-900 text-xs font-bold">
                <Box className="w-3.5 h-3.5" /> Step 2: Seller Processing
              </div>
              <p className="text-[11px] text-blue-950">
                Seller confirms packaging, serial, and books courier or meetup.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" /> Step 3: 48h Inspection
              </div>
              <p className="text-[11px] text-slate-600">
                You receive and physically test the product against the listing dossier.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Step 4: Seller Settlement
              </div>
              <p className="text-[11px] text-slate-600">
                Upon your satisfaction confirmation, payout is released to seller.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MANDATORY PROTECTED PAYMENT EXPLANATION (Section E) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Payment Protection Covenant</span>
        </div>
        <p className="text-slate-600 leading-relaxed font-medium">
          "Your payment is processed through the platform's payment provider. Seller settlement follows the inspection and dispute-resolution rules of the transaction."
        </p>
        <p className="text-[11px] text-slate-500">
          If any condition defects arise upon receipt, you may pause settlement immediately by clicking "Report a Problem" on the tracking screen.
        </p>
      </div>
    </div>
  );
};
