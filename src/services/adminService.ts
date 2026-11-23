/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AdminOverviewMetrics,
  AdminUserRecord,
  AdminVerificationRecord,
  AdminProductModerationItem,
  AdminPaymentRecord,
  AdminSettlementRecord,
  AdminAuditLog,
  AdminReportItem,
  PlatformFeeConfig,
  CategoryManagementItem,
  ApiResponse,
} from '../types/index.ts';
import { apiClient, USE_MOCK_API, simulateNetworkDelay, createApiResponse } from './apiClient.ts';
import { formatDateTimeIST } from '../utils/formatters.ts';

// Demo Metric Snapshot
const INITIAL_METRICS: AdminOverviewMetrics = {
  totalUsers: 14820,
  buyersCount: 11430,
  sellersCount: 3390,
  activeListings: 1842,
  totalOrders: 6514,
  completedTransactions: 6180,
  pendingSettlements: 24,
  openDisputes: 5,
  refundedTransactions: 42,
  platformRevenue: 485000,
  escrowHolding: 142500,
  inspectionApprovalRate: 97.4,
};

// Initial Demo Users
let usersStore: AdminUserRecord[] = [
  {
    id: 'usr-1',
    name: 'Siddharth Kapoor',
    email: 'siddharth.kapoor@ontra.in',
    phone: '+91 98291 23450',
    city: 'Jaipur, Rajasthan',
    role: 'seller',
    status: 'active',
    identityStatus: 'verified',
    phoneStatus: 'verified',
    bankStatus: 'verified',
    trustScore: 99,
    totalTransactions: 34,
    disputesInvolved: 0,
    joinedDate: '12/03/2024',
    lastActive: '12 mins ago',
    notes: 'Power seller in Jaipur with 100% verified serial number and invoice compliance.',
  },
  {
    id: 'usr-2',
    name: 'Kabir Malhotra',
    email: 'kabir.malhotra@gmail.com',
    phone: '+91 98112 78912',
    city: 'Gurugram, Haryana',
    role: 'buyer',
    status: 'active',
    identityStatus: 'verified',
    phoneStatus: 'verified',
    bankStatus: 'verified',
    trustScore: 96,
    totalTransactions: 12,
    disputesInvolved: 1,
    joinedDate: '18/05/2024',
    lastActive: '1 hour ago',
    notes: 'Filed one transit dispute in 2025; resolved smoothly via insured courier claim.',
  },
  {
    id: 'usr-3',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@ontra.in',
    phone: '+91 98450 77310',
    city: 'Bengaluru, Karnataka',
    role: 'seller',
    status: 'active',
    identityStatus: 'verified',
    phoneStatus: 'verified',
    bankStatus: 'verified',
    trustScore: 98,
    totalTransactions: 28,
    disputesInvolved: 0,
    joinedDate: '09/01/2024',
    lastActive: '3 hours ago',
  },
  {
    id: 'usr-4',
    name: 'Nandini Verma',
    email: 'nandini.verma@designstudio.in',
    phone: '+91 98290 90123',
    city: 'Jaipur, Rajasthan',
    role: 'seller',
    status: 'restricted',
    identityStatus: 'pending',
    phoneStatus: 'verified',
    bankStatus: 'unverified',
    trustScore: 78,
    totalTransactions: 2,
    disputesInvolved: 1,
    joinedDate: '14/02/2026',
    lastActive: 'Yesterday',
    suspensionReason: 'Bank account & IFSC verification cancelled cheque pending review.',
    notes: 'Restricted from new listings until bank account holder name matches PAN/Aadhaar KYC.',
  },
  {
    id: 'usr-5',
    name: 'QuickDeals Unverified',
    email: 'deals.fast.now@maildrop.cc',
    phone: '+91 99999 00012',
    city: 'Mumbai, Maharashtra',
    role: 'seller',
    status: 'suspended',
    identityStatus: 'unverified',
    phoneStatus: 'unverified',
    bankStatus: 'unverified',
    trustScore: 22,
    totalTransactions: 0,
    disputesInvolved: 2,
    joinedDate: '01/03/2026',
    lastActive: '3 days ago',
    suspensionReason: 'Attempted to bypass ONTRA escrow; requested direct off-platform UPI payment.',
  },
];

