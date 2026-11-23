/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { ShieldCheck, FileText, HelpCircle, PhoneCall, CheckCircle2 } from 'lucide-react';

export type PolicyKey = 
  | 'about_us'
  | 'contact'
  | 'help_centre'
  | 'buyer_guidelines'
  | 'seller_guidelines'
  | 'terms_conditions'
  | 'privacy_policy'
  | 'refund_dispute_policy';

interface PolicyContent {
  title: string;
  subtitle: string;
  body: React.ReactNode;
}

const POLICY_DETAILS: Record<PolicyKey, PolicyContent> = {
  about_us: {
    title: 'About ONTRA',
    subtitle: 'Online Network for Trusted Resale and Access — Buy Smart. Sell Easy. Trust Every Deal.',
    body: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
        <p>
          ONTRA is India’s escrow-backed peer-to-peer second-hand marketplace built to eliminate the biggest risks in pre-owned commerce: misleading photos, missing provenance, and advance-payment fraud.
        </p>
        <p>
          Unlike classifieds or social media groups where buyers pay strangers upfront with no recourse, ONTRA holds INR purchase funds securely until the buyer completes a 48-hour hands-on physical inspection after courier delivery or OTP-verified local handover.
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <p className="font-semibold text-slate-900">Our Core Principles:</p>
          <p>• Mandatory pre-shipment photo & video evidence manifests with masked serial verification.</p>
          <p>• Escrow-protected INR payments via UPI, Debit/Credit Cards, and Net Banking.</p>
          <p>• 48-hour physical buyer inspection window before IMPS/NEFT seller payout release.</p>
        </div>
      </div>
    ),
  },
  contact: {
    title: 'Contact Support & Arbitration',
    subtitle: 'Direct support channels for verified buyers, sellers, and arbitrators across India.',
    body: (
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
        <p>
          Our escrow custody desk and dispute resolution officers operate Monday through Saturday, 9:30 AM – 7:30 PM IST (Asia/Kolkata).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-semibold text-slate-900 block mb-1">Escrow & Payout Desk</span>
            <p className="text-slate-500 font-mono">escrow@ontra.in</p>
            <p className="text-[11px] text-slate-400 mt-1">Average response: &lt; 2 hours (IST)</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-semibold text-slate-900 block mb-1">Dispute Arbitration Desk</span>
            <p className="text-slate-500 font-mono">disputes@ontra.in</p>
            <p className="text-[11px] text-slate-400 mt-1">Dedicated officer assigned &lt; 24h</p>
          </div>
        </div>
        <p className="text-slate-500 text-[11px]">
          Launch Operations Office: ONTRA Marketplace India, C-Scheme, Ashok Marg, Jaipur, Rajasthan 302001, India.
        </p>
      </div>
    ),
  },
  help_centre: {
    title: 'ONTRA Help Centre',
    subtitle: 'Frequently asked questions regarding INR escrow, courier & local handover, and inspection.',
    body: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed max-h-96 overflow-y-auto pr-1">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-1">When does the seller receive payment in INR?</h4>
          <p className="text-slate-600">
            Seller settlement via IMPS/NEFT/UPI is held until either: (1) The buyer confirms satisfactory physical condition, or (2) The 48-hour inspection countdown concludes with no dispute filed.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-1">What happens during direct local handover?</h4>
          <p className="text-slate-600">
            Both parties use a unique 6-digit OTP at the public meeting spot. Once the buyer verifies the item and shares the OTP, handover is logged and the inspection/settlement workflow proceeds safely.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-1">Can I return an item if I change my mind?</h4>
          <p className="text-slate-600">
            ONTRA protects against counterfeit items, transit damage, missing accessories, or major deviations from seller photos. Buyer remorse on accurately disclosed items is not grounds for reversal.
          </p>
        </div>
      </div>
    ),
  },
  buyer_guidelines: {
    title: 'Buyer Guidelines',
    subtitle: 'Protocol for conducting safe, verified second-hand purchases across India.',
    body: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Always pay through ONTRA escrow:</strong> Never send direct UPI QR transfers, GPay/PhonePe P2P payments, or cash advances outside the platform.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Verify the 48-Hour Checklist:</strong> Upon delivery, cross-check IMEI/serial numbers and cosmetic condition against the seller’s uploaded photos.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Record an unboxing video:</strong> Capture uncut parcel seal and unboxing video to streamline any transit damage claim.</span>
          </li>
        </ul>
      </div>
    ),
  },
  seller_guidelines: {
    title: 'Seller Guidelines',
    subtitle: 'How to list verified items and receive guaranteed INR payouts.',
    body: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
            <span><strong>Provide Timestamped Evidence:</strong> Upload clear daylight photographs including a handwritten date/name slip next to the device or serial stamp.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
            <span><strong>Disclose all cosmetic blemishes:</strong> Document minor scratches or wear upfront. Buyers cannot dispute flaws already disclosed in your listing.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
            <span><strong>Use Tracked Insured Courier or Handover OTP:</strong> Dispatch with verified airwaybill tracking or authenticate local meetups using the 6-digit buyer OTP.</span>
          </li>
        </ul>
      </div>
    ),
  },
  terms_conditions: {
    title: 'Terms and Conditions',
    subtitle: 'ONTRA platform user agreement and Indian escrow facilitation provisions.',
    body: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed max-h-80 overflow-y-auto">
        <p>
          By accessing ONTRA, buyers and sellers enter into a structured peer-to-peer transaction agreement governed by applicable laws of India, with dispute jurisdiction in Jaipur, Rajasthan.
        </p>
        <p>
          Seller INR settlement is strictly conditional upon verified delivery or OTP handover plus completion of the 48-hour inspection window or explicit buyer approval.
        </p>
        <p>
          Both parties agree that arbitration determinations recorded by ONTRA dispute officers based on pre-shipment dossiers and unboxing evidence are binding within platform governance.
        </p>
      </div>
    ),
  },
  privacy_policy: {
    title: 'Privacy Policy',
    subtitle: 'Data protection, serial number masking, and communication security.',
    body: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
        <p>
          We do not sell user data. Serial numbers displayed publicly on marketplace cards are algorithmically masked (e.g. SN-8924••••) to protect against manufacturer registry spoofing.
        </p>
        <p>
          Full serial numbers and unredacted invoice receipts are only accessible to the transacting buyer and escrow verification officers.
        </p>
      </div>
    ),
  },
  refund_dispute_policy: {
    title: 'Refund and Dispute Policy',
    subtitle: 'Objective criteria for fund releases, partial adjustments, and return shipping.',
    body: (
      <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
        <p>
          If an item is physically received with undisclosed defects, transit damage, or missing essential components:
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
          <p><strong>1. Payout Freeze:</strong> Buyer triggers dispute within 48h; seller funds are held in the vault.</p>
          <p><strong>2. Evidence Examination:</strong> Arbitrator compares seller pre-shipment photos with buyer unboxing evidence.</p>
          <p><strong>3. Return & Refund:</strong> If defect is confirmed, a prepaid return shipping label is issued. 100% of escrow funds are refunded upon return delivery.</p>
        </div>
      </div>
    ),
  },
};

export interface PolicyModalProps {
  policyKey: PolicyKey | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policyKey, onClose }) => {
  if (!policyKey) return null;
  const policy = POLICY_DETAILS[policyKey];

  return (
    <Modal
      isOpen={!!policyKey}
      onClose={onClose}
      title={policy.title}
      subtitle={policy.subtitle}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {policy.body}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
