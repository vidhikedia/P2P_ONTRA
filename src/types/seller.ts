/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SellerDashboardTab = 
  | 'overview'
  | 'listings'
  | 'add_product'
  | 'offers'
  | 'messages'
  | 'orders'
  | 'delivery'
  | 'disputes'
  | 'payouts'
  | 'history'
  | 'reviews'
  | 'notifications'
  | 'settings';

export interface SellerOffer {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  askingPrice: number;
  offeredAmount: number;
  buyerId: string;
  buyerName: string;
  buyerRating: number;
  buyerCompletedTrades: number;
  buyerLocation: string;
  message: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  counterAmount?: number;
  deliveryPreference: 'courier' | 'direct_handover';
}

export interface SellerActivity {
  id: string;
  type: 'offer_received' | 'order_funded' | 'inspection_started' | 'payout_settled' | 'message_received' | 'listing_published';
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
  statusTag?: string;
}

export interface SellerOrder {
  id: string;
  transactionId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  buyerId: string;
  buyerName: string;
  buyerLocation: string;
  deliveryMethod: 'courier' | 'direct_handover';
  escrowStatus: 'held_in_vault' | 'payout_released' | 'refunded';
  orderStatus: 'payment_confirmed' | 'ready_to_ship' | 'in_transit' | 'under_inspection' | 'completed';
  createdAt: string;
  trackingNumber?: string;
  carrier?: string;
  handoverOtpRequired?: boolean;
  inspectionDeadline?: string;
}

export interface SellerPayoutRecord {
  id: string;
  transactionId: string;
  itemTitle: string;
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  destinationAccount: string; // e.g. "SEB Bank •••• 4910"
  status: 'pending_inspection' | 'scheduled' | 'settled';
  clearedAt?: string;
  estimatedRelease?: string;
}
