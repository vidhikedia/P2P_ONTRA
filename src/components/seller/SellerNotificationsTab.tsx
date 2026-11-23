/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, Clock, Tag, ShieldCheck, Wallet, Check } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { formatCurrency, formatDateTimeIST } from '../../utils/formatters.ts';

export const SellerNotificationsTab: React.FC = () => {
  const [filterUnread, setFilterUnread] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'Doorstep Delivery Confirmed (Blue Dart Air Express)',
      description: 'Ananya Sharma signed for Apple MacBook Pro #BD-924180-BLR-JAI in Jaipur. The 48-hour inspection countdown has begun.',
      time: formatDateTimeIST('2026-11-03T08:45:00Z'),
      unread: true,
      type: 'inspection'
    },
    {
      id: 'notif_2',
      title: `New Binding Offer Received (${formatCurrency(13200)})`,
      description: 'Vikramaditya Singh submitted a binding offer for Leica M6 TTL 0.72 Black Chrome.',
      time: formatDateTimeIST('2026-11-03T03:00:00Z'),
      unread: true,
      type: 'offer'
    },
    {
      id: 'notif_3',
      title: `Escrow Deposit Secured (${formatCurrency(2700)})`,
      description: 'ONTRA vault confirmed incoming UPI / Net Banking escrow payment for Omega Speedmaster #tx_98412.',
      time: formatDateTimeIST('2026-10-30T05:15:00Z'),
      unread: false,
      type: 'escrow'
    },
    {
      id: 'notif_4',
      title: `Payout Cleared to Bank (${formatCurrency(19207)})`,
      description: 'Net proceeds for Sony Alpha A7 IV Kit successfully disbursed to your HDFC Bank account via IMPS.',
      time: formatDateTimeIST('2026-09-18T04:00:00Z'),
      unread: false,
      type: 'payout'
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const visibleNotifications = filterUnread
    ? notifications.filter((n) => n.unread)
    : notifications;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Seller Alerts & Notifications</h2>
          <p className="text-xs text-slate-500">
            Real-time updates regarding buyer offers, delivery tracking milestones, and escrow releases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterUnread(!filterUnread)}
            className="text-xs"
          >
            {filterUnread ? 'Show All' : 'Show Unread Only'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs text-slate-600"
          >
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {visibleNotifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all text-xs ${
              n.unread
                ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
              {n.type === 'inspection' && <Clock className="w-4 h-4 text-blue-900" />}
              {n.type === 'offer' && <Tag className="w-4 h-4 text-amber-600" />}
              {n.type === 'escrow' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
              {n.type === 'payout' && <Wallet className="w-4 h-4 text-emerald-600" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-slate-900">{n.title}</p>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.time}</span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{n.description}</p>
            </div>

            {n.unread && (
              <span className="w-2 h-2 rounded-full bg-blue-900 shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
