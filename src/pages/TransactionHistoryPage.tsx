/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transactionService } from '../services/transactionService.ts';
import { Transaction } from '../types/index.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';
import { Button } from '../components/ui/Button.tsx';
import {
  History,
  ArrowRight,
  Filter,
  Search,
  Truck,
  QrCode,
  ShieldCheck,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'disputed' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTx = async () => {
      setLoading(true);
      try {
        const res = await transactionService.getTransactions();
        if (res.data) setTransactions(res.data);
      } catch (err) {
        console.error('Failed to load transaction history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    // Role filter
    if (roleFilter === 'buyer' && tx.buyerId !== 'usr_buyer_01') return false;
    if (roleFilter === 'seller' && tx.sellerId !== 'usr_seller_01') return false;

    // Status filter
    if (statusFilter === 'completed' && tx.currentStage !== 'seller_settlement_initiated') return false;
    if (statusFilter === 'disputed' && tx.currentStage !== 'dispute_raised') return false;
    if (statusFilter === 'active' && (tx.currentStage === 'seller_settlement_initiated' || tx.currentStage === 'dispute_raised')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.productTitle.toLowerCase().includes(q);
      const matchId = tx.id.toLowerCase().includes(q) || (tx.orderId && tx.orderId.toLowerCase().includes(q));
      const matchCounterparty = tx.sellerName.toLowerCase().includes(q) || tx.buyerName.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchCounterparty) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-blue-900" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marketplace Transaction Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete historical audit trail with full custody, delivery, inspection, and settlement records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {filteredTransactions.length} Total Records
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, product, counterparty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          {/* Role selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Roles
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('buyer')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                roleFilter === 'buyer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Purchases (Buyer)
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('seller')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                roleFilter === 'seller' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Sales (Seller)
            </button>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Statuses
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Settled
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('disputed')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                statusFilter === 'disputed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Disputed
            </button>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading verified transaction records...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="font-bold text-slate-800 text-sm">No transactions match current filters</p>
          <p className="mt-1">Try resetting search filters or role selectors.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Tx / Order ID</th>
                  <th className="p-3.5">Product & Counterparty</th>
                  <th className="p-3.5">Financials & Fees</th>
                  <th className="p-3.5">Fulfillment</th>
                  <th className="p-3.5">Inspection & Custody</th>
                  <th className="p-3.5">Settlement / Refund</th>
                  <th className="p-3.5 text-right">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isSettled = tx.currentStage === 'seller_settlement_initiated';
                  const isDisputed = tx.currentStage === 'dispute_raised';
                  const isInspection = tx.currentStage === 'inspection_in_progress';
                  const isBuyer = tx.buyerId === 'usr_buyer_01';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Transaction ID & Role */}
                      <td className="p-3.5 align-top">
                        <span className="font-mono font-bold text-slate-900 block">
                          {tx.orderId || tx.id}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          {formatDate(tx.updatedAt)}
                        </span>
                        <span
                          className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isBuyer
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          Role: {isBuyer ? 'Buyer' : 'Seller'}
                        </span>
                      </td>

                      {/* 2. Product */}
                      <td className="p-3.5 align-top">
                        <div className="flex items-center gap-3">
                          <img
                            src={tx.productImage}
                            alt={tx.productTitle}
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <h3 className="font-bold text-slate-900 line-clamp-1">{tx.productTitle}</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {isBuyer ? `Seller: ${tx.sellerName}` : `Buyer: ${tx.buyerName}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 3. Pricing, Negotiated Price & Fees */}
                      <td className="p-3.5 align-top">
                        <span className="font-mono font-bold text-slate-900 block">
                          {formatCurrency(tx.agreedPrice)}
                        </span>
                        {tx.originalListingPrice && tx.originalListingPrice > tx.agreedPrice && (
                          <span className="text-[10px] text-slate-400 line-through block font-mono">
                            Orig: {formatCurrency(tx.originalListingPrice)}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Platform Fee (1.5%): {formatCurrency(tx.platformFee || Math.round(tx.agreedPrice * 0.015))}
                        </span>
                      </td>

                      {/* 4. Delivery Method */}
                      <td className="p-3.5 align-top">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          {tx.deliveryMethod === 'courier' ? (
                            <>
                              <Truck className="w-3.5 h-3.5 text-blue-900" />
                              <span>Insured Courier</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="w-3.5 h-3.5 text-blue-900" />
                              <span>Direct Handover</span>
                            </>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {tx.deliveryMethod === 'courier' ? (tx.shipping?.trackingNumber || 'BD-924180-BLR-JAI') : 'OTP Authenticated'}
                        </span>
                      </td>

                      {/* 5. Inspection Status */}
                      <td className="p-3.5 align-top">
                        {isSettled ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Inspection Passed
                          </span>
                        ) : isDisputed ? (
                          <span className="text-rose-700 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Dispute Raised
                          </span>
                        ) : isInspection ? (
                          <span className="text-blue-900 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 48h Window Active
                          </span>
                        ) : (
                          <span className="text-slate-500">Processing Dispatch</span>
                        )}
                      </td>

                      {/* 6. Settlement / Refund Status */}
                      <td className="p-3.5 align-top">
                        {isSettled ? (
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block text-center">
                            Settlement Disbursed
                          </span>
                        ) : isDisputed ? (
                          <span className="font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 block text-center">
                            Frozen in Vault
                          </span>
                        ) : (
                          <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block text-center">
                            Held in Escrow Vault
                          </span>
                        )}
                      </td>

                      {/* 7. Action to Open Full 9-Stage Timeline */}
                      <td className="p-3.5 align-top text-right">
                        <Link to={`/order-tracking/${tx.orderId || tx.id}`}>
                          <Button variant="outline" size="sm" className="text-xs font-semibold">
                            <span>Timeline</span>
                            <ChevronRight className="w-3 h-3 ml-0.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
