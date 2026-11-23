/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { 
  QrCode, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.ts';
import { formatCurrency, formatDateTimeIST } from '../../utils/formatters.ts';

interface SellerDeliveryTabProps {
  onVerifyOtp: (otp: string) => void;
}

export const SellerDeliveryTab: React.FC<SellerDeliveryTabProps> = ({
  onVerifyOtp,
}) => {
  const { showToast } = useToast();
  const [otpInput, setOtpInput] = useState('');
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState('World Trade Park Central Atrium (Malviya Nagar, Jaipur)');

  const handleSubmitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length !== 6) {
      showToast('Validation Error', 'OTP must be 6 digits.', 'error');
      return;
    }
    onVerifyOtp(otpInput);
    setOtpInput('');
  };

  const handleBookCourierPickup = () => {
    showToast(
      'Insured Courier Pickup Scheduled',
      'Shiprocket-compatible insured courier scheduled for tomorrow between 10:00 AM - 2:00 PM IST at your Bengaluru pickup address.',
      'success'
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-slate-900">Delivery & Handover Operations</h2>
        <p className="text-xs text-slate-500">
          Manage direct physical handovers and scheduled carrier pickups with complete escrow custody tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Physical Handover with OTP Verification */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-slate-800" />
              <span>In-Person Handover OTP Authentication</span>
            </h3>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Session
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">Active Scheduled Handover:</p>
            <p>Buyer: <strong>Ananya Sharma</strong></p>
            <p>Item: <strong>Leica M6 TTL 35mm Rangefinder ({formatCurrency(14500)})</strong></p>
            <p className="text-[11px] text-slate-500 pt-1">
              Location: Jaipur, Rajasthan (Public venue confirmed via contract chat).
            </p>
          </div>

          <form onSubmit={handleSubmitOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 text-center">
                Enter Buyer's 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="839201"
                className="w-full text-center font-mono text-2xl tracking-[0.4em] py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
              <p className="text-[10px] text-slate-400 text-center mt-1">
                Ask the buyer to present the code displayed in their ONTRA app at handover.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center bg-slate-900 hover:bg-slate-800 font-semibold text-xs text-white shadow-xs"
              >
                Authenticate Exchange & Start 48h Inspection Clock
              </Button>
              <a
                href="/delivery/handover"
                className="inline-flex items-center justify-center w-full py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                Open Full Handover Authentication Interface
              </a>
            </div>
          </form>
        </div>

        {/* Module 2: Tracked Courier & Freight Bookings */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-800" />
              <span>Insured Courier Dispatch Desk</span>
            </h3>
            <span className="text-[10px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Shiprocket-Compatible
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-900 block">Active Insured Freight:</span>
              <p>Tracking: <strong>#BD-924180-BLR-JAI</strong></p>
              <p>Destination: Ananya Sharma, Jaipur, Rajasthan (302001)</p>
              <p className="text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Doorstep Signature Delivered ({formatDateTimeIST('2026-11-03T08:45:00Z')})
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-[11px]">
              <span className="font-semibold text-slate-900">Platform Insurance Coverage:</span>
              <p>All courier parcels generated via ONTRA include full declared value coverage against loss or transit damage.</p>
            </div>
          </div>

          <div className="space-y-2">
            <a
              href="/delivery/courier"
              className="inline-flex items-center justify-center w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              Open Dedicated Courier Dispatch Desk
            </a>
            <Button
              variant="outline"
              size="md"
              onClick={handleBookCourierPickup}
              className="w-full justify-center text-xs font-semibold"
            >
              Schedule Doorstep Courier Pickup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
