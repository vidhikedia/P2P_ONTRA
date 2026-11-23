/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DisputeCase,
  DisputeReason,
  DisputeStatus,
  AdminDecisionType,
  DisputeEvidenceMedia,
  RefundRecord,
  ReviewRecord,
  ApiResponse,
} from '../types/index.ts';
import { apiClient, USE_MOCK_API, simulateNetworkDelay, createApiResponse } from './apiClient.ts';
import { formatCurrency, formatDateTimeIST } from '../utils/formatters.ts';

export const DISPUTE_REASONS_CONFIG: {
  reason: DisputeReason;
  label: string;
  description: string;
}[] = [
  {
    reason: 'product_not_received',
    label: 'Product Not Received',
    description: 'Carrier delivery scan missing or in-person handover did not take place.',
  },
  {
    reason: 'product_damaged',
    label: 'Product Damaged',
    description: 'Item arrived cracked, fractured, or compromised during freight transit.',
  },
  {
    reason: 'product_not_working',
    label: 'Product Not Working',
    description: 'Hardware failed to power on or key mechanical functions do not actuate.',
  },
  {
    reason: 'product_significantly_different',
    label: 'Product Significantly Different from Listing',
    description: 'Specification, version, or appearance deviates substantially from listing manifest.',
  },
  {
    reason: 'missing_accessories',
    label: 'Missing Accessories',
    description: 'Stated presentation box, cables, adapters, or paperwork missing from package.',
  },
  {
    reason: 'undisclosed_defects',
    label: 'Undisclosed Defects',
    description: 'Unreported scratches, screen burn-in, battery degradation, or deep cosmetic flaws.',
  },
  {
    reason: 'counterfeit_or_misrepresentation',
    label: 'Suspected Counterfeit or Misrepresentation',
    description: 'Serial number mismatch, authenticity concern, or non-genuine components.',
  },
  {
    reason: 'other',
    label: 'Other Inspection Discrepancy',
    description: 'Other verified term violation or breach of platform peer agreement.',
  },
];