// Initial Seller Verifications
let verificationStore: AdminVerificationRecord[] = [
  {
    id: 'ver-101',
    sellerId: 'usr-4',
    sellerName: 'Nandini Verma',
    email: 'nandini.verma@designstudio.in',
    phone: '+91 98290 90123',
    businessType: 'individual',
    idType: 'drivers_license',
    idDocNumber: 'RJ14-20210098421',
    idDocumentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    selfieWithIdUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    bankProofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    submittedAt: '02/03/2026, 02:30 PM IST',
    status: 'pending',
    notes: 'Submitted Jaipur residential address proof with ICICI cancelled cheque.',
  },
  {
    id: 'ver-102',
    sellerId: 'usr-6',
    sellerName: 'Vikramaditya Singh',
    email: 'vikram.cycles@jaipuroutdoors.in',
    phone: '+91 98281 43287',
    businessType: 'registered_business',
    idType: 'passport',
    idDocNumber: 'PAN-ABCPV8291K',
    idDocumentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    selfieWithIdUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    bankProofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    submittedAt: '03/03/2026, 09:15 AM IST',
    status: 'pending',
    notes: 'Jaipur sports & cycling gear reseller submitting GST certificate and PAN verification.',
  },
];

// Initial Product Moderation Queue
let moderationStore: AdminProductModerationItem[] = [
  {
    id: 'prod-flag-1',
    title: 'Apple MacBook Pro 16" (M3 Max, 64GB Unified RAM, 2TB SSD)',
    category: 'Mobiles & Laptops',
    sellerName: 'Siddharth Kapoor',
    sellerId: 'usr-1',
    askingPrice: 34500,
    originalPrice: 89900,
    condition: 'Like New',
    createdAt: '01/03/2026',
    status: 'approved',
    reportsCount: 0,
    reportReasons: [],
    photos: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    serialNumber: 'C02G89A0MD6T',
    serialVerified: true,
    authenticityGuaranteed: true,
    description: 'Space Black MacBook Pro (India GST invoice) with box, 140W India charger, and AppleCare+ valid through 2027.',
  },
  {
    id: 'prod-flag-2',
    title: 'Sony Alpha A7 IV Mirrorless Camera Body + 24-70mm GM II',
    category: 'Electronics',
    sellerName: 'Rohan Mehta',
    sellerId: 'usr-3',
    askingPrice: 19500,
    originalPrice: 42000,
    condition: 'Excellent',
    createdAt: '02/03/2026',
    status: 'approved',
    reportsCount: 0,
    reportReasons: [],
    photos: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    ],
    serialNumber: 'SN-4820194-A7M4',
    serialVerified: true,
    authenticityGuaranteed: true,
    description: 'Shutter count 4,120 actuations. Sensor spotless, stored in dry cabinet in Bengaluru.',
  },
  {
    id: 'prod-flag-3',
    title: 'Sealed iPhone 16 Pro Max - ₹15,000 Below MRP (Urgent)',
    category: 'Mobiles & Laptops',
    sellerName: 'QuickDeals Unverified',
    sellerId: 'usr-5',
    askingPrice: 9999,
    originalPrice: 29900,
    condition: 'Like New',
    createdAt: '04/03/2026',
    status: 'flagged',
    reportsCount: 3,
    reportReasons: ['Unrealistic pricing', 'Stock photos only', 'Missing IMEI proof'],
    photos: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    ],
    serialNumber: 'UNKNOWN-SEALED',
    serialVerified: false,
    authenticityGuaranteed: false,
    description: 'Unopened gift, need UPI transfer immediately today. Price fixed.',
    moderationNotes: 'Listing flagged for suspected counterfeit device or off-platform advance payment scam.',
  },
];

