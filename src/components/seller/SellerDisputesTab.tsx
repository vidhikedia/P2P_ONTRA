/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, FileText, Scale, AlertTriangle, ArrowRight, Clock, MessageSquare } from 'lucide-react';
import { disputeService } from '../../services/disputeService.ts';
import { DisputeCase } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import { Button } from '../ui/Button.tsx';

export const SellerDisputesTab: React.FC = () => {
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      try {
        const res = await disputeService.getDisputes();
        if (res.data) setDisputes(res.data);
      } catch (err) {
        console.error('Failed to load seller disputes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, []);

  const openDisputes = disputes.filter((d) => d.currentStatus !== 'resolved');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Dispute & Neutral Arbitration Desk</h2>
          <p className="text-xs text-slate-500">
            ONTRA protects sellers against frivolous claims through mandatory pre-shipment timestamped evidence.
          </p>
        </div>

        <Link to="/transactions">
          <Button variant="outline" size="sm" className="text-xs font-semibold">
            Transaction Ledger
          </Button>
        </Link>
      </div>

      {/* Active Disputes Section (Section B Seller Response) */}
      {openDisputes.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Active Disputes Requiring Attention ({openDisputes.length})
          </h3>

          <div className="space-y-3">
            {openDisputes.map((d) => (
              <div
                key={d.id}
                className="p-5 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">Dispute #{d.id}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-500">Order #{d.orderId}</span>
                  </div>
                  <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Reason: {d.reasonLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 flex items-center gap-3">
                    <img
                      src={d.productImage}
                      alt={d.productTitle}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{d.productTitle}</h4>
                      <p className="text-slate-500 mt-0.5">
                        Claimed by: <strong>{d.buyerName}</strong> · Escrow Held: <strong className="font-mono text-slate-900">{formatCurrency(d.agreedPrice)}</strong>
                      </p>
                      <p className="text-slate-600 line-clamp-1 mt-1 italic">
                        "{d.detailedExplanation}"
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex flex-col gap-2 justify-center">
                    <Link to={`/disputes/${d.id}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-center bg-blue-900 hover:bg-blue-950 font-semibold text-xs shadow-xs"
                        leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                      >
                        {d.sellerResponse ? 'View Seller Statement' : 'Submit Seller Response'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Zero Disputes Clean Record Card */
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">Zero Active Disputes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your account is in excellent standing. All completed transactions have passed buyer physical inspection without condition claims.
            </p>
          </div>

          <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            99.8% Dispute-Free Rating
          </span>
        </div>
      )}

      {/* How Seller Protection Works */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 text-xs text-slate-700">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Scale className="w-4 h-4 text-slate-800" />
          <span>How Neutral Arbitration Protects You</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600">
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">1. Locked Evidence Manifest</span>
            <p className="text-[11px] leading-relaxed">
              Photos, serial engravings, and video proofs uploaded during listing cannot be altered after checkout.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">2. 48-Hour Hard Cutoff</span>
            <p className="text-[11px] leading-relaxed">
              Buyers must report defects within 48 hours of doorstep delivery. If no dispute is lodged, funds release automatically.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">3. Escrow Backing</span>
            <p className="text-[11px] leading-relaxed">
              Funds are 100% held upfront. Buyers cannot issue credit card chargebacks while arbitration is open.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
