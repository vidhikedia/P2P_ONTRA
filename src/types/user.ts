/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'guest' | 'buyer' | 'seller' | 'admin';

export interface TrustScore {
  score: number; // 0 to 100
  totalTransactions: number;
  successfulInspections: number;
  disputeRatePercent: number;
  identityVerified: boolean;
  memberSince: string;
}

export interface UserReview {
  id: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  itemTitle: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface CompletedTransactionSummary {
  id: string;
  itemTitle: string;
  amount: number;
  roleInTx: 'buyer' | 'seller';
  date: string;
  status: 'completed' | 'inspected_approved';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  location?: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  emailVerified?: boolean;
  mobileVerified?: boolean;
  identityVerificationStatus?: 'unverified' | 'pending' | 'verified';
  trustScore: TrustScore;
  rating?: number;
  reviewCount?: number;
  reviews?: UserReview[];
  completedTransactionsList?: CompletedTransactionSummary[];
  badges?: string[];
  unreadNotificationsCount?: number;
}
