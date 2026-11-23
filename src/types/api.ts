/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  code?: string;
  errors?: ApiErrorDetail[];
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductFilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  brand?: string;
  location?: string;
  deliveryMethod?: 'courier' | 'direct_handover' | 'all';
  invoiceOnly?: boolean;
  query?: string;
  verifiedOnly?: boolean;
  sortBy?: 'newest' | 'price_low_high' | 'price_high_low' | 'trust_score';
  page?: number;
  limit?: number;
}

export interface AuthSessionResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: import('./user.ts').User;
}

export interface MediaUploadResponse {
  url: string;
  key: string;
  fileName: string;
  mimeType: string;
  size: number;
  sha256?: string;
}

export interface OrderTransitionRequest {
  targetStage: import('./transaction.ts').TransactionStage;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentIntentRequest {
  orderId: string;
  paymentMethod: 'card' | 'bank_wire';
  currency?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret?: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  escrowVaultReference: string;
  status: 'requires_payment_method' | 'processing' | 'succeeded' | 'requires_action';
}
