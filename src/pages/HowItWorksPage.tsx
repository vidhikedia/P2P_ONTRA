/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrustJourneyStepper } from '../components/common/TrustJourneyStepper.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { formatCurrency } from '../utils/formatters.ts';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Truck, 
  CheckCircle2, 
  HelpCircle, 
  Scale, 
  Calculator,
  ArrowRight
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  // Escrow Calculator state (INR)
  const [calcPrice, setCalcPrice] = useState<number>(15000);
  const escrowFeeRate = 0.015; // 1.5% platform protection fee
  const escrowFee = Math.round(calcPrice * escrowFeeRate);
  const shippingInsurance = calcPrice > 50000 ? 499 : 199;
  const totalBuyerCharge = calcPrice + escrowFee + shippingInsurance;
  const netSellerPayout = calcPrice; // Seller receives 100% of agreed price; platform fee paid by buyer

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Structured Transaction Journey
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-balance">
          Eliminating peer-to-peer second-hand risk through evidence and escrow.
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Traditional marketplaces push buyers and sellers into blind trust or risky in-person cash meetings. ONTRA replaces uncertainty with a step-by-step verified escrow journey across India.
        </p>
      </div>

      {/* Stepper Interactive Module */}
      <div>
        <TrustJourneyStepper activeStage="evidence_submitted" />
      </div>

      {/* 2-Column Core Architecture Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left: The Escrow Vault & Fee Calculator */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-slate-800" />
              <h2 className="text-base font-bold text-slate-900">
                Transparent Escrow Fee Calculator
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Simulate an agreed peer-to-peer transaction to see exactly how funds are partitioned and safeguarded.
            </p>

            <div className="space-y-4">
              <Input
                label="Agreed Purchase Price (INR ₹)"
                type="number"
                min={500}
                step={500}
                value={calcPrice}
                onChange={(e) => setCalcPrice(Math.max(0, Number(e.target.value)))}
              />

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Agreed Item Price:</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">{formatCurrency(calcPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Escrow Custody & Inspection Guarantee (1.5%):</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">{formatCurrency(escrowFee)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Declared-Value Courier Insurance & PIN Tracking:</span>
                  <span className="font-mono tabular-nums font-medium text-slate-900">{formatCurrency(shippingInsurance)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Buyer Escrow Deposit:</span>
                  <span className="font-mono tabular-nums text-slate-900">{formatCurrency(totalBuyerCharge)}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-emerald-700 font-semibold">
                  <span>Guaranteed Seller Payout upon Inspection Pass:</span>
                  <span className="font-mono tabular-nums">{formatCurrency(netSellerPayout)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            Funds remain held in regulated payment custody via Razorpay / Cashfree-compatible escrow workflows and disburse via IMPS / NEFT / UPI upon inspection approval.
          </div>
        </div>

        {/* Right: Impartial Dispute Desk & Arbitration */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-slate-800" />
              <h2 className="text-base font-bold text-slate-900">
                Impartial Dispute Resolution Desk
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              What happens if an item arrives damaged or deviates from the verified listing?
            </p>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-1">1. Buyer Halts Payout within 48h</h4>
                <p className="leading-relaxed">
                  The buyer flags the discrepancy directly in the transaction console and uploads side-by-side comparison photos.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-1">2. Neutral Certified Arbitrator Review</h4>
                <p className="leading-relaxed">
                  An ONTRA arbitrator compares the pre-shipment evidence manifest against the buyer's unboxing evidence.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-1">3. Guaranteed Binding Ruling</h4>
                <p className="leading-relaxed">
                  If the item deviates materially, a return shipping label is provided and 100% of escrow funds are refunded to the buyer once tracking confirms return.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Average arbitration resolution: &lt; 24h</span>
            <Link to="/explore">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
