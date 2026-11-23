/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserRole, ApiResponse, AuthSessionResponse } from '../types/index.ts';
import { MOCK_USERS } from '../data/mockData.ts';
import { 
  apiClient, 
  USE_MOCK_API, 
  simulateNetworkDelay, 
  createApiResponse, 
  setAuthToken, 
  setRefreshToken, 
  clearAuthTokens 
} from './apiClient.ts';

export interface RegisterPayload {
  fullName: string;
  email: string;
  mobile: string;
  password?: string;
  city: string;
  role: 'buyer' | 'seller';
}

export interface LoginPayload {
  identifier: string; // email or mobile
  password?: string;
  rememberMe?: boolean;
}

export const authService = {
  /**
   * Fetch currently authenticated user session from backend
   */
  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    if (!USE_MOCK_API) {
      return apiClient.get<User>('/auth/me');
    }
    await simulateNetworkDelay(50);
    return createApiResponse(MOCK_USERS.buyer);
  },
  /**
   * Get predefined demo user by role
   */
  async getDemoUserByRole(role: UserRole): Promise<ApiResponse<User | null>> {
    await simulateNetworkDelay(60);
    if (role === 'guest') {
      return createApiResponse(null);
    }
    const user = MOCK_USERS[role];
    return createApiResponse(user || null);
  },

  /**
   * Authenticate user with identifier and password
   */
  async login(payload: LoginPayload): Promise<ApiResponse<User>> {
    if (!USE_MOCK_API) {
      const res = await apiClient.post<AuthSessionResponse>('/auth/login', payload);
      if (res.data?.token) {
        setAuthToken(res.data.token);
        if (res.data.refreshToken) setRefreshToken(res.data.refreshToken);
      }
      return createApiResponse(res.data.user, res.message);
    }

    await simulateNetworkDelay(250);
    const idLower = payload.identifier.toLowerCase().trim();

    // Check for role hints or default
    let matchedRole: UserRole = 'buyer';
    if (idLower.includes('seller') || idLower.includes('rohan')) {
      matchedRole = 'seller';
    } else if (idLower.includes('admin') || idLower.includes('priya')) {
      matchedRole = 'admin';
    }

    const baseUser = MOCK_USERS[matchedRole];
    const user: User = {
      ...baseUser,
      email: payload.identifier.includes('@') ? payload.identifier : baseUser.email,
      phone: !payload.identifier.includes('@') ? payload.identifier : baseUser.phone,
    };

    setAuthToken(`mock_token_${user.id}`);
    return createApiResponse(user, `Logged in successfully as ${user.name}`);
  },

  /**
   * Register a new user
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<{ user: User; pendingEmailCode: string; pendingMobileOtp: string }>> {
    if (!USE_MOCK_API) {
      const res = await apiClient.post<AuthSessionResponse>('/auth/register', payload);
      if (res.data?.token) {
        setAuthToken(res.data.token);
      }
      return createApiResponse(
        {
          user: res.data.user,
          pendingEmailCode: '',
          pendingMobileOtp: '',
        },
        res.message || 'Account registered successfully.'
      );
    }

    await simulateNetworkDelay(300);

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: payload.fullName,
      email: payload.email,
      phone: payload.mobile,
      city: payload.city || 'Jaipur',
      location: `${payload.city || 'Jaipur'}, India`,
      role: payload.role,
      bio: `${payload.role === 'seller' ? 'Verified seller' : 'Active buyer'} on ONTRA.`,
      emailVerified: false,
      mobileVerified: false,
      identityVerificationStatus: 'pending',
      rating: 5.0,
      reviewCount: 0,
      trustScore: {
        score: 85, // starting trust score
        totalTransactions: 0,
        successfulInspections: 0,
        disputeRatePercent: 0,
        identityVerified: false,
        memberSince: 'Just now',
      },
      badges: ['Newly Registered Member'],
      unreadNotificationsCount: 1,
      completedTransactionsList: [],
      reviews: [],
    };

    setAuthToken(`mock_token_${newUser.id}`);
    return createApiResponse(
      {
        user: newUser,
        pendingEmailCode: '492815',
        pendingMobileOtp: '719204',
      },
      'Account created. Verification code dispatched to email and SMS.'
    );
  },

  /**
   * Log out active session and revoke credentials
   */
  async logout(): Promise<void> {
    if (!USE_MOCK_API) {
      try {
        await apiClient.post('/auth/logout');
      } catch {
        // Silently clear credentials if network is unavailable
      }
    }
    clearAuthTokens();
  },

  /**
   * Verify email with confirmation code
   */
  async verifyEmail(code: string): Promise<ApiResponse<boolean>> {
    if (!USE_MOCK_API) {
      return apiClient.post<boolean>('/auth/verify-email', { code });
    }

    await simulateNetworkDelay(200);
    if (code === '492815' || code === '123456' || code.length === 6) {
      return createApiResponse(true, 'Email address confirmed and verified.');
    }
    throw new Error('Invalid or expired 6-digit email confirmation code. Try 492815 or 123456 in demo mode.');
  },

  /**
   * Verify mobile OTP
   */
  async verifyMobileOTP(otp: string): Promise<ApiResponse<boolean>> {
    if (!USE_MOCK_API) {
      return apiClient.post<boolean>('/auth/verify-mobile', { otp });
    }

    await simulateNetworkDelay(200);
    if (otp === '719204' || otp === '123456' || otp.length === 6) {
      return createApiResponse(true, 'Mobile number confirmed with cryptographic OTP verification.');
    }
    throw new Error('Invalid mobile OTP code. Try 719204 or 123456 in demo mode.');
  },

  /**
   * Resend verification code
   */
  async resendCode(type: 'email' | 'mobile'): Promise<ApiResponse<{ code: string }>> {
    if (!USE_MOCK_API) {
      return apiClient.post<{ code: string }>('/auth/resend-code', { type });
    }

    await simulateNetworkDelay(150);
    const code = type === 'email' ? '492815' : '719204';
    return createApiResponse({ code }, `Fresh demo code (${code}) dispatched to your ${type}.`);
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(identifier: string): Promise<ApiResponse<boolean>> {
    if (!USE_MOCK_API) {
      return apiClient.post<boolean>('/auth/forgot-password', { identifier });
    }

    await simulateNetworkDelay(250);
    return createApiResponse(true, `Password reset instructions dispatched to ${identifier}.`);
  }
};
