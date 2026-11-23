/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction } from '../../types/index.ts';
import { formatCurrency, formatDate, formatDateTimeIST } from '../../utils/formatters.ts';
import { Button } from '../ui/Button.tsx';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  HelpCircle,
  FileCheck2,
  Check
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.ts';

interface BuyerInspectionTabProps {
  transaction: Transaction;
  onApprove: (txId: string) => void;
  onRaiseDispute: (txId: string) => void;
}

export const BuyerInspectionTab: React.FC<BuyerInspectionTabProps> = ({
  transaction,
  onApprove,
  onRaiseDispute,
}) => {
  const { showToast } = useToast();

  const [checklist, setChecklist] = useState({
    serialMatches: true,
    cosmeticMatches: true,
    mechanicalOperational: true,
    accessoriesComplete: true,
  });

  const [inspectionNotes, setInspectionNotes] = useState('');

  const allChecksPassed = 
    checklist.serialMatches &&
    checklist.cosmeticMatches &&
    checklist.mechanicalOperational &&
    checklist.accessoriesComplete;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">48-Hour Hands-On Product Inspection</h2>
        <p className="text-xs text-slate-500">
          Delivery confirmation and product satisfaction are separate. Examine the item thoroughly before approving payout.
        </p>
      </div>

      {/* Countdown Alert Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Active Inspection Countdown
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              Tx #{transaction.id}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white">
            {transaction.productTitle}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            Delivered via insured courier on {formatDate(transaction.shipping?.deliveredAt || '2026-11-03')}. You have until <strong>{formatDateTimeIST(transaction.inspection?.windowExpiresAt || '2026-11-05T08:45:00Z')}</strong> to complete physical testing. Escrow deposit of <strong>{formatCurrency(transaction.agreedPrice)}</strong> is securely locked in vault custody.
          </p>
        </div>

        <div className="text-center sm:text-right p-4 bg-slate-800/80 rounded-xl border border-slate-700 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Time Remaining
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            ~22h 15m
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Auto-approves upon expiry
          </span>
        </div>
      </div>

      {/* Physical Inspection Checklist Card */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs text-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Mandatory Verification Checklist
            </h3>
            <p className="text-slate-500 mt-0.5">
              Test the item against the seller's timestamped optical manifest.
            </p>
          </div>
          <a
            href={`/inspection/${transaction.orderId || transaction.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <span>Open Dedicated Inspection Page</span>
            <span className="text-slate-400">→</span>
          </a>
        </div>

        <div className="space-y-3">
          {/* Check 1 */}
          <label className="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={checklist.serialMatches}
              onChange={(e) => setChecklist({ ...checklist, serialMatches: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 mt-0.5 cursor-pointer"
            />
            <div>
              <p className="font-bold text-slate-900">1. Serial Number & Authenticity Match</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Caseback / chassis serial matches the masked proof on the seller manifest and warranty certificate.
              </p>
            </div>
          </label>

          {/* Check 2 */}
          <label className="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={checklist.cosmeticMatches}
              onChange={(e) => setChecklist({ ...checklist, cosmeticMatches: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 mt-0.5 cursor-pointer"
            />
            <div>
              <p className="font-bold text-slate-900">2. Cosmetic Condition & Blemish Disclosures</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                No undisclosed dents, deep scratches, bezel dings, or crystal fractures beyond what the seller documented.
              </p>
            </div>
          </label>

          {/* Check 3 */}
          <label className="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={checklist.mechanicalOperational}
              onChange={(e) => setChecklist({ ...checklist, mechanicalOperational: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 mt-0.5 cursor-pointer"
            />
            <div>
              <p className="font-bold text-slate-900">3. Operational & Mechanical Function</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Movement chronograph buttons, crown winding, dials, and electronic/acoustic functions actuate as specified.
              </p>
            </div>
          </label>

          {/* Check 4 */}
          <label className="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={checklist.accessoriesComplete}
              onChange={(e) => setChecklist({ ...checklist, accessoriesComplete: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 mt-0.5 cursor-pointer"
            />
            <div>
              <p className="font-bold text-slate-900">4. Included Accessories & Packaging</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Manufacturer presentation box, warranty card, extra bracelet links, and official receipts are all present.
              </p>
            </div>
          </label>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Buyer Inspection Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={inspectionNotes}
            onChange={(e) => setInspectionNotes(e.target.value)}
            placeholder="e.g. Inspected at local certified horologist. Timegrapher amplitude 310° at +1.2s/day. Flawless."
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Action Decision Strip */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            size="md"
            onClick={() => onRaiseDispute(transaction.id)}
            leftIcon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold"
          >
            Report Discrepancy & Halt Escrow
          </Button>

          <Button
            variant="primary"
            size="md"
            disabled={!allChecksPassed}
            onClick={() => onApprove(transaction.id)}
            leftIcon={<Check className="w-4 h-4" />}
            className={`font-semibold text-xs ${
              allChecksPassed
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Approve Physical Inspection & Release Payout
          </Button>
        </div>
      </div>
    </div>
  );
};
