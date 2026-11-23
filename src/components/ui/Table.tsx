/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { TableHTMLAttributes } from 'react';
import { cn } from '../../utils/cn.ts';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  className?: string;
  containerClassName?: string;
}

export const Table: React.FC<TableProps> = ({
  className,
  containerClassName,
  children,
  ...props
}) => {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-slate-200 bg-white', containerClassName)}>
      <table className={cn('w-full text-left text-sm text-slate-700', className)} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead className={cn('bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider', className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody className={cn('divide-y divide-slate-100', className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => (
  <tr className={cn('hover:bg-slate-50/60 transition-colors', className)} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th className={cn('px-4 py-3 font-semibold text-slate-900', className)} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={cn('px-4 py-3.5 text-sm font-normal text-slate-700 align-middle', className)} {...props}>
    {children}
  </td>
);
