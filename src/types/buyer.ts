/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BuyerDashboardTab = 
  | 'overview'
  | 'explore'
  | 'orders'
  | 'offers'
  | 'messages'
  | 'wishlist'
  | 'payments'
  | 'delivery'
  | 'inspection'
  | 'disputes'
  | 'history'
  | 'reviews'
  | 'notifications'
  | 'settings';

export interface BuyerNegotiationOffer {
  id: string;
  originalPrice: number;
  currentOfferAmount: number;
  counterOfferAmount?: number;
  finalAgreedPrice?: number;
  status: 'pending_seller' | 'counter_received' | 'accepted' | 'declined' | 'expired';
  history: {
    role: 'buyer' | 'seller';
    amount: number;
    timestamp: string;
    note?: string;
  }[];
  expiresAt: string;
}

export interface BuyerNegotiationThread {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerCompletedTrades: number;
  sellerTrustScore: number;
  sellerLocation: string;
  productId: string;
  productTitle: string;
  productImage: string;
  originalPrice: number;
  condition: string;
  unreadCount: number;
  lastMessageTimestamp: string;
  offer?: BuyerNegotiationOffer;
  messages: {
    id: string;
    sender: 'buyer' | 'seller' | 'system';
    text: string;
    timestamp: string;
    inquiryType?: 'photo_request' | 'video_request' | 'invoice_inquiry' | 'condition_inquiry' | 'delivery_inquiry';
  }[];
}

export interface RecentlyViewedItem {
  id: string;
  title: string;
  brand: string;
  model: string;
  askingPrice: number;
  image: string;
  condition: string;
  location: string;
  viewedAt: string;
}
