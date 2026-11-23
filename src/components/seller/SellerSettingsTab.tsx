/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MOCK_USERS } from '../../data/mockData.ts';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Building2, ShieldCheck, Bell, Palmtree, User } from 'lucide-react';
import { useToast } from '../../hooks/useToast.ts';

export const SellerSettingsTab: React.FC = () => {
  const { showToast } = useToast();
  const seller = MOCK_USERS.seller;

  const [name, setName] = useState(seller.name);
  const [city, setCity] = useState(seller.city);
  const [bio, setBio] = useState(seller.bio);
  const [vacationMode, setVacationMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [bankAccountNumber, setBankAccountNumber] = useState('50100482914910');
  const [ifscCode, setIfscCode] = useState('HDFC0000142');
  const [upiId, setUpiId] = useState('rohan.mehta@okhdfcbank');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings Saved', 'Seller profile preferences and payout details updated.', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-base font-bold text-slate-900">Seller Profile & Store Preferences</h2>
        <p className="text-xs text-slate-500">
          Manage your verified seller identity, payout settlement destination, and automated offer rules.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-700" />
            <span>Public Seller Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Seller Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Operating City & State"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Public Bio / Specialty
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Payout Banking Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700" />
              <span>Escrow Payout Bank Account</span>
            </h3>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified Bank & UPI
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Bank Account Number (HDFC / IMPS)"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              required
            />
            <Input
              label="IFSC Code"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <Input
            label="Verified UPI ID (Instant Settlement Fallback)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            helperText="IMPS / NEFT bank transfer occurs automatically once 48h buyer inspection passes."
            required
          />
        </div>

        {/* Vacation & Automated Rules */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-slate-700" />
            <span>Inventory Availability & Vacation Mode</span>
          </h3>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Vacation Mode</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Temporarily pause all active listings while traveling or away from shipping depot.
              </p>
            </div>
            <input
              type="checkbox"
              checked={vacationMode}
              onChange={(e) => setVacationMode(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="space-y-2 pt-2">
            <span className="font-bold text-slate-900 block">Notification Preferences</span>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900"
              />
              <span>Send immediate email alerts for new offers and courier delivery scans</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900"
              />
              <span>Send SMS alerts for in-person OTP handovers</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" className="bg-blue-900 font-semibold text-xs">
            Save Store Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
