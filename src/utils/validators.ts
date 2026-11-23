/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrderDeliveryAddress, OrderHandoverDetails, ProductCondition, ProductCategory } from '../types/index.ts';
import { formatCurrency } from './formatters.ts';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
}

/**
 * Standard Email Format Validator (RFC 5322 compliant regex)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailRegex.test(email.trim());
}

/**
 * Indian Mobile Number Validator (+91 / 10-digit Indian mobile numbers starting with 6-9)
 */
export function isValidIndianMobile(phone: string): boolean {
  const cleaned = phone.replace(/[\s()-]/g, '');
  return /^(?:\+?91|0)?[6-9]\d{9}$/.test(cleaned);
}

/**
 * Phone Number Validator (Defaults to Indian mobile validation, with fallback E.164 check if explicitly international)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s()-]/g, '');
  if (/^(?:\+?91|0)?[6-9]\d{9}$/.test(cleaned)) {
    return true;
  }
  const digits = cleaned.replace(/[^0-9]/g, '');
  return cleaned.startsWith('+') && !cleaned.startsWith('+91') && digits.length >= 10 && digits.length <= 15;
}

/**
 * Indian 6-Digit PIN Code Validator
 */
export function isValidIndianPinCode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

/**
 * Login Form Validator
 */
export function validateLoginForm(data: { email?: string; identifier?: string; password?: string }): ValidationResult {
  const errors: Record<string, string> = {};
  const loginId = (data.identifier || data.email || '').trim();

  if (!loginId) {
    errors.email = 'Email address or +91 mobile number is required.';
  } else if (loginId.includes('@') && !isValidEmail(loginId)) {
    errors.email = 'Please provide a valid email format (e.g., name@domain.in).';
  }

  if (!data.password || data.password.length === 0) {
    errors.password = 'Password is required.';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  const keys = Object.keys(errors);
  return {
    isValid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : undefined,
  };
}

/**
 * Registration Form Validator
 */
export function validateRegistrationForm(data: {
  name?: string;
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  mobile?: string;
  city?: string;
  role?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  const displayName = (data.fullName || data.name || '').trim();
  const contactPhone = (data.mobile || data.phone || '').trim();

  if (!displayName) {
    errors.name = 'Full name is required.';
  } else if (displayName.length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please provide a valid email format.';
  }

  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters with numbers and letters.';
  } else if (data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (contactPhone && !isValidIndianMobile(contactPhone)) {
    errors.phone = 'Please enter a valid 10-digit Indian mobile number (+91).';
  }

  if (!data.city || !data.city.trim()) {
    errors.city = 'City is required for verified local custody and courier routing.';
  }

  const keys = Object.keys(errors);
  return {
    isValid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : undefined,
  };
}

/**
 * OTP Code Validator (exact length check)
 */
export function validateOtpCode(code: string, requiredLength: number = 6): ValidationResult {
  const errors: Record<string, string> = {};
  const cleaned = code.trim().replace(/\s+/g, '');

  if (!cleaned) {
    errors.code = 'Verification code is required.';
  } else if (!/^\d+$/.test(cleaned)) {
    errors.code = 'Verification code must contain digits only.';
  } else if (cleaned.length !== requiredLength) {
    errors.code = `Code must be exactly ${requiredLength} digits.`;
  }

  const keys = Object.keys(errors);
  return {
    isValid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : undefined,
  };
}

/**
 * Product Listing Basic Info Validator
 */
export function validateListingBasics(data: {
  title?: string;
  category?: ProductCategory;
  subCategory?: string;
  brand?: string;
  model?: string;
  condition?: ProductCondition;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Listing title is required.';
  } else if (data.title.trim().length < 5) {
    errors.title = 'Listing title must be at least 5 characters long.';
  }

  if (!data.brand || !data.brand.trim()) {
    errors.brand = 'Brand or manufacturer name is required.';
  }

  if (!data.model || !data.model.trim()) {
    errors.model = 'Product model or reference number is required.';
  }

  if (!data.category) {
    errors.category = 'A verified marketplace category must be selected.';
  }

  const keys = Object.keys(errors);
  return {
    isValid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : undefined,
  };
}

/**
 * Product Listing Media Evidence Validator
 */
export function validateListingMedia(
  data: ({ url: string | null } | string)[] | { photos: ({ url: string | null } | string)[] }
): ValidationResult {
  const errors: Record<string, string> = {};
  const photoList = Array.isArray(data) ? data : data.photos || [];
  const uploadedCount = photoList.filter((p) => {
    if (typeof p === 'string') return p.trim().length > 0;
    return p && p.url !== null;
  }).length;

  if (uploadedCount === 0) {
    errors.photos = 'At least one verified physical product photo is required.';
  }

  const keys = Object.keys(errors);
  return {
    isValid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : undefined,
  };
}

/**
 * Product Listing Pricing & Location Validator
 */
export function validateListingPricing(data: {
  askingPrice?: number;
  originalRetailPrice?: number;
  minOfferAllowed?: number;
  isNegotiable?: boolean;
  city?: string;
  approximateLocation?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (data.askingPrice === undefined || isNaN(data.askingPrice) || data.askingPrice <= 0) {
    errors.askingPrice = 'Asking price must be a positive INR amount greater than ₹0.';
  }

  if (data.isNegotiable && data.minOfferAllowed !== undefined && data.askingPrice !== undefined) {
    if (data.minOfferAllowed > data.askingPrice) {
      errors.minOfferAllowed = 'Minimum offer cannot exceed the asking price.';
    }
    if (data.minOfferAllowed <= 0) {
      errors.minOfferAllowed = 'Minimum offer must be a positive INR amount.';
    }
  }

  if (!data.city || !data.city.trim()) {
    errors.city = 'Seller city is required for courier and meetup calculation.';
  }

  const keys = Object.keys(errors);
  return {
    isValid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : undefined,
  };
}

/**
 * Courier Delivery Address Validator (Indian Address & 6-Digit PIN Code)
 */
export function validateCheckoutAddress(address: Partial<OrderDeliveryAddress>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!address.fullName || !address.fullName.trim()) {
    errors.fullName = 'Recipient full name is required.';
  }

  if (!address.streetAddress || !address.streetAddress.trim()) {
    errors.streetAddress = 'House/Flat number, street, and locality are required.';
  }

  if (!address.city || !address.city.trim()) {
    errors.city = 'Destination city is required.';
  }

  if (!address.postalCode || !address.postalCode.trim()) {
    errors.postalCode = '6-digit Indian PIN code is required.';
  } else if (!isValidIndianPinCode(address.postalCode)) {
    errors.postalCode = 'Please enter a valid 6-digit PIN code (e.g., 302001).';
  }

  if (!address.phone || !address.phone.trim()) {
    errors.phone = '10-digit Indian mobile number (+91) is required for courier OTP delivery.';
  } else if (!isValidIndianMobile(address.phone)) {
    errors.phone = 'Please enter a valid 10-digit Indian mobile number (+91).';
  }

  const keys = Object.keys(errors);
  return {
    isValid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : undefined,
  };
}

/**
 * Direct Handover Meeting Details Validator
 */
export function validateHandoverDetails(details: Partial<OrderHandoverDetails>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!details.locationName || !details.locationName.trim()) {
    errors.locationName = 'A specific public meeting location is required.';
  }

  if (!details.scheduledDate || !details.scheduledDate.trim()) {
    errors.scheduledDate = 'Scheduled meeting time is required.';
  }

  const keys = Object.keys(errors);
  return {
    isValid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : undefined,
  };
}

/**
 * Binding Purchase Offer Validator
 */
export function validateOfferInput(
  offeredAmount: number,
  minOfferAllowed?: number,
  askingPrice?: number
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!offeredAmount || isNaN(offeredAmount) || offeredAmount <= 0) {
    errors.amount = 'Offer amount must be a positive INR amount.';
  } else if (minOfferAllowed && offeredAmount < minOfferAllowed) {
    errors.amount = `Minimum binding offer allowed by seller is ${formatCurrency(minOfferAllowed)}.`;
  } else if (askingPrice && offeredAmount > askingPrice * 1.5) {
    errors.amount = 'Offer cannot be unreasonably higher than asking price.';
  }

  const keys = Object.keys(errors);
  return {
    isValid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : undefined,
  };
}

/**
 * Dispute Filing Validator
 */
export function validateDisputeInput(data: {
  reason?: string;
  explanation?: string;
  photos?: string[];
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.reason) {
    errors.reason = 'Please select the primary reason for disputing this delivery.';
  }

  if (!data.explanation || !data.explanation.trim()) {
    errors.explanation = 'Detailed explanation of discrepancies or damage is required.';
  } else if (data.explanation.trim().length < 20) {
    errors.explanation = 'Please provide at least 20 characters describing the issue.';
  }

  if (!data.photos || data.photos.length === 0) {
    errors.photos = 'At least one photo demonstrating the defect or issue is required.';
  }

  const keys = Object.keys(errors);
  return {
    isValid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : undefined,
  };
}
