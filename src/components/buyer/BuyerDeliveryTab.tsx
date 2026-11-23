/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Truck, QrCode, ShieldCheck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useToast } from '../../hooks/useToast.ts';
import { formatCurrency, formatDateTimeIST } from '../../utils/formatters.ts';

export const BuyerDeliveryTab: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">Delivery & Handover Tracking</h2>
        <p className="text-xs text-slate-500">
          Track tracked courier packages and access your in-person OTP handover verification credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Direct Handover OTP Card */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="w-4 h-4" />
              Direct Handover Passcode
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              In-Person Exchange
            </span>
          </div>

          <div className="text-center py-2 space-y-2">
            <p className="text-xs text-slate-300">Your 6-Digit One-Time Code for Rohan Mehta:</p>
            <div className="p-4 bg-slate-800 rounded-xl inline-block border border-slate-700">
              <span className="font-mono text-3xl font-bold tracking-[0.35em] text-emerald-400">
                839201
              </span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto pt-1 leading-relaxed">
              Show this code to the seller only when you physically receive the package in Jaipur, Rajasthan. This commences your 48-hour hands-on inspection.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Escrow Protection:</strong> Handover confirmation merely marks physical receipt; seller payout remains delayed for 48 hours for your full inspection.
            </span>
          </div>

          <a
            href="/delivery/handover"
            className="inline-flex items-center justify-center w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Open Dedicated Handover Portal
          </a>
        </div>

        {/* Module 2: Active Courier Tracking */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-slate-800" />
              Active Tracked Courier
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Delivered
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Blue Dart Air Express (Insured)</p>
              <p className="font-mono text-slate-600">Tracking: #BD-924180-BLR-JAI</p>
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Delivered & Signed for on {formatDateTimeIST('2026-11-03T08:45:00Z')}
              </p>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100 text-[11px]">
              <div className="flex items-center justify-between text-slate-500">
                <span>Insured Freight Value:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(2850)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Origin Hub:</span>
                <span>Bengaluru Kempegowda Hub, Karnataka</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Destination:</span>
                <span>Jaipur C-Scheme Hub, Rajasthan (302001)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <a
              href="/delivery/courier"
              className="inline-flex items-center justify-center w-full py-2.5 px-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              Open 5-Step Courier Timeline
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast('Tracking Refreshed', 'Carrier tracking log is up to date.', 'info')}
              className="w-full justify-center text-xs"
            >
              Refresh Carrier Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
