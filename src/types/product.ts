/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProductCondition = 
  | 'mint_in_box'
  | 'like_new'
  | 'excellent'
  | 'very_good'
  | 'good'
  | 'fair'
  | 'for_parts';

export type ProductCategory = 
  | 'electronics'
  | 'mobiles_laptops'
  | 'furniture'
  | 'books'
  | 'home_appliances'
  | 'sports_fitness'
  | 'fashion_accessories'
  | 'other_products'
  | 'optical_cameras'
  | 'luxury_timepieces'
  | 'computing_laptops'
  | 'audiophile_gear'
  | 'designer_leather'
  | 'collectible_hardware';

export interface EvidencePhoto {
  id: string;
  url: string;
  label: string; // e.g. "Serial Number & Barcode", "Timestamp Note on Device", "Optics / Scratch Inspection", "Original Receipt"
  verifiedByAdmin?: boolean;
}

export interface ProductVerification {
  serialVerified: boolean;
  serialNumberMasked: string; // e.g. "SN-8924•••••"
  receiptIncluded: boolean;
  timestampEvidenceApproved: boolean;
  authenticityGuaranteed: boolean;
  inspectionWindowHours: number; // default 48
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  category: ProductCategory;
  brand: string;
  model: string;
  condition: ProductCondition;
  conditionDetails: string;
  askingPrice: number;
  originalRetailPrice: number;
  currency: string;
  isNegotiable: boolean;
  minOfferAllowed?: number;
  featuredImage: string;
  galleryImages?: string[];
  videoUrl?: string;
  evidencePhotos: EvidencePhoto[];
  verification: ProductVerification;
  hasOriginalInvoice: boolean;
  purchaseDate?: string;
  usageDuration?: string;
  workingConditionDetails?: string;
  defectsAndScratches?: string;
  repairsAndReplacements?: string;
  accessoriesIncluded?: string[];
  warrantyStatus?: string;
  reasonForSelling?: string;
  deliveryMethods?: ('courier' | 'direct_handover')[];
  approximateLocation?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating: number; // e.g. 4.95
  sellerTrustScore: number;
  sellerLocation: string;
  sellerCompletedTransactions?: number;
  sellerMemberSince?: string;
  insuredShippingCost: number;
  createdAt: string;
  status: 'active' | 'draft' | 'paused' | 'under_offer' | 'escrow_locked' | 'sold' | 'unavailable';
  viewsCount?: number;
  savesCount?: number;
  offersCount?: number;
  subCategory?: string;
  hasOriginalBox?: boolean;
  warrantyDocumentUrl?: string;
  invoiceDocumentUrl?: string;
  invoiceUnavailable?: boolean;
  documentStatus?: 'yes_invoice' | 'no_unavailable' | 'has_supporting_doc';
  documentType?: 'invoice' | 'purchase_confirmation' | 'warranty_papers' | 'service_receipt' | 'ownership_evidence' | 'none';
  supportingDocumentUrl?: string;
  supportingDocumentName?: string;
  documentOption?: 'yes_invoice' | 'no_unavailable' | 'has_supporting_doc';
  supportingDocType?: 'purchase_confirmation' | 'warranty_papers' | 'service_receipt' | 'ownership_evidence';
}

export interface CategoryDefinition {
  id: ProductCategory;
  name: string;
  description: string;
  itemCount: number;
  iconName?: string;
  requiredEvidenceChecklist: string[];
  inspectionKeypoints: string[];
}

