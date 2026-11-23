/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DisputeReason = 
  | 'product_not_received'
  | 'product_damaged'
  | 'product_not_working'
  | 'product_significantly_different'
  | 'missing_accessories'
  | 'undisclosed_defects'
  | 'counterfeit_or_misrepresentation'
  | 'other';

export type DisputeStatus = 
  | 'open'
  | 'awaiting_seller_response'
  | 'under_admin_review'
  | 'additional_evidence_required'
  | 'resolved'
  | 'rejected';

export type AdminDecisionType =
  | 'request_more_evidence'
  | 'approve_full_refund'
  | 'approve_partial_refund'
  | 'authorize_return_and_refund'
  | 'approve_seller_settlement';

export interface DisputeEvidenceMedia {
  id: string;
  type: 'photo' | 'video' | 'document';
  url: string;
  name: string;
  uploadedBy: 'buyer' | 'seller';
  uploadedAt: string;
  caption?: string;
}

export interface DisputeTimelineEvent {
  id: string;
  status: DisputeStatus;
  actor: 'buyer' | 'seller' | 'admin' | 'system';
  actorName: string;
  timestamp: string;
  title: string;
  description: string;
  actionRequiredFrom?: 'buyer' | 'seller' | 'admin';
}

export interface DisputeCase {
  id: string;
  orderId: string;
  transactionId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  agreedPrice: number;
  currency: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  reason: DisputeReason;
  reasonLabel: string;
  detailedExplanation: string;
  dateRaised: string;
  buyerEvidence: DisputeEvidenceMedia[];
  sellerResponse?: {
    respondedAt: string;
    statement: string;
    evidence: DisputeEvidenceMedia[];
  };
  currentStatus: DisputeStatus;
  adminDecision?: {
    decision: AdminDecisionType;
    decidedAt: string;
    arbitratorName: string;
    reasoning: string;
    refundAmount?: number;
    returnTrackingRequired?: boolean;
  };
  resolutionTimeline: DisputeTimelineEvent[];
  updatedAt: string;
}

export interface RefundRecord {
  id: string;
  refundReference: string;
  orderId: string;
  transactionId: string;
  disputeId?: string;
  productTitle: string;
  productImage: string;
  buyerName: string;
  originalPayment: number;
  refundAmount: number;
  refundReason: string;
  status: 'processing' | 'issued' | 'completed' | 'declined';
  paymentMethodUsed: 'card' | 'bank_wire' | 'escrow_balance' | 'UPI / Net Banking' | 'UPI / Original Payment Method';
  timeline: {
    stage: string;
    timestamp: string;
    note: string;
    completed: boolean;
  }[];
  createdAt: string;
  completedAt?: string;
}

export interface ReviewRecord {
  id: string;
  transactionId: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  rating: number; // 1 to 5
  comment: string;
  isVerifiedPurchase: boolean;
  deliveryRating?: 'fast' | 'on_time' | 'delayed';
  itemAccuracyRating?: 'exact' | 'better_than_expected' | 'minor_difference';
  createdAt: string;
}
