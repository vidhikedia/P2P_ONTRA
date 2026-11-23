/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductCondition, TransactionStage } from '../types/index.ts';

export const CONDITION_LABELS: Record<ProductCondition, { label: string; description: string; badgeColor?: string }> = {
  mint_in_box: {
    label: 'Mint in Box',
    description: 'Unused or virtually indistinguishable from new with complete original packaging and papers.'
  },
  like_new: {
    label: 'Like New',
    description: 'Almost no visible signs of use. Flawless cosmetic condition under daylight inspection.'
  },
  excellent: {
    label: 'Excellent',
    description: 'Minor signs of light use. Well-maintained pre-owned condition with clean surfaces.'
  },
  very_good: {
    label: 'Very Good',
    description: 'Light superficial marks consistent with careful ownership. Fully inspected and mechanically flawless.'
  },
  good: {
    label: 'Good',
    description: 'Clearly pre-owned but properly maintained. Fully functional with honest signs of use.'
  },
  fair: {
    label: 'Fair',
    description: 'Visible scratches, marks or cosmetic wear. Fully documented in photo evidence with price adjusted.'
  },
  for_parts: {
    label: 'For Parts / Salvage',
    description: 'Damaged or non-functional. Disclosed defects, sold strictly for repair, donor parts or restoration.'
  }
};

export interface StageDefinition {
  stage: TransactionStage;
  stepNumber: number;
  title: string;
  shortDesc: string;
  whoActs: 'Seller' | 'Buyer' | 'Escrow' | 'Both' | 'Admin';
}

export const TRANSACTION_STAGES: StageDefinition[] = [
  {
    stage: 'evidence_submitted',
    stepNumber: 1,
    title: 'Evidence Verification',
    shortDesc: 'Serial numbers, timestamped photo proof, and condition criteria verified.',
    whoActs: 'Seller'
  },
  {
    stage: 'offer_negotiation',
    stepNumber: 2,
    title: 'Binding Offer',
    shortDesc: 'Transparent peer-to-peer negotiation with contract-locked pricing.',
    whoActs: 'Both'
  },
  {
    stage: 'escrow_funded',
    stepNumber: 3,
    title: 'Escrow Vault Secured',
    shortDesc: 'Buyer payment is locked in neutral escrow before any item is shipped.',
    whoActs: 'Escrow'
  },
  {
    stage: 'insured_shipping',
    stepNumber: 4,
    title: 'Insured Delivery',
    shortDesc: 'Full declared-value insurance and tracked signature requirement.',
    whoActs: 'Seller'
  },
  {
    stage: 'buyer_inspection',
    stepNumber: 5,
    title: '48-Hour Inspection',
    shortDesc: 'Buyer tests the physical item against the submitted evidence checklist.',
    whoActs: 'Buyer'
  },
  {
    stage: 'payout_released',
    stepNumber: 6,
    title: 'Seller Payout Released',
    shortDesc: 'Escrow disburses guaranteed funds to seller once buyer approves or timer elapses.',
    whoActs: 'Escrow'
  }
];
