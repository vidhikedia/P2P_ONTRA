/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MOCK_SELLER_PAYOUTS } from '../../data/mockData.ts';
import { formatCurrency, formatDateTimeIST } from '../../utils/formatters.ts';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import { 
  Wallet, 
  ShieldCheck, 
  Clock, 
  Building2, 
  ArrowDownRight, 
  FileText, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.ts';

export const SellerPayoutsTab: React.FC = () => {
  const { showToast } = useToast();
  const [selectedReceipt, setSelectedReceipt] = useState<typeof MOCK_SELLER_PAYOUTS[0] | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-slate-900">Earnings & Escrow Settlement Ledger</h2>
        <p className="text-xs text-slate-500">
          Funds are held safely in ONTRA&apos;s escrow account until the buyer&apos;s 48-hour inspection period concludes.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Escrow */}
        <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <span>Escrow Vault Custody</span>
            <Lock className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">
            {formatCurrency(2700)}
          </p>
          <p className="text-[11px] text-emerald-700">
            Awaiting 48h physical inspection clearance ({formatDateTimeIST('2026-11-05T14:15:00Z')})
          </p>
        </div>

        {/* Lifetime Settled */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Settled Bank Payouts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatCurrency(42500)}
          </p>
          <p className="text-[11px] text-slate-400">
            Total lifetime payouts successfully disbursed to HDFC Bank (IMPS / NEFT)
          </p>
        </div>

        {/* Connected Bank Info */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Connected Bank Account</span>
            <Building2 className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-sm font-bold text-slate-900">
            HDFC Bank, Indiranagar (IFSC)
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            •••• •••• 4910 · IFSC: HDFC0000184 (Verified)
          </p>
        </div>
      </div>

      {/* Escrow Release Schedule Notice */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <p className="font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Next Payout Release Countdown
          </p>
          <p className="text-slate-300">
            Omega Speedmaster Professional 3861 ({formatCurrency(2700)}) clears to HDFC Bank automatically on <strong>{formatDateTimeIST('2026-11-05T14:15:00Z')}</strong>.
          </p>
        </div>
        <span className="font-mono text-sm bg-slate-800 px-3 py-1 rounded-lg text-emerald-400 font-bold shrink-0 text-center">
          ~22 Hours Remaining
        </span>
      </div>

      {/* Payout History Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Payout Settlement History</h3>
          <span className="text-xs text-slate-400">Itemized escrow disbursements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Transaction & Item</th>
                <th className="p-3.5">Gross Amount</th>
                <th className="p-3.5">Platform Escrow Fee</th>
                <th className="p-3.5">Net Payout</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_SELLER_PAYOUTS.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/50">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{rec.itemTitle}</p>
                    <span className="font-mono text-[11px] text-slate-400">
                      Tx: {rec.transactionId}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-800">
                    {formatCurrency(rec.grossAmount)}
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">
                    -{formatCurrency(rec.platformFee)} ({((rec.platformFee / rec.grossAmount) * 100).toFixed(1)}%)
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-700 text-sm">
                    {formatCurrency(rec.netPayout)}
                  </td>
                  <td className="p-3.5">
                    {rec.status === 'settled' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Disbursed ({rec.clearedAt})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                        Inspection Active ({rec.estimatedRelease})
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReceipt(rec)}
                      className="text-xs"
                    >
                      View Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Escrow Settlement Receipt"
          subtitle={`Reference #${selectedReceipt.id} · Disbursed via ONTRA Custody`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Sold Item:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.itemTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Agreed Price:</span>
                <span className="font-mono text-slate-900">{formatCurrency(selectedReceipt.grossAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Platform Escrow Fee:</span>
                <span className="font-mono text-slate-600">-{formatCurrency(selectedReceipt.platformFee)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span>Net Disbursed:</span>
                <span className="font-mono text-emerald-700">{formatCurrency(selectedReceipt.netPayout)}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-600 space-y-1">
              <p><strong>Destination:</strong> {selectedReceipt.destinationAccount}</p>
              <p><strong>Status:</strong> {selectedReceipt.status === 'settled' ? 'Cleared & Disbursed' : 'Under 48h Inspection'}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  showToast('Download Triggered', 'Receipt downloaded as PDF.', 'info');
                  setSelectedReceipt(null);
                }}
              >
                Download PDF
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