// Initial Payment Records
let paymentStore: AdminPaymentRecord[] = [
  {
    id: 'pmt-901',
    paymentReference: 'ONTRA-PAY-2026-849102',
    orderId: 'ord-101',
    productTitle: 'Apple MacBook Pro 16" (M3 Max, 64GB RAM)',
    buyerName: 'Kabir Malhotra',
    sellerName: 'Siddharth Kapoor',
    amount: 34500,
    platformFee: 518,
    netSellerAmount: 33982,
    paymentMethod: 'UPI Collect (kabir@okicici)',
    paymentStatus: 'held_in_escrow',
    settlementStatus: 'held',
    refundStatus: 'none',
    timestamp: '04/03/2026, 10:14 AM IST',
  },
  {
    id: 'pmt-902',
    paymentReference: 'ONTRA-PAY-2026-739103',
    orderId: 'ord-102',
    productTitle: 'Sony Alpha A7 IV Mirrorless Camera Body',
    buyerName: 'Ananya Sharma',
    sellerName: 'Rohan Mehta',
    amount: 19500,
    platformFee: 293,
    netSellerAmount: 19207,
    paymentMethod: 'HDFC Net Banking (IMPS Escrow)',
    paymentStatus: 'completed',
    settlementStatus: 'released',
    refundStatus: 'none',
    timestamp: '02/03/2026, 04:45 PM IST',
  },
  {
    id: 'pmt-903',
    paymentReference: 'ONTRA-PAY-2026-629104',
    orderId: 'ord-103',
    productTitle: 'Fujifilm X-T5 Mirrorless Camera (Silver)',
    buyerName: 'Meera Krishnan',
    sellerName: 'Vikramaditya Singh',
    amount: 16500,
    platformFee: 248,
    netSellerAmount: 16252,
    paymentMethod: 'Credit Card (RuPay / Visa •••• 4242)',
    paymentStatus: 'refunded',
    settlementStatus: 'refunded',
    refundStatus: 'completed',
    timestamp: '01/03/2026, 11:20 AM IST',
  },
];

// Initial Settlements
let settlementStore: AdminSettlementRecord[] = [
  {
    id: 'stl-401',
    settlementReference: 'SETTLE-IMPS-2026-0941',
    orderId: 'ord-101',
    sellerName: 'Siddharth Kapoor',
    sellerBank: 'HDFC Bank MI Road Jaipur (•••• 8821 · IFSC HDFC0000054)',
    amount: 34500,
    feeDeducted: 518,
    netPayout: 33982,
    scheduledDate: '06/03/2026, 06:00 PM IST (Post-48h Inspection)',
    status: 'scheduled',
    inspectionWindowEnded: false,
    settlementTrigger: 'timer_expiration',
  },
  {
    id: 'stl-402',
    settlementReference: 'SETTLE-NEFT-2026-0812',
    orderId: 'ord-102',
    sellerName: 'Rohan Mehta',
    sellerBank: 'HDFC Bank Indiranagar Bengaluru (•••• 4910 · IFSC HDFC0000184)',
    amount: 19500,
    feeDeducted: 293,
    netPayout: 19207,
    scheduledDate: '03/03/2026, 10:00 AM IST',
    status: 'released',
    inspectionWindowEnded: true,
    settlementTrigger: 'buyer_satisfaction',
  },
];

// Initial Reports
let reportsStore: AdminReportItem[] = [
  {
    id: 'rep-501',
    reporterName: 'Kabir Malhotra',
    reporterRole: 'buyer',
    reportedItemType: 'listing',
    reportedItemId: 'prod-flag-3',
    reportedItemTitle: 'Sealed iPhone 16 Pro Max',
    reason: 'Suspiciously Low Price / Off-Platform UPI Request',
    details: 'Seller messaged in chat offering an extra ₹1,500 discount if paid directly via external UPI QR code outside ONTRA.',
    status: 'open',
    date: '04/03/2026, 12:45 PM IST',
  },
  {
    id: 'rep-502',
    reporterName: 'Rohan Mehta',
    reporterRole: 'seller',
    reportedItemType: 'user',
    reportedItemId: 'usr-5',
    reportedItemTitle: 'QuickDeals Unverified',
    reason: 'Off-platform Solicitation',
    details: 'Spamming seller inboxes requesting direct bank transfers.',
    status: 'investigating',
    date: '03/03/2026, 06:20 PM IST',
  },
];

