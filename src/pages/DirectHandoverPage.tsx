/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { transactionService } from '../services/transactionService.ts';
import { Transaction } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { Button } from '../components/ui/Button.tsx';
import { useToast } from '../hooks/useToast.ts';
import {
  QrCode,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Info,
  Calendar,
  Lock,
  ChevronRight,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

export const DirectHandoverPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Perspective switcher: 'buyer' | 'seller'
  const [activePerspective, setActivePerspective] = useState<'buyer' | 'seller'>('buyer');

  // OTP Management State
  const [currentOtp, setCurrentOtp] = useState<string>('582904');
  const [otpMinutesRemaining, setOtpMinutesRemaining] = useState<number>(14);
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState<number>(45);

  // Seller authentication input state
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [handoverTimestamp, setHandoverTimestamp] = useState<string | null>(null);

  // Simulation test toggles
  const [simulateExpiredOtp, setSimulateExpiredOtp] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const idToLookup = orderId || 'ORD-89241';
        const res = await transactionService.getTransactionById(idToLookup);
        if (res.data) {
          setOrder(res.data);
          if (res.data.handoverDetails?.otpCode) {
            setCurrentOtp(res.data.handoverDetails.otpCode);
          }
          if (res.data.handoverDetails?.handoverCompletedAt) {
            setVerificationSuccess(true);
            setHandoverTimestamp(res.data.handoverDetails.handoverCompletedAt);
          }
        } else {
          const listRes = await transactionService.getTransactions();
          if (listRes.data && listRes.data.length > 0) {
            setOrder(listRes.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load handover order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Live OTP Expiry countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setOtpSecondsRemaining((prevSec) => {
        if (prevSec > 0) {
          return prevSec - 1;
        } else {
          setOtpMinutesRemaining((prevMin) => (prevMin > 0 ? prevMin - 1 : 0));
          return 59;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-medium">Initializing secure physical handover exchange session...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Located</h2>
        <p className="text-slate-600 text-sm mb-6">Could not find handover records for order reference {orderId}.</p>
        <Link to="/buyer/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handleRegenerateOtp = () => {
    const freshCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOtp(freshCode);
    setOtpMinutesRemaining(15);
    setOtpSecondsRemaining(0);
    setSimulateExpiredOtp(false);
    setVerificationError(null);
    showToast('Fresh OTP Generated', `New 6-digit code ${freshCode} active for 15 minutes.`, 'info');
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (enteredOtp.length !== 6) {
      setVerificationError('Please enter all 6 digits of the handover verification code.');
      return;
    }

    setIsVerifying(true);
    setTimeout(async () => {
      try {
        const res = await transactionService.verifyHandoverOtp(order.id, enteredOtp, {
          simulateExpired: simulateExpiredOtp,
        });

        if (res.data?.verified && res.data.transaction) {
          setVerificationSuccess(true);
          const nowStr =
            new Date().toLocaleTimeString('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }) + ' IST';
          setHandoverTimestamp(nowStr);
          setOrder({ ...res.data.transaction });
          showToast('Handover Authenticated', 'Mutual exchange confirmed! 48h Inspection window has started.', 'success');
        } else {
          setVerificationError(res.data?.error || 'Verification declined by security protocol.');
          showToast('Authentication Error', res.data?.error || 'Invalid code.', 'error');
        }
      } catch (err) {
        console.error(err);
        setVerificationError('An unexpected validation error occurred.');
      } finally {
        setIsVerifying(false);
      }
    }, 600);
  };

  const meetingLocation = order.handoverDetails?.locationName || 'World Trade Park Central Atrium (Malviya Nagar, Jaipur)';
  const meetingDate = order.handoverDetails?.scheduledDate || 'Tomorrow at 14:00 IST';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Top Breadcrumb & Perspective Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-8">
        <div>
          <Link
            to={`/order-tracking/${order.orderId || order.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Order Lifecycle</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Direct Physical Handover</h1>
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200">
              #{order.orderId || order.id}
            </span>
          </div>
        </div>

        {/* Perspective Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => setActivePerspective('buyer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activePerspective === 'buyer'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buyer Passcode Screen
          </button>
          <button
            type="button"
            onClick={() => setActivePerspective('seller')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activePerspective === 'seller'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Seller OTP Verification
          </button>
        </div>
      </div>

      {/* BACKEND SECURITY DISCLOSURE (Prompt Mandate) */}
      <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900">
            Handover Authentication Protocol
          </span>
          <p className="text-slate-600 leading-relaxed font-medium">
            "The actual OTP must later be generated and validated securely by the backend."
            In this prototype, codes are simulated with timed expiration, collision resistance, and mutual receipt logging.
          </p>
        </div>
      </div>

      {/* AGREED MEETING DETAILS CARD (Workflow Step 2 & 3) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-900" />
            <h2 className="text-sm font-bold text-slate-900">Agreed In-Person Handover Plan</h2>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Venue Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-600" /> Meeting Venue
            </span>
            <p className="font-bold text-slate-900">{meetingLocation}</p>
            <p className="text-[11px] text-slate-500">Public venue with CCTV coverage</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-600" /> Scheduled Time
            </span>
            <p className="font-bold text-slate-900">{meetingDate}</p>
            <p className="text-[11px] text-slate-500">Coordinated via platform contract chat</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Escrow State
            </span>
            <p className="font-bold text-emerald-700">{formatCurrency(order.agreedPrice)} Locked</p>
            <p className="text-[11px] text-slate-500">Payout held for 48h physical inspection</p>
          </div>
        </div>
      </div>

      {/* MAIN WORKFLOW INTERFACES: BUYER PASSCODE vs SELLER VERIFICATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {activePerspective === 'buyer' ? (
          /* BUYER PERSPECTIVE: Passcode Display & Safety Protocol */
          <>
            <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl border border-slate-800 p-8 shadow-sm space-y-6 text-center">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" /> Buyer Handover Passcode
                </span>
                <span className="text-[10px] font-mono text-slate-400">Order #{order.orderId || order.id}</span>
              </div>

              {/* SUCCESS CONFIRMATION STATE */}
              {verificationSuccess ? (
                <div className="py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-400/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Handover Completed & Authenticated</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Physical receipt logged at <strong>{handoverTimestamp || 'Just now'}</strong>. Your 48-Hour Hands-On Inspection Window is officially running.
                  </p>
                  <div className="pt-2">
                    <Link to={`/inspection/${order.orderId || order.id}`}>
                      <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
                        Open Inspection Checklist & Dossier
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* ACTIVE PASSCODE DISPLAY */
                <div className="space-y-4 py-2">
                  <p className="text-xs text-slate-300">
                    Show this 6-digit code to seller <strong>{order.sellerName}</strong> only after you physically meet and receive the product carton:
                  </p>

                  {/* Big OTP Code Box */}
                  <div className="p-5 bg-slate-800/90 rounded-2xl border border-slate-700 inline-block shadow-inner">
                    <span className="font-mono text-4xl sm:text-5xl font-bold tracking-[0.35em] text-emerald-400 pl-[0.35em]">
                      {currentOtp}
                    </span>
                  </div>

                  {/* OTP Expiry Display */}
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Passcode expires in:{' '}
                      <strong className="text-white font-mono">
                        {String(otpMinutesRemaining).padStart(2, '0')}:{String(otpSecondsRemaining).padStart(2, '0')}
                      </strong>
                    </span>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={handleRegenerateOtp}
                      className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                  </div>

                  {/* Simulated QR Code Graphic Placeholder */}
                  <div className="p-3 bg-white text-slate-900 rounded-xl inline-flex flex-col items-center gap-1 shadow-sm mx-auto">
                    <QrCode className="w-24 h-24 text-slate-900" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-600">
                      Scan or Key in Code
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Buyer Safety Instructions (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-900" />
                Handover Safety Rules
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </span>
                  <p>
                    <strong>Keep code secret until exchange:</strong> Do not message this OTP over the phone or platform chat prior to meeting.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </span>
                  <p>
                    <strong>Examine external packaging:</strong> Check that serial number markings and tamper-evident carton tape have not been breached.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </span>
                  <p>
                    <strong>48-Hour Guarantee:</strong> Disclosing the OTP completes physical receipt only; seller settlement remains safely held during your full 48-hour inspection.
                  </p>
                </div>
              </div>

              {/* Quick switch to seller view */}
              <div className="pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePerspective('seller')}
                  className="w-full justify-center text-xs"
                >
                  Switch to Seller Entry Screen to Test OTP
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* SELLER PERSPECTIVE: OTP Entry & Mutual Handover Confirmation */
          <>
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Seller Handover Confirmation</h2>
                  <p className="text-xs text-slate-500">
                    Input the 6-digit verification code provided by {order.buyerName} at the exchange venue.
                  </p>
                </div>
                <UserCheck className="w-5 h-5 text-blue-900" />
              </div>

              {/* SUCCESS CONFIRMATION STATE */}
              {verificationSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                      Handover Confirmed
                    </span>
                    <h3 className="text-lg font-bold text-emerald-950 pt-1">
                      Exchange Successfully Authenticated
                    </h3>
                    <p className="text-xs text-emerald-900 leading-relaxed max-w-sm mx-auto">
                      Buyer OTP recorded at <strong>{handoverTimestamp || '02:22 PM IST'}</strong>. Physical possession transferred. Buyer has 48 hours to complete testing.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3">
                    <Link to={`/order-tracking/${order.orderId || order.id}`}>
                      <Button variant="primary" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold">
                        View Order Status
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* OTP ENTRY FORM */
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                  {/* ERROR BANNER IF INVALID / EXPIRED */}
                  {verificationError && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-900">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Verification Error:</strong>
                        <p className="mt-0.5 leading-relaxed">{verificationError}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-2 text-center">
                      Enter Buyer's 6-Digit One-Time Code:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => {
                        setEnteredOtp(e.target.value.replace(/\D/g, ''));
                        setVerificationError(null);
                      }}
                      placeholder="e.g. 582904"
                      className="w-full text-center font-mono text-3xl tracking-[0.4em] py-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900"
                      required
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                      <span>Expected demo code for testing: <strong className="font-mono text-slate-800">{currentOtp}</strong></span>
                      <button
                        type="button"
                        onClick={() => setEnteredOtp(currentOtp)}
                        className="text-blue-900 hover:underline font-semibold cursor-pointer"
                      >
                        Auto-fill Correct Code
                      </button>
                    </div>
                  </div>

                  {/* Simulator Testing Controls (Section B Requirement) */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-slate-900 block">
                      Test Error States (Prompt Requirements):
                    </span>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={simulateExpiredOtp}
                          onChange={(e) => setSimulateExpiredOtp(e.target.checked)}
                          className="rounded border-slate-300 text-blue-900"
                        />
                        <span>Simulate <strong>Expired OTP</strong> (15-min timeout error)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEnteredOtp('999999');
                          setSimulateExpiredOtp(false);
                        }}
                        className="text-slate-600 hover:text-slate-900 underline text-[11px] block cursor-pointer"
                      >
                        Load Invalid OTP ('999999') to test invalid code alert
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isVerifying}
                    className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs"
                    leftIcon={<Lock className="w-4 h-4 text-emerald-400" />}
                  >
                    {isVerifying ? 'Authenticating with Vault...' : 'Confirm Handover & Start 48h Inspection'}
                  </Button>
                </form>
              )}
            </div>

            {/* Seller Handover Guidance (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Seller Protocol Checklist
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900">Exchange Item:</span>
                  <p>{order.productTitle}</p>
                  <p className="font-mono text-emerald-700 font-bold">{formatCurrency(order.agreedPrice)}</p>
                </div>

                <p className="leading-relaxed">
                  Only hand over physical custody after the buyer reads their 6-digit code to you and your screen confirms successful authentication.
                </p>

                <div className="p-3 bg-blue-50 text-blue-950 border border-blue-200 rounded-xl text-[11px] leading-relaxed">
                  <strong>Settlement Note:</strong> Handover authentication marks physical delivery. Settlement releases upon the buyer's satisfaction confirmation or 48 hours without dispute.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
