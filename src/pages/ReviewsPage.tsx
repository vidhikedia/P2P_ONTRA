/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { disputeService } from '../services/disputeService.ts';
import { transactionService } from '../services/transactionService.ts';
import { ReviewRecord, Transaction } from '../types/index.ts';
import { formatDate } from '../utils/formatters.ts';
import { Button } from '../components/ui/Button.tsx';
import { ReviewModal } from '../components/common/ReviewModal.tsx';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  Clock,
  Sparkles,
  Filter,
} from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const { sellerId } = useParams<{ sellerId?: string }>();

  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [completedTransactions, setCompletedTransactions] = useState<Transaction[]>([]);
  const [selectedTxForReview, setSelectedTxForReview] = useState<Transaction | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await disputeService.getReviews(sellerId);
      if (res.data) setReviews(res.data);

      const txRes = await transactionService.getTransactions();
      if (txRes.data) {
        // Find completed transactions eligible for reviews
        const eligible = txRes.data.filter(
          (t) =>
            t.currentStage === 'seller_settlement_initiated' ||
            t.currentStage === 'buyer_confirmed_satisfaction'
        );
        setCompletedTransactions(eligible);
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [sellerId]);

  // Average Rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2)
    : '4.95';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verified Reviews & Reputation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Every review on ONTRA is authenticated via completed escrow settlement and physical inspection.
          </p>
        </div>

        {completedTransactions.length > 0 && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setSelectedTxForReview(completedTransactions[0]);
              setIsReviewModalOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 font-semibold text-xs shadow-xs"
            leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
          >
            Leave a Verified Review
          </Button>
        )}
      </div>

      {/* Seller Average Rating & Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="text-center p-5 bg-slate-50 rounded-2xl border border-slate-200 shrink-0">
            <span className="text-4xl font-bold font-mono text-slate-900">{averageRating}</span>
            <div className="flex items-center justify-center gap-1 text-amber-400 mt-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Based on {reviews.length} sales</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <h2 className="text-base font-bold text-slate-900">Rohan Mehta (Verified Seller)</h2>
            <p>Member since October 2023 · Bengaluru, Karnataka</p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ 100% Inspection Pass Rate
              </span>
              <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                ✓ Identity & Banking Verified
              </span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                ✓ Pre-Shipment Macro Photos Mandatory
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 md:max-w-xs">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Purchase Protection
          </span>
          <p className="text-[11px] leading-relaxed">
            Unverified reviews, promotional ratings, or reviews before the 48-hour inspection period concludes are strictly blocked by protocol.
          </p>
        </div>
      </div>

      {/* Review History List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Review History ({reviews.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading verified reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No reviews published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{rev.buyerName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-slate-700 leading-relaxed text-[12px] italic">
                  "{rev.comment}"
                </p>

                {/* Product Reference */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[200px]">
                    Item: <strong>{rev.productTitle}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    {rev.deliveryRating && (
                      <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                        Delivery: {rev.deliveryRating}
                      </span>
                    )}
                    {rev.itemAccuracyRating && (
                      <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                        Accuracy: {rev.itemAccuracyRating.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedTxForReview && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          transaction={selectedTxForReview}
          onReviewSubmitted={fetchReviews}
        />
      )}
    </div>
  );
};
