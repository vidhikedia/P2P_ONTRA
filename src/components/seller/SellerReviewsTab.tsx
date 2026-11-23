/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MOCK_USERS } from '../../data/mockData.ts';
import { formatDate } from '../../utils/formatters.ts';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SellerReviewsTab: React.FC = () => {
  const seller = MOCK_USERS.seller;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Verified Buyer Reviews & Trust Reputation</h2>
          <p className="text-xs text-slate-500">
            Reviews can only be submitted after the 48-hour physical inspection passes and escrow settlement completes.
          </p>
        </div>
        <a
          href="/reviews"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shrink-0"
        >
          <span>All Marketplace Reviews</span>
          <span className="text-slate-400">→</span>
        </a>
      </div>

      {/* Rating Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-3xl font-bold text-slate-900 font-mono">
              {seller.rating}
            </span>
            <div className="flex items-center justify-center gap-0.5 text-amber-400 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {seller.reviewCount} verified reviews
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <p className="font-bold text-slate-900 text-sm">Verified Tech & Horology Seller</p>
            <p className="text-slate-500">
              {seller.trustScore.totalTransactions} completed sales · {seller.trustScore.successfulInspections} flawless inspections (99.8%)
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(seller.badges || []).map((b, i) => (
                <span
                  key={i}
                  className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                >
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500 space-y-1 sm:border-l sm:border-slate-100 sm:pl-6">
          <span className="font-semibold text-slate-900 block">Inspection Pass Rate</span>
          <p className="font-mono text-xl font-bold text-emerald-700">99.8%</p>
          <p className="text-[10px] text-slate-400">Zero condition disputes filed</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {(seller.reviews || []).map((rev) => (
          <div
            key={rev.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{rev.authorName}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">{formatDate(rev.date)}</span>
            </div>

            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>

            <p className="text-slate-700 leading-relaxed text-[12px]">
              "{rev.comment}"
            </p>

            <p className="text-[11px] text-slate-400 pt-1">
              Purchased: <strong>{rev.itemTitle}</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
