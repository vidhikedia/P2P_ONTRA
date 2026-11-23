/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { disputeService } from '../services/disputeService.ts';
import { RefundRecord } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { Button } from '../components/ui/Button.tsx';
import { useToast } from '../hooks/useToast.ts';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Copy,
  CreditCard,
  Building2,
  ShieldCheck,
  FileText,
  ExternalLink,
  Info,
} from 'lucide-react';

export const RefundPage: React.FC = () => {
  const { refundId } = useParams<{ refundId?: string }>();
  const { showToast } = useToast();

  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [selectedRefund, setSelectedRefund] = useState<RefundRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRefunds = async () => {
      setLoading(true);
      try {
        const res = await disputeService.getRefunds();
        if (res.data) {
          setRefunds(res.data);
          if (refundId) {
            const matched = res.data.find(
              (r) => r.id === refundId || r.refundReference === refundId || r.orderId === refundId
            );
            setSelectedRefund(matched || res.data[0]);
          } else {
            setSelectedRefund(res.data[0] || null);
          }
        }
      } catch (err) {
        console.error('Failed to load refunds', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRefunds();
  }, [refundId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied', 'Refund reference copied to clipboard.', 'info');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-medium">Fetching payment provider refund logs...</p>
      </div>
    );
  }

  if (!selectedRefund) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Refund Records Located</h2>
        <p className="text-slate-600 text-sm mb-6">There are currently no active or historical refunds on file.</p>
        <Link to="/buyer/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Top Header */}
      <div className="mb-8">
        <Link
          to={`/order-tracking/${selectedRefund.orderId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Order #{selectedRefund.orderId}</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-emerald-700" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Refund Statement</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Reference: <span className="font-mono font-bold text-slate-800">{selectedRefund.refundReference}</span>
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Status: {selectedRefund.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* PROTOTYPE NOTICE */}
      <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
        <p className="text-slate-600 leading-relaxed font-medium">
          "Use simulated refund statuses for the frontend prototype." In production, INR reversals are processed via the connected Indian payment gateway (Razorpay / Cashfree) webhook.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Refund Breakdown Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Refund Statement Breakdown
            </h2>

            {/* Financial Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 block">Original Payment:</span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {formatCurrency(selectedRefund.originalPayment)}
                </span>
                <span className="text-[10px] text-slate-400 block">Captured at checkout</span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-emerald-800 font-bold block">Refund Amount Reversible:</span>
                <span className="font-mono text-xl font-bold text-emerald-950">
                  {formatCurrency(selectedRefund.refundAmount)}
                </span>
                <span className="text-[10px] text-emerald-700 block">100% principal returned</span>
              </div>
            </div>

            {/* Metadata Table */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Refund Reference:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                  <span>{selectedRefund.refundReference}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedRefund.refundReference)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono text-slate-900 font-semibold">#{selectedRefund.orderId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary Recipient:</span>
                <span className="font-semibold text-slate-900">{selectedRefund.buyerName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                  Original UPI / Card (ananya.sharma@okicici)
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block">Reason for Refund:</span>
                <p className="text-slate-800 italic leading-relaxed">
                  "{selectedRefund.refundReason}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Refund Timeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Refund Processing Timeline</h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="relative pl-5 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {selectedRefund.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-mono text-[10px] text-slate-400 block">{step.timestamp}</span>
                    <h4 className="font-bold text-slate-900">{step.stage}</h4>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Bank Posting Window
            </span>
            <p className="text-[11px] leading-relaxed">
              Standard card processor credit memos typically appear on your banking statement within 2-4 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
