/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AdminTab =
  | 'overview'
  | 'users'
  | 'verification'
  | 'products'
  | 'orders'
  | 'payments'
  | 'settlements'
  | 'disputes'
  | 'refunds'
  | 'reviews'
  | 'reports'
  | 'categories'
  | 'fees'
  | 'audit'
  | 'settings';

export interface AdminOverviewMetrics {
  totalUsers: number;
  buyersCount: number;
  sellersCount: number;
  activeListings: number;
  totalOrders: number;
  completedTransactions: number;
  pendingSettlements: number;
  openDisputes: number;
  refundedTransactions: number;
  platformRevenue: number;
  escrowHolding: number;
  inspectionApprovalRate: number;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: 'buyer' | 'seller' | 'admin';
  status: 'active' | 'suspended' | 'restricted';
  identityStatus: 'verified' | 'pending' | 'unverified';
  phoneStatus: 'verified' | 'unverified';
  bankStatus: 'verified' | 'pending' | 'unverified';
  trustScore: number;
  totalTransactions: number;
  disputesInvolved: number;
  joinedDate: string;
  lastActive: string;
  suspensionReason?: string;
  notes?: string;
}

export interface AdminVerificationRecord {
  id: string;
  sellerId: string;
  sellerName: string;
  email: string;
  phone: string;
  businessType: 'individual' | 'registered_business';
  idType: 'passport' | 'drivers_license' | 'national_id';
  idDocNumber: string;
  idDocumentUrl: string;
  selfieWithIdUrl: string;
  bankProofUrl: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface AdminProductModerationItem {
  id: string;
  title: string;
  category: string;
  sellerName: string;
  sellerId: string;
  askingPrice: number;
  originalPrice?: number;
  condition: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'flagged' | 'rejected';
  reportsCount: number;
  reportReasons: string[];
  photos: string[];
  videoUrl?: string;
  serialNumber: string;
  serialVerified: boolean;
  authenticityGuaranteed: boolean;
  description: string;
  moderationNotes?: string;
}

export interface AdminPaymentRecord {
  id: string;
  paymentReference: string;
  orderId: string;
  productTitle: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  platformFee: number;
  netSellerAmount: number;
  paymentMethod: string;
  paymentStatus: 'completed' | 'processing' | 'refunded' | 'held_in_escrow';
  settlementStatus: 'held' | 'released' | 'refunded' | 'frozen_in_dispute';
  refundStatus: 'none' | 'pending' | 'completed' | 'partial';
  timestamp: string;
}

export interface AdminSettlementRecord {
  id: string;
  settlementReference: string;
  orderId: string;
  sellerName: string;
  sellerBank: string;
  amount: number;
  feeDeducted: number;
  netPayout: number;
  scheduledDate: string;
  status: 'scheduled' | 'released' | 'frozen_by_dispute' | 'cancelled';
  inspectionWindowEnded: boolean;
  settlementTrigger: 'buyer_satisfaction' | 'timer_expiration' | 'admin_override';
}

export interface AdminAuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  category: 'user_management' | 'listing_moderation' | 'arbitration' | 'payout_override' | 'fee_configuration' | 'system';
  targetId: string;
  targetType: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface AdminReportItem {
  id: string;
  reporterName: string;
  reporterRole: 'buyer' | 'seller';
  reportedItemType: 'listing' | 'user' | 'message';
  reportedItemId: string;
  reportedItemTitle: string;
  reason: string;
  details: string;
  status: 'open' | 'investigating' | 'action_taken' | 'dismissed';
  date: string;
  actionTakenNotes?: string;
}

export interface PlatformFeeConfig {
  buyerProtectionFeePercent: number;
  sellerCommissionPercent: number;
  minProtectionFee: number;
  maxProtectionFee: number;
  inspectionWindowHours: number;
  returnWindowHours: number;
  paymentGatewayPartner: string;
  payoutScheduleDays: number;
  autoSettlementTimerHours: number;
  strictSerialVerification: boolean;
}

export interface CategoryManagementItem {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  subcategories: string[];
  activeListingsCount: number;
  isLocked: boolean;
  minEvidenceRequirements: string[];
}