// Initial Categories
let categoriesStore: CategoryManagementItem[] = [
  {
    id: 'cat-laptops',
    name: 'Laptops & Computers',
    slug: 'laptops-computers',
    iconName: 'Laptop',
    subcategories: ['MacBooks', 'Windows Ultrabooks', 'Gaming Laptops', 'Mini PCs', 'Monitors'],
    activeListingsCount: 412,
    isLocked: false,
    minEvidenceRequirements: ['Serial Number Screen', 'Battery Health Diagnostic', 'Exterior 4-Angle Photos'],
  },
  {
    id: 'cat-cameras',
    name: 'Cameras & Photography',
    slug: 'cameras-photography',
    iconName: 'Camera',
    subcategories: ['Mirrorless Bodies', 'Prime Lenses', 'Zoom Lenses', 'Gimbals', 'Studio Lighting'],
    activeListingsCount: 328,
    isLocked: false,
    minEvidenceRequirements: ['Sensor Glass Close-up', 'Shutter Count Screenshot', 'Lens Mount Condition'],
  },
  {
    id: 'cat-smartphones',
    name: 'Smartphones & Tablets',
    slug: 'smartphones-tablets',
    iconName: 'Smartphone',
    subcategories: ['iPhones', 'Android Flagships', 'iPads', 'Android Tablets', 'Smartwatches'],
    activeListingsCount: 580,
    isLocked: false,
    minEvidenceRequirements: ['IMEI / Serial Verification', 'iCloud / FRP Sign-out Screen', 'Screen Burn Test'],
  },
  {
    id: 'cat-audio',
    name: 'Audio & Hi-Fi',
    slug: 'audio-hifi',
    iconName: 'Headphones',
    subcategories: ['Audiophile Headphones', 'DACs & Amps', 'Studio Monitors', 'Turntables'],
    activeListingsCount: 260,
    isLocked: false,
    minEvidenceRequirements: ['Ear Cushion Condition', 'Driver Test Video Clip', 'Original Accessories'],
  },
  {
    id: 'cat-gaming',
    name: 'Gaming & Consoles',
    slug: 'gaming-consoles',
    iconName: 'Gamepad',
    subcategories: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch OLED', 'Handheld PCs (Steam Deck)'],
    activeListingsCount: 262,
    isLocked: false,
    minEvidenceRequirements: ['HDMI Port Close-up', 'Boot-up Video Demonstration', 'Stick Drift Calibration'],
  },
];

// Platform Fee Configuration
let feeConfigStore: PlatformFeeConfig = {
  buyerProtectionFeePercent: 1.5,
  sellerCommissionPercent: 0.0,
  minProtectionFee: 199,
  maxProtectionFee: 9999,
  inspectionWindowHours: 48,
  returnWindowHours: 72,
  paymentGatewayPartner: 'Razorpay / Cashfree Compatible Sandbox (UPI, Cards & Net Banking)',
  payoutScheduleDays: 2,
  autoSettlementTimerHours: 48,
  strictSerialVerification: true,
};

// Initial Audit Logs
let auditLogStore: AdminAuditLog[] = [
  {
    id: 'aud-801',
    adminName: 'Chief Security Officer (System)',
    adminEmail: 'security@ontra.in',
    action: 'Listing Flagged for High Risk',
    category: 'listing_moderation',
    targetId: 'prod-flag-3',
    targetType: 'listing',
    details: 'Risk engine flagged listing prod-flag-3 due to abnormal INR discount and stock imagery match.',
    timestamp: '04/03/2026, 12:46 PM IST',
    ipAddress: '10.0.12.84',
  },
  {
    id: 'aud-802',
    adminName: 'Priya Nair (Senior Arbitrator)',
    adminEmail: 'admin@ontra.in',
    action: 'Arbitration Decision Executed',
    category: 'arbitration',
    targetId: 'dsp-101',
    targetType: 'dispute',
    details: 'Approved return & INR refund authorization for order ord-101 following unboxing scratch verification.',
    timestamp: '04/03/2026, 11:32 AM IST',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'aud-803',
    adminName: 'System Engine',
    adminEmail: 'cron@ontra.in',
    action: 'Auto-Settlement Scheduled',
    category: 'payout_override',
    targetId: 'stl-401',
    targetType: 'settlement',
    details: '48-hour inspection countdown initiated for order ord-101 upon courier delivery scan in Jaipur.',
    timestamp: '04/03/2026, 10:15 AM IST',
    ipAddress: '10.0.4.1',
  },
];

