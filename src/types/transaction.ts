/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionStage = 
  | 'order_placed'
  | 'payment_verified'
  | 'seller_processing'
  | 'dispatched_or_arranged'
  | 'in_transit'
  | 'delivered_or_handover'
  | 'inspection_in_progress'
  | 'buyer_confirmed_satisfaction'
  | 'seller_settlement_initiated'
  | 'evidence_submitted'
  | 'offer_negotiation'
  | 'escrow_funded'
  | 'insured_shipping'
  | 'buyer_inspection'
  | 'payout_released'
  | 'dispute_raised';

export interface Offer {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  offeredAmount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'countered' | 'declined' | 'expired';
  counterAmount?: number;
  createdAt: string;
}

export interface EscrowPayment {
  id: string;
  transactionId: string;
  amount: number;
  escrowFee: number;
  insuredShippingFee: number;
  totalCharged: number;
  paymentMethod: 'upi' | 'debit_card' | 'credit_card' | 'net_banking' | 'card' | 'bank_wire' | 'escrow_balance';
  heldInEscrowAt: string;
  releasedAt?: string;
  status: 'holding' | 'released_to_seller' | 'refunded_to_buyer';
}

export type CourierTrackingStep = 
  | 'pickup_scheduled'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered';

export interface CourierLogEntry {
  step: CourierTrackingStep;
  title: string;
  timestamp: string;
  location: string;
  description: string;
}

export interface ShippingDetails {
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  insuredValue: number;
  pickupDate?: string;
  dispatchedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  courierStep?: CourierTrackingStep;
  recipientSignatureName?: string;
  logs?: CourierLogEntry[];
}

export interface InspectionDetails {
  inspectionWindowHours: number;
  deliveredAt: string;
  windowExpiresAt: string;
  status: 'pending' | 'buyer_approved' | 'disputed' | 'auto_approved_expired';
  buyerNotes?: string;
  completedAt?: string;
}

export interface DisputeDetails {
  id: string;
  raisedBy: 'buyer' | 'seller';
  reason: 'item_not_as_described' | 'damage_in_transit' | 'counterfeit_concern' | 'missing_accessories';
  description: string;
  evidencePhotoUrls: string[];
  status: 'under_admin_review' | 'resolved_refund' | 'resolved_seller_paid' | 'partial_settlement';
  adminNotes?: string;
  openedAt: string;
  resolvedAt?: string;
}

export interface OrderDeliveryAddress {
  fullName: string;
  houseFlat?: string;
  streetAddress: string;
  area?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderHandoverDetails {
  locationName: string;
  scheduledDate: string;
  otpCode: string;
  instructions: string;
  otpExpiresAt?: string;
  otpStatus?: 'active' | 'used' | 'expired';
  buyerConfirmed?: boolean;
  sellerConfirmed?: boolean;
  handoverCompletedAt?: string;
}

export interface Transaction {
  id: string;
  orderId?: string;
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
  originalListingPrice?: number;
  agreedPrice: number;
  deliveryCharge?: number;
  platformFee?: number;
  totalAmountPayable?: number;
  deliveryMethod?: 'courier' | 'direct_handover';
  deliveryAddress?: OrderDeliveryAddress;
  handoverDetails?: OrderHandoverDetails;
  currentStage: TransactionStage;
  timeline: {
    stage: TransactionStage;
    timestamp: string;
    description: string;
    completed?: boolean;
    current?: boolean;
  }[];
  payment: EscrowPayment;
  paymentDetails?: {
    provider: string;
    demoReference: string;
    status: 'pending' | 'processing' | 'verified' | 'failed';
    paidAt?: string;
    isSimulated: boolean;
  };
  shipping?: ShippingDetails;
  inspection?: InspectionDetails;
  dispute?: DisputeDetails;
  updatedAt: string;
}
