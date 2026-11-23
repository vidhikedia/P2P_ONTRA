/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, ApiResponse, TransactionStage, OrderDeliveryAddress, OrderHandoverDetails } from '../types/index.ts';
import { MOCK_ACTIVE_TRANSACTIONS } from '../data/mockData.ts';
import { apiClient, USE_MOCK_API, simulateNetworkDelay, createApiResponse } from './apiClient.ts';


// 9 Visual Order Timeline Stage Definitions
export const ORDER_TIMELINE_STAGES: {
  stage: TransactionStage;
  label: string;
  courierDescription: string;
  handoverDescription: string;
}[] = [
  {
    stage: 'order_placed',
    label: 'Order Placed',
    courierDescription: 'Order initialized and checkout terms confirmed by buyer.',
    handoverDescription: 'Order initialized with direct physical handover request.',
  },
  {
    stage: 'payment_verified',
    label: 'Payment Verified',
    courierDescription: 'Payment processed through the payment provider. Funds held for inspection.',
    handoverDescription: 'Payment processed through the payment provider. Funds held for inspection.',
  },
  {
    stage: 'seller_processing',
    label: 'Seller Processing',
    courierDescription: 'Seller is packaging item in tamper-evident carton and printing insured label.',
    handoverDescription: 'Seller is preparing item manifest and packaging for in-person exchange.',
  },
  {
    stage: 'dispatched_or_arranged',
    label: 'Dispatched / Handover Arranged',
    courierDescription: 'Parcel handed over to insured Indian courier (Shiprocket-compatible airwaybill) with declared value protection.',
    handoverDescription: 'Meeting location and time coordinated in platform contract chat.',
  },
  {
    stage: 'in_transit',
    label: 'In Transit',
    courierDescription: 'Parcels scanned through regional carrier logistics distribution hub.',
    handoverDescription: 'Both parties traveling to verified public exchange location.',
  },
  {
    stage: 'delivered_or_handover',
    label: 'Delivered / Handed Over',
    courierDescription: 'Doorstep signature recorded upon physical delivery to recipient.',
    handoverDescription: 'Physical handover authenticated using buyer 6-digit OTP code.',
  },
  {
    stage: 'inspection_in_progress',
    label: 'Inspection in Progress',
    courierDescription: '48-hour hands-on buyer inspection window active.',
    handoverDescription: '48-hour hands-on buyer inspection window active.',
  },
  {
    stage: 'buyer_confirmed_satisfaction',
    label: 'Buyer Confirmed Satisfaction',
    courierDescription: 'Buyer verified condition against seller manifest and approved item.',
    handoverDescription: 'Buyer verified condition against seller manifest and approved item.',
  },
  {
    stage: 'seller_settlement_initiated',
    label: 'Seller Settlement Initiated',
    courierDescription: 'Payment provider initiated bank transfer to seller account.',
    handoverDescription: 'Payment provider initiated bank transfer to seller account.',
  },
];

let transactionsStore: Transaction[] = [...MOCK_ACTIVE_TRANSACTIONS];

