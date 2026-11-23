/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Clock, CheckCircle, AlertTriangle, PackageCheck } from 'lucide-react';
import { cn } from '../../utils/cn.ts';
import { TransactionStage, ProductCondition } from '../../types/index.ts';

export interface StatusBadgeProps {
  stage?: TransactionStage;
  condition?: ProductCondition;
  customText?: string;
  variant?: 'neutral' | 'success' | 'warning' | 'info' | 'danger';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  stage,
  condition,
  customText,
  variant = 'neutral',
  className,
}) => {
  // Determine text and icon
  let text = customText || '';
  let icon = null;

  if (stage) {
    switch (stage) {
      case 'evidence_submitted':
        text = 'Evidence Verified';
        icon = <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />;
        break;
      case 'offer_negotiation':
        text = 'Offer Negotiation';
        icon = <Clock className="w-3.5 h-3.5 text-slate-700" />;
        break;
      case 'escrow_funded':
        text = 'Escrow Funded (Holding)';
        icon = <ShieldCheck className="w-3.5 h-3.5 text-slate-800" />;
        break;
      case 'insured_shipping':
        text = 'In Transit (Insured)';
        icon = <Clock className="w-3.5 h-3.5 text-slate-700" />;
        break;
      case 'buyer_inspection':
        text = '48h Inspection Window';
        icon = <PackageCheck className="w-3.5 h-3.5 text-blue-800" />;
        break;
      case 'payout_released':
        text = 'Payout Released';
        icon = <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />;
        break;
      case 'dispute_raised':
        text = 'Under Arbitration';
        icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />;
        break;
    }
  } else if (condition) {
    switch (condition) {
      case 'mint_in_box':
        text = 'Mint in Box';
        break;
      case 'like_new':
        text = 'Like New';
        break;
      case 'very_good':
        text = 'Very Good';
        break;
      case 'good':
        text = 'Good';
        break;
      case 'fair':
        text = 'Fair';
        break;
    }
  }

  // Clean, editorial status appearance without noisy pill badges
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium tracking-tight text-slate-700 whitespace-nowrap shrink-0',
        className
      )}
    >
      {icon}
      <span>{text}</span>
    </span>
  );
};
