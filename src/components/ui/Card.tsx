/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn.ts';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  padding = 'md',
  hoverable = false,
  children,
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200/80 shadow-xs transition-all duration-200',
        hoverable && 'hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