export const transactionService = {
  /**
   * Fetch transactions for the active user context
   */
  async getTransactions(userId?: string): Promise<ApiResponse<Transaction[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<Transaction[]>('/orders', userId ? { userId } : undefined);
    }

    await simulateNetworkDelay(100);
    if (!userId) {
      return createApiResponse(transactionsStore);
    }
    const filtered = transactionsStore.filter(
      (tx) => tx.buyerId === userId || tx.sellerId === userId
    );
    return createApiResponse(filtered.length > 0 ? filtered : transactionsStore);
  },

  /**
   * Get single transaction / order details by transaction ID or orderId
   */
  async getTransactionById(id: string): Promise<ApiResponse<Transaction | null>> {
    if (!USE_MOCK_API) {
      return apiClient.get<Transaction | null>(`/orders/${id}`);
    }

    await simulateNetworkDelay(70);
    const found = transactionsStore.find((t) => t.id === id || t.orderId === id) || null;
    return createApiResponse(found);
  },

  /**
   * Initialize a new pending checkout order
   */
  async createCheckoutOrder(params: {
    productId: string;
    productTitle: string;
    productImage: string;
    buyerId: string;
    buyerName: string;
    buyerEmail?: string;
    sellerId: string;
    sellerName: string;
    sellerLocation?: string;
    sellerTrustScore?: number;
    sellerRating?: number;
    originalListingPrice: number;
    agreedPrice: number;
    deliveryCharge: number;
    platformFee: number;
    totalAmountPayable: number;
    deliveryMethod: 'courier' | 'direct_handover';
    deliveryAddress?: OrderDeliveryAddress;
    handoverDetails?: OrderHandoverDetails;
  }): Promise<ApiResponse<Transaction>> {
    if (!USE_MOCK_API) {
      return apiClient.post<Transaction>('/orders', params);
    }

    await simulateNetworkDelay(200);

    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const txId = `tx_${orderId.toLowerCase()}`;
    const now = new Date().toISOString();

    const newOrder: Transaction = {
      id: txId,
      orderId,
      productId: params.productId,
      productTitle: params.productTitle,
      productImage: params.productImage,
      buyerId: params.buyerId,
      buyerName: params.buyerName,
      buyerEmail: params.buyerEmail || 'ananya.sharma@ontra.in',
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      sellerLocation: params.sellerLocation || 'Bengaluru, Karnataka',
      sellerTrustScore: params.sellerTrustScore || 99,
      sellerRating: params.sellerRating || 4.95,
      originalListingPrice: params.originalListingPrice,
      agreedPrice: params.agreedPrice,
      deliveryCharge: params.deliveryCharge,
      platformFee: params.platformFee,
      totalAmountPayable: params.totalAmountPayable,
      deliveryMethod: params.deliveryMethod,
      deliveryAddress: params.deliveryAddress,
      handoverDetails: params.handoverDetails,
      currentStage: 'order_placed',
      timeline: [
        {
          stage: 'order_placed',
          timestamp: now,
          description: 'Order placed by buyer. Proceeding to simulated payment gateway.',
          completed: true,
          current: true,
        },
      ],
      payment: {
        id: `pay_${Date.now()}`,
        transactionId: txId,
        amount: params.agreedPrice,
        escrowFee: params.platformFee,
        insuredShippingFee: params.deliveryCharge,
        totalCharged: params.totalAmountPayable,
        paymentMethod: 'upi',
        heldInEscrowAt: now,
        status: 'holding',
      },
      paymentDetails: {
        provider: 'ONTRA Payment Gateway (Razorpay / Cashfree Compatible Sandbox)',
        demoReference: `ONTRA-DEMO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'pending',
        isSimulated: true,
      },
      updatedAt: now,
    };

    transactionsStore = [newOrder, ...transactionsStore];
    return createApiResponse(newOrder, 'Checkout order initialized.');
  },

  /**
   * Process simulated payment through payment provider sandbox
   */
  async processSimulatedPayment(
    orderIdOrTxId: string,
    options?: {
      shouldFail?: boolean;
      paymentMethod?: 'upi' | 'debit_card' | 'credit_card' | 'net_banking' | 'card' | 'bank_wire';
    }
  ): Promise<ApiResponse<Transaction>> {
    if (!USE_MOCK_API) {
      return apiClient.post<Transaction>(`/orders/${orderIdOrTxId}/payments`, options);
    }

    await simulateNetworkDelay(400);

    const tx = transactionsStore.find((t) => t.id === orderIdOrTxId || t.orderId === orderIdOrTxId);
    if (!tx) throw new Error('Order not found');

    if (options?.shouldFail) {
      if (tx.paymentDetails) {
        tx.paymentDetails.status = 'failed';
      }
      return createApiResponse(tx, 'Payment authorization declined by provider sandbox.');
    }

    const now = new Date().toISOString();
    const demoRef = `ONTRA-DEMO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    tx.currentStage = 'payment_verified';
    tx.paymentDetails = {
      provider: 'ONTRA Escrow Payment Sandbox (UPI / Cards / Net Banking)',
      demoReference: demoRef,
      status: 'verified',
      paidAt: now,
      isSimulated: true,
    };
    tx.payment.heldInEscrowAt = now;
    tx.payment.paymentMethod = options?.paymentMethod || 'upi';

    // Add payment verified stage to timeline
    tx.timeline = [
      {
        stage: 'order_placed',
        timestamp: tx.timeline[0]?.timestamp || now,
        description: 'Order placed by buyer with verified price and fulfillment terms.',
        completed: true,
      },
      {
        stage: 'payment_verified',
        timestamp: now,
        description: `Payment verified via simulated provider gateway. Reference: ${demoRef}. Funds held for 48h physical inspection.`,
        completed: true,
        current: true,
      },
      {
        stage: 'seller_processing',
        timestamp: new Date(Date.now() + 1800000).toISOString(),
        description: 'Seller notified to inspect package seals and prepare dispatch.',
        completed: false,
      },
    ];

    tx.updatedAt = now;
    return createApiResponse(tx, 'Payment verified successfully in demo gateway.');
  },

  /**
   * Advance order stage (controlled by backend in production)
   */
  async advanceOrderStage(
    orderIdOrTxId: string,
    targetStage: TransactionStage,
    details?: { trackingNumber?: string; carrier?: string; notes?: string }
  ): Promise<ApiResponse<Transaction>> {
    if (!USE_MOCK_API) {
      return apiClient.post<Transaction>(`/orders/${orderIdOrTxId}/transition`, {
        targetStage,
        ...details,
      });
    }

    await simulateNetworkDelay(200);

    const tx = transactionsStore.find((t) => t.id === orderIdOrTxId || t.orderId === orderIdOrTxId);
    if (!tx) throw new Error('Order not found');

    const now = new Date().toISOString();
    tx.currentStage = targetStage;

    if (targetStage === 'inspection_in_progress') {
      tx.inspection = {
        inspectionWindowHours: 48,
        deliveredAt: now,
        windowExpiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        status: 'pending',
      };
    } else if (targetStage === 'buyer_confirmed_satisfaction') {
      if (tx.inspection) tx.inspection.status = 'buyer_approved';
    } else if (targetStage === 'seller_settlement_initiated') {
      tx.payment.status = 'released_to_seller';
      tx.payment.releasedAt = now;
    }

    if (details?.trackingNumber) {
      tx.shipping = {
        carrier: details.carrier || 'Blue Dart Air Express (Insured)',
        trackingNumber: details.trackingNumber,
        insuredValue: tx.agreedPrice,
        dispatchedAt: now,
      };
    }

    tx.timeline.push({
      stage: targetStage,
      timestamp: now,
      description: details?.notes || `Order progressed to stage: ${targetStage.replace(/_/g, ' ')}.`,
      completed: true,
      current: true,
    });

    tx.updatedAt = now;
    return createApiResponse(tx, `Order stage updated to ${targetStage}`);
  },

  /**
   * Buyer approves condition during inspection -> Initiates seller settlement
   */
  async approveInspection(transactionId: string, notes?: string): Promise<ApiResponse<Transaction>> {
    if (!USE_MOCK_API) {
      return apiClient.post<Transaction>(`/orders/${transactionId}/inspection/approve`, { notes });
    }

    await simulateNetworkDelay(250);
    const tx = transactionsStore.find((t) => t.id === transactionId || t.orderId === transactionId);
    if (!tx) throw new Error('Transaction not found');

    const now = new Date().toISOString();
    tx.currentStage = 'seller_settlement_initiated';
    if (tx.inspection) {
      tx.inspection.status = 'buyer_approved';
      tx.inspection.buyerNotes = notes || 'Inspection approved by buyer without condition defects.';
    }
    tx.payment.status = 'released_to_seller';
    tx.payment.releasedAt = now;

    tx.timeline.push({
      stage: 'buyer_confirmed_satisfaction',
      timestamp: now,
      description: 'Buyer approved physical inspection. Condition and serial confirmed.',
      completed: true,
    });
    tx.timeline.push({
      stage: 'seller_settlement_initiated',
      timestamp: now,
      description: 'Platform payment provider initiated bank settlement to seller.',
      completed: true,
      current: true,
    });

    tx.updatedAt = now;
    return createApiResponse(tx, 'Satisfaction confirmed. Seller settlement initiated.');
  },

  /**
   * Buyer reports a condition discrepancy or damage -> Halts payout and opens Admin review
   */
  async raiseDispute(
    transactionId: string,
    reason: 'item_not_as_described' | 'damage_in_transit' | 'counterfeit_concern' | 'missing_accessories',
    description: string,
    evidenceUrls: string[] = []
  ): Promise<ApiResponse<Transaction>> {
    if (!USE_MOCK_API) {
      return apiClient.post<Transaction>(`/orders/${transactionId}/dispute`, {
        reason,
        description,
        evidencePhotoUrls: evidenceUrls,
      });
    }

    await simulateNetworkDelay(300);
    const tx = transactionsStore.find((t) => t.id === transactionId || t.orderId === transactionId);
    if (!tx) throw new Error('Transaction not found');

    const now = new Date().toISOString();
    tx.currentStage = 'dispute_raised';
    tx.dispute = {
      id: `disp_${Date.now()}`,
      raisedBy: 'buyer',
      reason,
      description,
      evidencePhotoUrls: evidenceUrls,
      status: 'under_admin_review',
      openedAt: now,
    };
    tx.timeline.push({
      stage: 'dispute_raised',
      timestamp: now,
      description: `Dispute opened: ${reason.replace(/_/g, ' ')}. Seller settlement paused pending neutral arbitrator review.`,
      completed: true,
      current: true,
    });
    tx.updatedAt = now;

    return createApiResponse(tx, 'Dispute filed. Seller settlement paused. An ONTRA certified arbitrator will review within 24h.');
  },

  /**
   * Update courier tracking step (Simulated courier webhook/API updates)
   */
  async updateCourierProgress(
    orderIdOrTxId: string,
    step: 'pickup_scheduled' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered',
    details?: { location?: string; note?: string; carrier?: string; trackingNumber?: string }
  ): Promise<ApiResponse<Transaction>> {
    if (!USE_MOCK_API) {
      return apiClient.post<Transaction>(`/orders/${orderIdOrTxId}/shipping/progress`, {
        step,
        ...details,
      });
    }

    await simulateNetworkDelay(200);
    const tx = transactionsStore.find((t) => t.id === orderIdOrTxId || t.orderId === orderIdOrTxId);
    if (!tx) throw new Error('Order not found');

    const now = new Date().toISOString();
    if (!tx.shipping) {
      tx.shipping = {
        carrier: details?.carrier || 'Blue Dart Air Express (Insured)',
        trackingNumber: details?.trackingNumber || 'BD-924180-BLR-JAI',
        insuredValue: tx.agreedPrice,
        pickupDate: now,
      };
    }

    tx.shipping.courierStep = step;
    if (!tx.shipping.logs) tx.shipping.logs = [];

    const stepTitles: Record<string, string> = {
      pickup_scheduled: 'Courier Pickup Scheduled (Shiprocket Workflow)',
      picked_up: 'Shipment Picked Up by Courier',
      in_transit: 'In Transit via Regional Hub',
      out_for_delivery: 'Out for Courier Delivery',
      delivered: 'Delivered with Verified Recipient OTP / Signature',
    };

    tx.shipping.logs.push({
      step,
      title: stepTitles[step] || step,
      timestamp: now,
      location: details?.location || 'Jaipur Regional Logistics Hub, Rajasthan',
      description: details?.note || `Parcel status advanced to: ${step.replace(/_/g, ' ')}.`,
    });

    if (step === 'delivered') {
      tx.shipping.deliveredAt = now;
      tx.shipping.recipientSignatureName = tx.buyerName;
      tx.currentStage = 'inspection_in_progress';
      tx.inspection = {
        inspectionWindowHours: 48,
        deliveredAt: now,
        windowExpiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        status: 'pending',
      };
      tx.timeline.push({
        stage: 'delivered_or_handover',
        timestamp: now,
        description: `Delivered by ${tx.shipping.carrier}. Recipient signature recorded: ${tx.buyerName}.`,
        completed: true,
      });
      tx.timeline.push({
        stage: 'inspection_in_progress',
        timestamp: now,
        description: 'Physical item received. 48-Hour Hands-On Inspection Window initiated.',
        completed: true,
        current: true,
      });
    } else if (step === 'in_transit') {
      tx.currentStage = 'in_transit';
    } else if (step === 'picked_up') {
      tx.currentStage = 'dispatched_or_arranged';
    }

    tx.updatedAt = now;
    return createApiResponse(tx, `Courier tracking updated: ${stepTitles[step]}`);
  },

  /**
   * Verify direct physical handover OTP code
   */
  async verifyHandoverOtp(
    orderIdOrTxId: string,
    enteredOtp: string,
    options?: { simulateExpired?: boolean }
  ): Promise<ApiResponse<{ verified: boolean; transaction?: Transaction; error?: string }>> {
    if (!USE_MOCK_API) {
      return apiClient.post<{ verified: boolean; transaction?: Transaction; error?: string }>(
        `/orders/${orderIdOrTxId}/handover/verify-otp`,
        { enteredOtp, ...options }
      );
    }

    await simulateNetworkDelay(250);
    const tx = transactionsStore.find((t) => t.id === orderIdOrTxId || t.orderId === orderIdOrTxId);
    if (!tx) throw new Error('Order not found');

    if (options?.simulateExpired) {
      return createApiResponse(
        { verified: false, error: 'Handover OTP has expired (15-minute validity window elapsed). Please request the buyer to generate a fresh OTP code.' },
        'OTP Expired'
      );
    }

    const correctOtp = tx.handoverDetails?.otpCode?.trim() || '582904';
    const cleanEntered = enteredOtp.replace(/\D/g, '').trim();
    const cleanExpected = correctOtp.replace(/\D/g, '').trim();

    if (cleanEntered !== cleanExpected && cleanEntered !== '582904' && cleanEntered !== '839201') {
      return createApiResponse(
        { verified: false, error: 'Invalid verification code. Please confirm the 6-digit code currently visible on the buyer\'s screen.' },
        'Invalid OTP'
      );
    }

    const now = new Date().toISOString();
    if (!tx.handoverDetails) {
      tx.handoverDetails = {
        locationName: 'Designated Meeting Location',
        scheduledDate: now,
        otpCode: cleanEntered,
        instructions: 'Public exchange point',
      };
    }

    tx.handoverDetails.otpStatus = 'used';
    tx.handoverDetails.buyerConfirmed = true;
    tx.handoverDetails.sellerConfirmed = true;
    tx.handoverDetails.handoverCompletedAt = now;
    tx.currentStage = 'inspection_in_progress';
    tx.inspection = {
      inspectionWindowHours: 48,
      deliveredAt: now,
      windowExpiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      status: 'pending',
    };

    tx.timeline.push({
      stage: 'delivered_or_handover',
      timestamp: now,
      description: 'Physical exchange authenticated in person with 6-digit buyer OTP code.',
      completed: true,
    });
    tx.timeline.push({
      stage: 'inspection_in_progress',
      timestamp: now,
      description: 'Handover complete. 48-Hour Hands-On Inspection Window active.',
      completed: true,
      current: true,
    });

    tx.updatedAt = now;
    return createApiResponse({ verified: true, transaction: tx }, 'Handover authenticated successfully.');
  },

  /**
   * Simulate inspection window expiration without buyer dispute (triggers auto-approval)
   */
  async expireInspectionWindow(orderIdOrTxId: string): Promise<ApiResponse<Transaction>> {
    if (!USE_MOCK_API) {
      return apiClient.post<Transaction>(`/orders/${orderIdOrTxId}/inspection/auto-expire`);
    }

    await simulateNetworkDelay(200);
    const tx = transactionsStore.find((t) => t.id === orderIdOrTxId || t.orderId === orderIdOrTxId);
    if (!tx) throw new Error('Order not found');

    const now = new Date().toISOString();
    tx.currentStage = 'seller_settlement_initiated';
    if (tx.inspection) {
      tx.inspection.status = 'auto_approved_expired';
      tx.inspection.completedAt = now;
    }
    tx.payment.status = 'released_to_seller';
    tx.payment.releasedAt = now;

    tx.timeline.push({
      stage: 'seller_settlement_initiated',
      timestamp: now,
      description: '48-hour inspection window elapsed with zero dispute filed. Platform auto-approved settlement release to seller.',
      completed: true,
      current: true,
    });

    tx.updatedAt = now;
    return createApiResponse(tx, 'Inspection window expired. Auto-settlement initiated.');
  }
};


