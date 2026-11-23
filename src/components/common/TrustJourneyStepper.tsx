/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TRANSACTION_STAGES } from '../../utils/statusHelpers.ts';
import { TransactionStage } from '../../types/index.ts';
import { ShieldCheck, MessageSquare, Lock, Truck, Eye, CheckCircle2, ChevronRight } from 'lucide-react';

const STAGE_ICONS: Partial<Record<TransactionStage, React.ReactNode>> = {
  evidence_submitted: <ShieldCheck className="w-4 h-4" />,
  offer_negotiation: <MessageSquare className="w-4 h-4" />,
  escrow_funded: <Lock className="w-4 h-4" />,
  insured_shipping: <Truck className="w-4 h-4" />,
  buyer_inspection: <Eye className="w-4 h-4" />,
  payout_released: <CheckCircle2 className="w-4 h-4" />,
  dispute_raised: <ShieldCheck className="w-4 h-4" />,
  order_placed: <ShieldCheck className="w-4 h-4" />,
  payment_verified: <Lock className="w-4 h-4" />,
  seller_processing: <Truck className="w-4 h-4" />,
  dispatched_or_arranged: <Truck className="w-4 h-4" />,
  in_transit: <Truck className="w-4 h-4" />,
  delivered_or_handover: <ShieldCheck className="w-4 h-4" />,
  inspection_in_progress: <Eye className="w-4 h-4" />,
  buyer_confirmed_satisfaction: <CheckCircle2 className="w-4 h-4" />,
  seller_settlement_initiated: <CheckCircle2 className="w-4 h-4" />,
};

const STAGE_DEEP_DIVES: Partial<Record<TransactionStage, {
  buyerGuarantees: string[];
  sellerGuarantees: string[];
  escrowProtocol: string;
}>> = {
  evidence_submitted: {
    buyerGuarantees: [
      'Serial numbers and barcodes matched against manufacturer databases.',
      'Seller must upload timestamped handwritten safety note in photo.',
      'Macro photographs of high-wear points required for all categories.'
    ],
    sellerGuarantees: [
      'Evidence manifest establishes pristine pre-shipment condition baseline.',
      'Protects seller against fraudulent swap claims.'
    ],
    escrowProtocol: 'System validates verification criteria before listing becomes visible in Explore.'
  },
  offer_negotiation: {
    buyerGuarantees: [
      'Binding offers lock maximum pricing and insured delivery charges.',
      'No bidding wars, hidden buyer premiums, or bait-and-switch.'
    ],
    sellerGuarantees: [
      'Only verified accounts with confirmed identity can submit offers.',
      'Offers are legally binding once accepted.'
    ],
    escrowProtocol: 'Pre-authorizes payment method so accepted offers immediately enter escrow funding.'
  },
  escrow_funded: {
    buyerGuarantees: [
      'Funds are never sent directly to the seller; kept in an insured vault.',
      '100% refundable if the item is never dispatched or damaged in transit.'
    ],
    sellerGuarantees: [
      'Seller receives cryptographic proof that 100% of purchase funds are locked.',
      'Seller is guaranteed payout once inspection criteria are met.'
    ],
    escrowProtocol: 'Managed custodial INR escrow holding under ONTRA Vault protocol.'
  },
  insured_shipping: {
    buyerGuarantees: [
      'Full declared replacement value coverage under insured courier workflow.',
      'Verified OTP or signature confirmation required on doorstep delivery.'
    ],
    sellerGuarantees: [
      'Shiprocket-compatible insured airwaybill with end-to-end tracking across Indian PIN codes.',
      'Coverage against courier loss or transit damage with pre-shipment evidence.'
    ],
    escrowProtocol: 'Courier tracking updates notify both parties in IST upon delivery scan.'
  },
  buyer_inspection: {
    buyerGuarantees: [
      'Full 48 hours from signed delivery to test and inspect the physical item.',
      'Compare serials and condition against the seller’s pre-shipment evidence photos.'
    ],
    sellerGuarantees: [
      'Automated INR payout release if the 48-hour inspection countdown expires without a filed issue.',
      'Buyer cannot claim wear that was already documented in the original listing.'
    ],
    escrowProtocol: '48-hour countdown clock managed server-side with SMS & email reminders in IST.'
  },
  payout_released: {
    buyerGuarantees: [
      'Transaction concludes with clear receipt and warranty transfer documents.',
      'Buyer rates seller trust score.'
    ],
    sellerGuarantees: [
      'Immediate automated IMPS / NEFT / UPI payout transfer to seller’s verified Indian bank account.',
      'Zero risk of payment reversals once inspection completes.'
    ],
    escrowProtocol: 'Escrow vault releases INR funds to seller and closes transaction ledger.'
  },
  dispute_raised: {
    buyerGuarantees: [
      'Escrow funds remain frozen while a certified ONTRA human arbitrator reviews.',
      'Return label provided if item significantly diverges from evidence photos.'
    ],
    sellerGuarantees: [
      'Protection against fraudulent buyer remorse through comparison with pre-shipment evidence.'
    ],
    escrowProtocol: 'Arbitration desk issues binding ruling within 24 business hours.'
  }
};

export const TrustJourneyStepper: React.FC<{ activeStage?: TransactionStage }> = ({
  activeStage = 'evidence_submitted'
}) => {
  const [selectedStage, setSelectedStage] = useState<TransactionStage>(activeStage);
  const currentDetail = STAGE_DEEP_DIVES[selectedStage];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            The ONTRA 6-Stage Transaction Journey
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Every deal is guarded by evidence validation, INR escrow custody, and a 48-hour buyer inspection window.
          </p>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Click any stage below to inspect safeguards</span>
        </div>
      </div>

      {/* 6 Step Interactive Pills / Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-6">
        {TRANSACTION_STAGES.map((s) => {
          const isSelected = selectedStage === s.stage;
          return (
            <button
              key={s.stage}
              onClick={() => setSelectedStage(s.stage)}
              className={`flex flex-col text-left p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[10px] font-mono uppercase tracking-wider ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  Step {s.stepNumber}
                </span>
                <span className={isSelected ? 'text-white' : 'text-slate-600'}>
                  {STAGE_ICONS[s.stage]}
                </span>
              </div>
              <span className="text-xs font-semibold leading-tight line-clamp-1">
                {s.title}
              </span>
              <span className={`text-[11px] mt-1 line-clamp-2 leading-snug ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {s.shortDesc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Deep-dive details panel */}
      {currentDetail && (
        <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/50 rounded-lg p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-700" />
                <span>Buyer Safeguards</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {currentDetail.buyerGuarantees.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                <span>Seller Safeguards</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {currentDetail.sellerGuarantees.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-700" />
                <span>Escrow Vault Protocol</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentDetail.escrowProtocol}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                Protected by ONTRA Escrow Custodial Protocol with pan-India PIN code courier & OTP handover support.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