// Initial mock disputes
let disputesStore: DisputeCase[] = [
  {
    id: 'DISP-98412',
    orderId: 'ORD-89241',
    transactionId: 'tx_ord-89241',
    productId: 'prod_leica_m6',
    productTitle: 'Leica M6 TTL 0.72x Black Chrome 35mm Rangefinder',
    productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    agreedPrice: 14500,
    currency: 'INR',
    buyerId: 'usr_buyer_01',
    buyerName: 'Ananya Sharma',
    sellerId: 'usr_seller_01',
    sellerName: 'Rohan Mehta',
    reason: 'undisclosed_defects',
    reasonLabel: 'Undisclosed Defects',
    detailedExplanation:
      'Upon hands-on inspection during the 48-hour window in Jaipur, I discovered a hairline scratch on the lower rangefinder prism mirror and faint haze on the viewfinder frame that was not visible in the seller macro photos.',
    dateRaised: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    buyerEvidence: [
      {
        id: 'ev_1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        name: 'prism_hairline_macro_inspection.jpg',
        uploadedBy: 'buyer',
        uploadedAt: new Date(Date.now() - 35 * 3600 * 1000).toISOString(),
        caption: 'Macro zoom showing optical coating mark on prism assembly.',
      },
      {
        id: 'ev_2',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        name: 'viewfinder_light_pass_test.mp4',
        uploadedBy: 'buyer',
        uploadedAt: new Date(Date.now() - 35 * 3600 * 1000).toISOString(),
        caption: 'Video demonstrating light refraction across ocular element.',
      },
    ],
    sellerResponse: {
      respondedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      statement:
        'The prism was serviced by an authorised camera technician in Bengaluru during the June CLA. The mark is light external coating reflection and does not affect rangefinder focus accuracy. I am willing to offer a ₹1,500 courtesy reimbursement or accept return in original condition.',
      evidence: [
        {
          id: 'ev_seller_1',
          type: 'document',
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
          name: 'cla_service_certificate_bengaluru.pdf',
          uploadedBy: 'seller',
          uploadedAt: new Date(Date.now() - 17 * 3600 * 1000).toISOString(),
          caption: 'Service invoice certifying rangefinder alignment within factory tolerance.',
        },
      ],
    },
    currentStatus: 'under_admin_review',
    resolutionTimeline: [
      {
        id: 'tl_1',
        status: 'open',
        actor: 'buyer',
        actorName: 'Ananya Sharma',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        title: 'Dispute Filed by Buyer',
        description: 'Settlement frozen in ONTRA Escrow vault. Case forwarded to seller for response.',
        actionRequiredFrom: 'seller',
      },
      {
        id: 'tl_2',
        status: 'awaiting_seller_response',
        actor: 'system',
        actorName: 'ONTRA Custody Protocol',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        title: 'Seller Response Period Active',
        description: 'Seller provided 24 hours to examine buyer evidence and submit statement.',
        actionRequiredFrom: 'seller',
      },
      {
        id: 'tl_3',
        status: 'under_admin_review',
        actor: 'seller',
        actorName: 'Rohan Mehta',
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        title: 'Seller Rebuttal & Documentation Submitted',
        description: 'Seller uploaded CLA service certificate and proposed ₹1,500 partial credit.',
        actionRequiredFrom: 'admin',
      },
    ],
    updatedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
];

// Initial mock refunds
let refundsStore: RefundRecord[] = [
  {
    id: 'ref_001',
    refundReference: 'ONTRA-REF-2026-89412',
    orderId: 'ORD-72109',
    transactionId: 'tx_ord-72109',
    disputeId: 'DISP-71042',
    productTitle: 'Hasselblad 503CW Medium Format Kit',
    productImage: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    buyerName: 'Ananya Sharma',
    originalPayment: 12500,
    refundAmount: 12500,
    refundReason: 'Arbitration Resolution: Mutual return authorised for transit optical damage.',
    status: 'completed',
    paymentMethodUsed: 'UPI / Net Banking',
    timeline: [
      {
        stage: 'Arbitration Decision Approved',
        timestamp: '01/11/2026, 03:30 PM IST',
        note: 'Neutral arbitrator Priya Nair authorised 100% buyer refund upon return delivery.',
        completed: true,
      },
      {
        stage: 'Return Parcel Received & Inspected',
        timestamp: '03/11/2026, 06:45 PM IST',
        note: 'Seller confirmed return receipt in Bengaluru with matching serial number.',
        completed: true,
      },
      {
        stage: 'Payment Provider Reversal Initiated',
        timestamp: '03/11/2026, 08:00 PM IST',
        note: 'Provider sandbox issued full INR reversal of ₹12,500.',
        completed: true,
      },
      {
        stage: 'Credit Completed to Original Payment Method',
        timestamp: '04/11/2026, 01:42 PM IST',
        note: 'Funds credited back to buyer UPI handle (ananya@okicici).',
        completed: true,
      },
    ],
    createdAt: '2026-11-01T11:00:00Z',
    completedAt: '2026-11-04T09:12:00Z',
  },
];

// Initial mock reviews
let reviewsStore: ReviewRecord[] = [
  {
    id: 'rev_001',
    transactionId: 'tx_leica_demo',
    orderId: 'ORD-51928',
    productId: 'prod_leica_m6',
    productTitle: 'Leica M6 TTL 0.72x Black Chrome',
    productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    sellerId: 'usr_seller_01',
    sellerName: 'Rohan Mehta',
    buyerId: 'usr_buyer_01',
    buyerName: 'Ananya Sharma',
    rating: 5,
    comment:
      'Impeccable double-box packing with tamper-evident seals delivered to Jaipur. Shutter speeds are accurate across all stops and matched the ONTRA evidence dossier.',
    isVerifiedPurchase: true,
    deliveryRating: 'fast',
    itemAccuracyRating: 'exact',
    createdAt: '2026-10-28T16:20:00Z',
  },
  {
    id: 'rev_002',
    transactionId: 'tx_omega_demo',
    orderId: 'ORD-44912',
    productId: 'prod_omega_speedy',
    productTitle: 'Omega Speedmaster Professional Sapphire',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    sellerId: 'usr_seller_01',
    sellerName: 'Rohan Mehta',
    buyerId: 'usr_buyer_02',
    buyerName: 'Kabir Malhotra',
    rating: 5,
    comment:
      'Smooth deal through ONTRA escrow. Seller shared full service papers and timekeeping tested within +1.5s/day.',
    isVerifiedPurchase: true,
    deliveryRating: 'on_time',
    itemAccuracyRating: 'exact',
    createdAt: '2026-10-15T11:45:00Z',
  },
];

export const disputeService = {
  /**
   * Fetch all disputes (or filtered by user ID / role)
   */
  async getDisputes(userId?: string, role?: 'buyer' | 'seller' | 'admin'): Promise<ApiResponse<DisputeCase[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<DisputeCase[]>('/disputes', { userId, role });
    }

    await simulateNetworkDelay(120);
    if (!userId || role === 'admin') {
      return createApiResponse(disputesStore);
    }
    const filtered = disputesStore.filter((d) =>
      role === 'buyer' ? d.buyerId === userId : d.sellerId === userId
    );
    return createApiResponse(filtered.length > 0 ? filtered : disputesStore);
  },

  /**
   * Get single dispute by ID
   */
  async getDisputeById(disputeId: string): Promise<ApiResponse<DisputeCase | null>> {
    if (!USE_MOCK_API) {
      return apiClient.get<DisputeCase | null>(`/disputes/${disputeId}`);
    }

    await simulateNetworkDelay(100);
    const found = disputesStore.find((d) => d.id === disputeId || d.orderId === disputeId) || null;
    return createApiResponse(found);
  },

  /**
   * Raise a new problem / dispute (Section A)
   */
  async createDispute(params: {
    orderId: string;
    transactionId: string;
    productId: string;
    productTitle: string;
    productImage: string;
    agreedPrice: number;
    currency?: string;
    buyerId: string;
    buyerName: string;
    sellerId: string;
    sellerName: string;
    reason: DisputeReason;
    detailedExplanation: string;
    supportingPhotos: string[];
    supportingVideos?: string[];
  }): Promise<ApiResponse<DisputeCase>> {
    if (!USE_MOCK_API) {
      return apiClient.post<DisputeCase>('/disputes', params);
    }

    await simulateNetworkDelay(250);

    const disputeId = `DISP-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const reasonItem = DISPUTE_REASONS_CONFIG.find((r) => r.reason === params.reason);
    const reasonLabel = reasonItem?.label || 'Inspection Term Discrepancy';

    const evidenceItems: DisputeEvidenceMedia[] = [
      ...params.supportingPhotos.map((url, i) => ({
        id: `ev_photo_${Date.now()}_${i}`,
        type: 'photo' as const,
        url,
        name: `buyer_evidence_photo_${i + 1}.jpg`,
        uploadedBy: 'buyer' as const,
        uploadedAt: now,
      })),
      ...(params.supportingVideos || []).map((url, i) => ({
        id: `ev_video_${Date.now()}_${i}`,
        type: 'video' as const,
        url,
        name: `buyer_evidence_video_${i + 1}.mp4`,
        uploadedBy: 'buyer' as const,
        uploadedAt: now,
      })),
    ];

    const newCase: DisputeCase = {
      id: disputeId,
      orderId: params.orderId,
      transactionId: params.transactionId,
      productId: params.productId,
      productTitle: params.productTitle,
      productImage: params.productImage,
      agreedPrice: params.agreedPrice,
      currency: params.currency || 'INR',
      buyerId: params.buyerId,
      buyerName: params.buyerName,
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      reason: params.reason,
      reasonLabel,
      detailedExplanation: params.detailedExplanation,
      dateRaised: now,
      buyerEvidence: evidenceItems,
      currentStatus: 'awaiting_seller_response',
      resolutionTimeline: [
        {
          id: `tl_${Date.now()}_1`,
          status: 'open',
          actor: 'buyer',
          actorName: params.buyerName,
          timestamp: now,
          title: 'Problem Reported by Buyer',
          description: `Dispute opened for reason: ${reasonLabel}. Seller settlement immediately frozen in ONTRA escrow vault.`,
          actionRequiredFrom: 'seller',
        },
        {
          id: `tl_${Date.now()}_2`,
          status: 'awaiting_seller_response',
          actor: 'system',
          actorName: 'ONTRA Arbitrator Desk',
          timestamp: now,
          title: 'Awaiting Seller Response',
          description: `Seller ${params.sellerName} notified to review buyer evidence and submit an official response within 24 hours.`,
          actionRequiredFrom: 'seller',
        },
      ],
      updatedAt: now,
    };

    disputesStore = [newCase, ...disputesStore];
    return createApiResponse(newCase, 'Dispute raised. Escrow payout held.');
  },

  /**
   * Seller submits official statement & evidence response (Section B)
   */
  async submitSellerResponse(
    disputeId: string,
    statement: string,
    supportingEvidenceUrls: string[] = []
  ): Promise<ApiResponse<DisputeCase>> {
    if (!USE_MOCK_API) {
      return apiClient.post<DisputeCase>(`/disputes/${disputeId}/seller-response`, {
        statement,
        supportingEvidenceUrls,
      });
    }

    await simulateNetworkDelay(250);

    const dispute = disputesStore.find((d) => d.id === disputeId);
    if (!dispute) throw new Error('Dispute case not found');

    const now = new Date().toISOString();
    const sellerEvidenceItems: DisputeEvidenceMedia[] = supportingEvidenceUrls.map((url, i) => ({
      id: `ev_seller_${Date.now()}_${i}`,
      type: 'photo' as const,
      url,
      name: `seller_counter_evidence_${i + 1}.jpg`,
      uploadedBy: 'seller' as const,
      uploadedAt: now,
    }));

    dispute.sellerResponse = {
      respondedAt: now,
      statement,
      evidence: sellerEvidenceItems,
    };

    dispute.currentStatus = 'under_admin_review';
    dispute.resolutionTimeline.push({
      id: `tl_${Date.now()}`,
      status: 'under_admin_review',
      actor: 'seller',
      actorName: dispute.sellerName,
      timestamp: now,
      title: 'Seller Response Submitted',
      description: 'Seller submitted statement and counter-evidence. Case now under neutral arbitrator review.',
      actionRequiredFrom: 'admin',
    });
    dispute.updatedAt = now;

    return createApiResponse(dispute, 'Seller response recorded. Assigned to senior compliance arbitrator.');
  },

  /**
   * Neutral Admin Arbitrator records decision (Section D)
   */
  async submitAdminDecision(
    disputeId: string,
    params: {
      decision: AdminDecisionType;
      reasoning: string;
      arbitratorName: string;
      refundAmount?: number;
    }
  ): Promise<ApiResponse<{ dispute: DisputeCase; refund?: RefundRecord }>> {
    if (!USE_MOCK_API) {
      return apiClient.post<{ dispute: DisputeCase; refund?: RefundRecord }>(`/disputes/${disputeId}/admin-decision`, params);
    }

    await simulateNetworkDelay(300);

    const dispute = disputesStore.find((d) => d.id === disputeId);
    if (!dispute) throw new Error('Dispute case not found');

    const now = new Date().toISOString();
    let refundRecord: RefundRecord | undefined;

    dispute.adminDecision = {
      decision: params.decision,
      decidedAt: now,
      arbitratorName: params.arbitratorName || 'Priya Nair (Senior Arbitrator)',
      reasoning: params.reasoning,
      refundAmount: params.refundAmount,
    };

    if (params.decision === 'request_more_evidence') {
      dispute.currentStatus = 'additional_evidence_required';
      dispute.resolutionTimeline.push({
        id: `tl_${Date.now()}`,
        status: 'additional_evidence_required',
        actor: 'admin',
        actorName: params.arbitratorName,
        timestamp: now,
        title: 'Additional Documentation Requested',
        description: `Arbitrator requested further evidence: "${params.reasoning}"`,
        actionRequiredFrom: 'buyer',
      });
    } else if (
      params.decision === 'approve_full_refund' ||
      params.decision === 'approve_partial_refund' ||
      params.decision === 'authorize_return_and_refund'
    ) {
      dispute.currentStatus = 'resolved';
      const refundAmt = params.refundAmount || dispute.agreedPrice;

      // Create new refund entry
      const refId = `ONTRA-REF-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const newRefund: RefundRecord = {
        id: `ref_${Date.now()}`,
        refundReference: refId,
        orderId: dispute.orderId,
        transactionId: dispute.transactionId,
        disputeId: dispute.id,
        productTitle: dispute.productTitle,
        productImage: dispute.productImage,
        buyerName: dispute.buyerName,
        originalPayment: dispute.agreedPrice,
        refundAmount: refundAmt,
        refundReason: `Arbitration Resolution: ${params.reasoning}`,
        status: 'processing',
        paymentMethodUsed: 'UPI / Original Payment Method',
        timeline: [
          {
            stage: 'Arbitrator Resolution Approved',
            timestamp: formatDateTimeIST(now),
            note: `Neutral arbitrator approved ${params.decision === 'approve_full_refund' ? '100% full' : 'partial'} refund of ${formatCurrency(refundAmt)}.`,
            completed: true,
          },
          {
            stage: 'Payment Provider Reversal Initiated',
            timestamp: formatDateTimeIST(new Date(Date.now() + 60000).toISOString()),
            note: 'Payment partner gateway scheduled INR reversal to original UPI/Card/Bank account.',
            completed: true,
          },
        ],
        createdAt: now,
      };

      refundRecord = newRefund;
      refundsStore = [newRefund, ...refundsStore];

      dispute.resolutionTimeline.push({
        id: `tl_${Date.now()}`,
        status: 'resolved',
        actor: 'admin',
        actorName: params.arbitratorName,
        timestamp: now,
        title: `Dispute Resolved: ${params.decision.replace(/_/g, ' ').toUpperCase()}`,
        description: `Arbitrator authorized refund of ${formatCurrency(refundAmt)}. Ref: ${refId}. Reason: "${params.reasoning}"`,
      });
    } else if (params.decision === 'approve_seller_settlement') {
      dispute.currentStatus = 'resolved';
      dispute.resolutionTimeline.push({
        id: `tl_${Date.now()}`,
        status: 'resolved',
        actor: 'admin',
        actorName: params.arbitratorName,
        timestamp: now,
        title: 'Dispute Dismissed · Seller Settlement Released',
        description: `Arbitrator concluded seller manifest is accurate. Settlement payout released to ${dispute.sellerName}. Reason: "${params.reasoning}"`,
      });
    }

    dispute.updatedAt = now;
    return createApiResponse({ dispute, refund: refundRecord }, 'Arbitrator order executed.');
  },

  /**
   * Fetch all refund records (Section E)
   */
  async getRefunds(orderId?: string): Promise<ApiResponse<RefundRecord[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<RefundRecord[]>('/refunds', orderId ? { orderId } : undefined);
    }

    await simulateNetworkDelay(100);
    if (!orderId) {
      return createApiResponse(refundsStore);
    }
    const filtered = refundsStore.filter((r) => r.orderId === orderId || r.transactionId === orderId);
    return createApiResponse(filtered.length > 0 ? filtered : refundsStore);
  },

  /**
   * Fetch single refund by reference / ID
   */
  async getRefundById(refundId: string): Promise<ApiResponse<RefundRecord | null>> {
    if (!USE_MOCK_API) {
      return apiClient.get<RefundRecord | null>(`/refunds/${refundId}`);
    }

    await simulateNetworkDelay(80);
    const found = refundsStore.find((r) => r.id === refundId || r.refundReference === refundId || r.orderId === refundId) || null;
    return createApiResponse(found);
  },

  /**
   * Fetch reviews (Section G)
   */
  async getReviews(sellerId?: string): Promise<ApiResponse<ReviewRecord[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<ReviewRecord[]>('/reviews', sellerId ? { sellerId } : undefined);
    }

    await simulateNetworkDelay(80);
    if (!sellerId) return createApiResponse(reviewsStore);
    const filtered = reviewsStore.filter((r) => r.sellerId === sellerId);
    return createApiResponse(filtered.length > 0 ? filtered : reviewsStore);
  },

  /**
   * Submit a verified review for completed transaction
   */
  async createReview(params: {
    transactionId: string;
    orderId: string;
    productId: string;
    productTitle: string;
    productImage: string;
    sellerId: string;
    sellerName: string;
    buyerId: string;
    buyerName: string;
    rating: number;
    comment: string;
    deliveryRating?: 'fast' | 'on_time' | 'delayed';
    itemAccuracyRating?: 'exact' | 'better_than_expected' | 'minor_difference';
  }): Promise<ApiResponse<ReviewRecord>> {
    if (!USE_MOCK_API) {
      return apiClient.post<ReviewRecord>('/reviews', params);
    }

    await simulateNetworkDelay(200);

    const newRev: ReviewRecord = {
      id: `rev_${Date.now()}`,
      transactionId: params.transactionId,
      orderId: params.orderId,
      productId: params.productId,
      productTitle: params.productTitle,
      productImage: params.productImage,
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      buyerId: params.buyerId,
      buyerName: params.buyerName,
      rating: params.rating,
      comment: params.comment,
      isVerifiedPurchase: true,
      deliveryRating: params.deliveryRating,
      itemAccuracyRating: params.itemAccuracyRating,
      createdAt: new Date().toISOString(),
    };

    reviewsStore = [newRev, ...reviewsStore];
    return createApiResponse(newRev, 'Review published with Verified Buyer badge.');
  },
};