export const adminService = {
  /**
   * Get Platform Overview Metrics
   */
  async getOverviewMetrics(): Promise<ApiResponse<AdminOverviewMetrics>> {
    if (!USE_MOCK_API) {
      return apiClient.get<AdminOverviewMetrics>('/admin/metrics');
    }

    await simulateNetworkDelay(100);
    return createApiResponse({ ...INITIAL_METRICS });
  },

  /**
   * User Management Methods
   */
  async getUsers(searchQuery?: string, roleFilter?: string, statusFilter?: string): Promise<ApiResponse<AdminUserRecord[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<AdminUserRecord[]>('/admin/users', {
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
      });
    }

    await simulateNetworkDelay(120);
    let list = [...usersStore];
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.city.toLowerCase().includes(q));
    }
    if (roleFilter && roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter);
    }
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((u) => u.status === statusFilter);
    }
    return createApiResponse(list);
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'restricted', reason?: string): Promise<ApiResponse<AdminUserRecord>> {
    if (!USE_MOCK_API) {
      return apiClient.patch<AdminUserRecord>(`/admin/users/${userId}/status`, { status, reason });
    }

    await simulateNetworkDelay(150);
    const index = usersStore.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');
    usersStore[index] = {
      ...usersStore[index],
      status,
      suspensionReason: reason,
      lastActive: 'Just now',
    };
    // Log in audit log
    auditLogStore.unshift({
      id: `aud-${Date.now()}`,
      adminName: 'Admin Operator',
      adminEmail: 'admin@ontra.in',
      action: `User Account ${status.toUpperCase()}`,
      category: 'user_management',
      targetId: userId,
      targetType: 'user',
      details: `Status set to ${status}. Rationale: ${reason || 'Administrative policy enforcement'}.`,
      timestamp: formatDateTimeIST(new Date().toISOString()),
      ipAddress: '192.168.1.100',
    });
    return createApiResponse(usersStore[index], `User status updated to ${status}.`);
  },

  /**
   * Seller Verification Methods
   */
  async getVerificationRequests(): Promise<ApiResponse<AdminVerificationRecord[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<AdminVerificationRecord[]>('/admin/verifications');
    }

    await simulateNetworkDelay(100);
    return createApiResponse([...verificationStore]);
  },

  async reviewVerification(id: string, decision: 'approved' | 'rejected', notes?: string): Promise<ApiResponse<AdminVerificationRecord>> {
    if (!USE_MOCK_API) {
      return apiClient.post<AdminVerificationRecord>(`/admin/verifications/${id}/review`, { decision, notes });
    }

    await simulateNetworkDelay(150);
    const idx = verificationStore.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('Verification request not found');
    verificationStore[idx] = {
      ...verificationStore[idx],
      status: decision,
      rejectionReason: decision === 'rejected' ? notes : undefined,
      verifiedBy: 'Admin Team',
      verifiedAt: formatDateTimeIST(new Date().toISOString()),
      notes: notes || verificationStore[idx].notes,
    };
    // Update user record if approved
    const userIdx = usersStore.findIndex((u) => u.id === verificationStore[idx].sellerId);
    if (userIdx !== -1) {
      usersStore[userIdx] = {
        ...usersStore[userIdx],
        identityStatus: decision === 'approved' ? 'verified' : 'unverified',
        status: decision === 'approved' ? 'active' : usersStore[userIdx].status,
      };
    }
    auditLogStore.unshift({
      id: `aud-${Date.now()}`,
      adminName: 'Admin Operator',
      adminEmail: 'admin@ontra.in',
      action: `Seller ID Verification ${decision.toUpperCase()}`,
      category: 'user_management',
      targetId: id,
      targetType: 'seller_verification',
      details: `Verification request ${decision}. Notes: ${notes || 'Verified against KYC documentation'}.`,
      timestamp: formatDateTimeIST(new Date().toISOString()),
      ipAddress: '192.168.1.100',
    });
    return createApiResponse(verificationStore[idx]);
  },

  /**
   * Product Moderation Methods
   */
  async getModerationListings(): Promise<ApiResponse<AdminProductModerationItem[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<AdminProductModerationItem[]>('/admin/moderation');
    }

    await simulateNetworkDelay(120);
    return createApiResponse([...moderationStore]);
  },

  async moderateListing(
    id: string,
    action: 'approved' | 'rejected' | 'flagged',
    notes: string
  ): Promise<ApiResponse<AdminProductModerationItem>> {
    if (!USE_MOCK_API) {
      return apiClient.post<AdminProductModerationItem>(`/admin/moderation/${id}/action`, { action, notes });
    }

    await simulateNetworkDelay(150);
    const idx = moderationStore.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Listing not found');
    moderationStore[idx] = {
      ...moderationStore[idx],
      status: action,
      moderationNotes: notes,
    };
    auditLogStore.unshift({
      id: `aud-${Date.now()}`,
      adminName: 'Admin Operator',
      adminEmail: 'admin@ontra.in',
      action: `Product Listing ${action.toUpperCase()}`,
      category: 'listing_moderation',
      targetId: id,
      targetType: 'listing',
      details: `Moderation verdict: ${action}. Rationale: ${notes}`,
      timestamp: formatDateTimeIST(new Date().toISOString()),
      ipAddress: '192.168.1.100',
    });
    return createApiResponse(moderationStore[idx], `Listing marked as ${action}.`);
  },

  /**
   * Payment & Settlement Monitoring
   */
  async getPaymentRecords(): Promise<ApiResponse<AdminPaymentRecord[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<AdminPaymentRecord[]>('/admin/payments');
    }

    await simulateNetworkDelay(100);
    return createApiResponse([...paymentStore]);
  },

  async getSettlementRecords(): Promise<ApiResponse<AdminSettlementRecord[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<AdminSettlementRecord[]>('/admin/settlements');
    }

    await simulateNetworkDelay(100);
    return createApiResponse([...settlementStore]);
  },

  /**
   * Reports Monitoring
   */
  async getReports(): Promise<ApiResponse<AdminReportItem[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<AdminReportItem[]>('/admin/reports');
    }

    await simulateNetworkDelay(100);
    return createApiResponse([...reportsStore]);
  },

  async resolveReport(id: string, actionNotes: string): Promise<ApiResponse<AdminReportItem>> {
    if (!USE_MOCK_API) {
      return apiClient.post<AdminReportItem>(`/admin/reports/${id}/resolve`, { actionNotes });
    }

    await simulateNetworkDelay(120);
    const idx = reportsStore.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Report not found');
    reportsStore[idx] = {
      ...reportsStore[idx],
      status: 'action_taken',
      actionTakenNotes: actionNotes,
    };
    return createApiResponse(reportsStore[idx]);
  },

  /**
   * Categories Management
   */
  async getCategories(): Promise<ApiResponse<CategoryManagementItem[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<CategoryManagementItem[]>('/admin/categories');
    }

    await simulateNetworkDelay(80);
    return createApiResponse([...categoriesStore]);
  },

  async toggleCategoryLock(id: string): Promise<ApiResponse<CategoryManagementItem>> {
    if (!USE_MOCK_API) {
      return apiClient.patch<CategoryManagementItem>(`/admin/categories/${id}/lock`);
    }

    await simulateNetworkDelay(100);
    const idx = categoriesStore.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    categoriesStore[idx] = {
      ...categoriesStore[idx],
      isLocked: !categoriesStore[idx].isLocked,
    };
    return createApiResponse(categoriesStore[idx]);
  },

  /**
   * Platform Fee Policy Configuration
   */
  async getFeeConfig(): Promise<ApiResponse<PlatformFeeConfig>> {
    if (!USE_MOCK_API) {
      return apiClient.get<PlatformFeeConfig>('/admin/fees');
    }

    await simulateNetworkDelay(80);
    return createApiResponse({ ...feeConfigStore });
  },

  async updateFeeConfig(config: Partial<PlatformFeeConfig>): Promise<ApiResponse<PlatformFeeConfig>> {
    if (!USE_MOCK_API) {
      return apiClient.put<PlatformFeeConfig>('/admin/fees', config);
    }

    await simulateNetworkDelay(150);
    feeConfigStore = {
      ...feeConfigStore,
      ...config,
    };
    auditLogStore.unshift({
      id: `aud-${Date.now()}`,
      adminName: 'Chief Platform Officer',
      adminEmail: 'admin@ontra.in',
      action: 'Platform Fee Configuration Updated',
      category: 'fee_configuration',
      targetId: 'cfg-platform-fees',
      targetType: 'configuration',
      details: `Protection fee updated to ${feeConfigStore.buyerProtectionFeePercent}%, Escrow window ${feeConfigStore.inspectionWindowHours}h.`,
      timestamp: formatDateTimeIST(new Date().toISOString()),
      ipAddress: '192.168.1.100',
    });
    return createApiResponse(feeConfigStore, 'Platform policy updated successfully.');
  },

  /**
   * Audit Logs
   */
  async getAuditLogs(): Promise<ApiResponse<AdminAuditLog[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<AdminAuditLog[]>('/admin/audit-logs');
    }

    await simulateNetworkDelay(100);
    return createApiResponse([...auditLogStore]);
  },
};
