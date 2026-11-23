/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import { disputeService } from '../../services/disputeService.ts';
import { useToast } from '../../hooks/useToast.ts';
import { Transaction } from '../../types/index.ts';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onReviewSubmitted,
}) => {
  const { showToast } = useToast();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [deliveryRating, setDeliveryRating] = useState<'fast' | 'on_time' | 'delayed'>('on_time');
  const [itemAccuracyRating, setItemAccuracyRating] = useState<'exact' | 'better_than_expected' | 'minor_difference'>('exact');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check eligibility: Only allow reviews for eligible completed transactions
  const isEligible =
    transaction.currentStage === 'seller_settlement_initiated' ||
    transaction.currentStage === 'buyer_confirmed_satisfaction';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Comment Required', 'Please share your experience with this purchase.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await disputeService.createReview({
        transactionId: transaction.id,
        orderId: transaction.orderId || transaction.id,
        productId: transaction.productId,
        productTitle: transaction.productTitle,
        productImage: transaction.productImage,
        sellerId: transaction.sellerId,
        sellerName: transaction.sellerName,
        buyerId: transaction.buyerId,
        buyerName: transaction.buyerName,
        rating,
        comment,
        deliveryRating,
        itemAccuracyRating,
      });

      showToast('Review Published', 'Your review was published with the Verified Purchase badge.', 'success');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to publish review.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate & Review Transaction"
      subtitle={`Verified Purchase with ${transaction.sellerName}`}
      maxWidth="md"
    >
      {!isEligible ? (
        <div className="p-6 text-center text-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Review Not Yet Eligible</h3>
          <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
            Under platform safety rules, reviews can only be submitted after your 48-hour hands-on inspection passes and seller settlement completes.
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
          {/* Verified Purchase Badge */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <img
                src={transaction.productImage}
                alt={transaction.productTitle}
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div>
                <p className="font-bold text-slate-900 line-clamp-1">{transaction.productTitle}</p>
                <p className="text-[11px] text-slate-500">Seller: {transaction.sellerName}</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified Purchase
            </span>
          </div>

          {/* Star Rating Selector */}
          <div className="text-center py-2 space-y-1">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Overall Rating
            </label>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              {rating === 5
                ? '5 Stars · Flawless Experience'
                : rating === 4
                ? '4 Stars · Very Good'
                : rating === 3
                ? '3 Stars · Acceptable'
                : '1-2 Stars · Needs Improvement'}
            </span>
          </div>

          {/* Detailed Review Comment */}
          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Write Your Review:
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe product accuracy, packaging security, responsiveness, and physical condition upon arrival..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed"
            />
          </div>

          {/* Sub-ratings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Item Accuracy</label>
              <select
                value={itemAccuracyRating}
                onChange={(e) => setItemAccuracyRating(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                <option value="exact">Exact Match to Dossier</option>
                <option value="better_than_expected">Better than Expected</option>
                <option value="minor_difference">Minor Cosmetic Variance</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Delivery / Handover</label>
              <select
                value={deliveryRating}
                onChange={(e) => setDeliveryRating(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                <option value="fast">Fast & Secure</option>
                <option value="on_time">On Schedule</option>
                <option value="delayed">Carrier Delay</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="bg-blue-900 hover:bg-blue-950 font-semibold"
            >
              {isSubmitting ? 'Publishing Review...' : 'Publish Verified Review'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
