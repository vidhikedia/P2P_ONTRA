/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse, ApiErrorResponse, ApiErrorDetail } from '../types/index.ts';

// Configurable API base URL from environment variables
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (import.meta.env.VITE_API_URL as string) ||
  '/api';

// Configurable toggle for demo mock mode vs real Express.js backend
// Defaults to true when no explicit backend is connected
export const USE_MOCK_API: boolean =
  import.meta.env.VITE_USE_MOCK_API === 'true' ||
  import.meta.env.VITE_USE_MOCK_API === undefined ||
  import.meta.env.VITE_USE_MOCK_API === '';

// Auth Token Storage Keys
const AUTH_TOKEN_KEY = 'ontra_jwt_token';
const REFRESH_TOKEN_KEY = 'ontra_refresh_token';

// In-memory token cache for performance and XSS protection
let memoryToken: string | null = null;
let memoryRefreshToken: string | null = null;

// Initialize from localStorage if present
try {
  memoryToken = localStorage.getItem(AUTH_TOKEN_KEY);
  memoryRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
} catch {
  // Graceful fallback for restricted storage environments
}

export function getAuthToken(): string | null {
  return memoryToken;
}

export function setAuthToken(token: string | null): void {
  memoryToken = token;
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function getRefreshToken(): string | null {
  return memoryRefreshToken;
}

export function setRefreshToken(refreshToken: string | null): void {
  memoryRefreshToken = refreshToken;
  try {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function clearAuthTokens(): void {
  setAuthToken(null);
  setRefreshToken(null);
}

// Unauthorized (401) listener callbacks
type UnauthorizedListener = () => void;
const unauthorizedListeners: Set<UnauthorizedListener> = new Set();

export function onUnauthorized(callback: UnauthorizedListener): () => void {
  unauthorizedListeners.add(callback);
  return () => {
    unauthorizedListeners.delete(callback);
  };
}

function notifyUnauthorized(): void {
  clearAuthTokens();
  unauthorizedListeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Unauthorized listener error:', err);
    }
  });
}

/**
 * Standardized ApiError with HTTP status code, error details and server code
 */
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  errors?: ApiErrorDetail[];
  details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    errors?: ApiErrorDetail[],
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Core HTTP Request Dispatcher
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, headers, ...restOptions } = options;

  // Build full URL with query parameters
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${API_BASE_URL.replace(/\/$/, '')}${normalizedEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Construct request headers
  const reqHeaders = new Headers(headers);

  // Auto-set JSON content-type if not already provided and body is not FormData
  if (!(restOptions.body instanceof FormData) && !reqHeaders.has('Content-Type')) {
    reqHeaders.set('Content-Type', 'application/json');
  }

  // Attach Bearer token if user is authenticated
  const token = getAuthToken();
  if (token && !reqHeaders.has('Authorization')) {
    reqHeaders.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: reqHeaders,
      credentials: 'include', // Support HTTP-only session cookies alongside Bearer token
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      notifyUnauthorized();
      throw new ApiError('Authentication session expired or invalid. Please sign in.', 401, 'UNAUTHORIZED');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new ApiError('You do not have permission to perform this action.', 403, 'FORBIDDEN');
    }

    // Parse JSON response body
    let json: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      json = await response.json();
    } else {
      const text = await response.text();
      json = { success: response.ok, data: text, message: text };
    }

    if (!response.ok) {
      const errorResponse = json as ApiErrorResponse;
      throw new ApiError(
        errorResponse.message || `Request failed with status ${response.status}`,
        response.status,
        errorResponse.code,
        errorResponse.errors,
        json
      );
    }

    // Return in standard ApiResponse envelope
    if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
      return json as ApiResponse<T>;
    }

    return {
      data: json as T,
      success: true,
      statusCode: response.status,
    };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network failure or abort
    throw new ApiError(
      err instanceof Error ? err.message : 'Network communication error',
      0,
      'NETWORK_ERROR',
      undefined,
      err
    );
  }
}

/**
 * REST API Client Methods
 */
export const apiClient = {
  get<T>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { method: 'GET', params, headers });
  },

  post<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return request<T>(endpoint, { method: 'POST', body, headers });
  },

  put<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return request<T>(endpoint, { method: 'PUT', body, headers });
  },

  patch<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return request<T>(endpoint, { method: 'PATCH', body, headers });
  },

  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { method: 'DELETE', headers });
  },

  /**
   * Upload binary media files via multipart/form-data
   */
  async upload<T>(
    endpoint: string,
    file: File | Blob,
    fieldName: string = 'file',
    additionalFields?: Record<string, string>,
    _onProgress?: (percent: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    if (additionalFields) {
      Object.entries(additionalFields).forEach(([k, v]) => formData.append(k, v));
    }
    return request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  },
};

/**
 * Standard simulated API delay for realistic network feel during demo/mock mode
 */
export async function simulateNetworkDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Standardized API response builder for mock services
 */
export function createApiResponse<T>(data: T, message?: string, statusCode: number = 200): ApiResponse<T> {
  return {
    data,
    success: true,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}
