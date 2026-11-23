/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { transactionService, ORDER_TIMELINE_STAGES } from '../services/transactionService.ts';
import { Transaction, TransactionStage } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { Button } from '../components/ui/Button.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { useToast } from '../hooks/useToast.ts';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  QrCode,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowLeft,
  ChevronRight,
  Printer,
  Sparkles,
  ShieldAlert,
  Send,
  UserCheck,
  Calendar,
  Layers,
  HelpCircle,
  Star,
  Scale,
} from 'lucide-react';
import { ReviewModal } from '../components/common/ReviewModal.tsx';

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Role perspective toggle: 'buyer' | 'seller'
  const [viewPerspective, setViewPerspective] = useState<'buyer' | 'seller'>('buyer');

  // Interactive Action Modals
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState<
    'item_not_as_described' | 'damage_in_transit' | 'counterfeit_concern' | 'missing_accessories'
  >('item_not_as_described');
  const [disputeDescription, setDisputeDescription] = useState('');

  const [isSatisfactionModalOpen, setIsSatisfactionModalOpen] = useState(false);
  const [satisfactionNotes, setSatisfactionNotes] = useState('Product verified. Serial matched, condition matches listing dossier.');

  // Live countdown timer state (hours, minutes, seconds)
  const [countdown, setCountdown] = useState({ hours: 47, minutes: 28, seconds: 45 });

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const idToLookup = orderId || 'ORD-89241';
        const res = await transactionService.getTransactionById(idToLookup);
        if (res.data) {
          setOrder(res.data);
        } else {
          const listRes = await transactionService.getTransactions();
          if (listRes.data && listRes.data.length > 0) {
            setOrder(listRes.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load tracking data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Live countdown clock ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-medium">Fetching real-time transaction tracking state...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Located</h2>
        <p className="text-slate-600 text-sm mb-6">Could not find tracking record for order reference {orderId}.</p>
        <Link to="/explore">
          <Button variant="primary">Explore Marketplace</Button>
        </Link>
      </div>
    );
  }

  // Determine stage progression index (0-8)
  const allStages = ORDER_TIMELINE_STAGES.map((s) => s.stage);
  const currentStageIndex = allStages.indexOf(order.currentStage);

  // Quick Demo Simulator Stage Advancement
  const handleSimulateStageChange = async (targetStage: TransactionStage) => {
    try {
      const res = await transactionService.advanceOrderStage(order.id, targetStage, {
        notes: `Simulated advancement to ${targetStage.replace(/_/g, ' ')}`,
      });
      if (res.data) {
        setOrder({ ...res.data });
        showToast('Stage Advanced', `Order state updated to ${targetStage.replace(/_/g, ' ')}`, 'info');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Buyer: Confirm Satisfaction
  const handleConfirmSatisfaction = async () => {
    try {
      const res = await transactionService.approveInspection(order.id, satisfactionNotes);
      if (res.data) {
        setOrder({ ...res.data });
        setIsSatisfactionModalOpen(false);
        showToast('Settlement Initiated', 'Buyer satisfaction confirmed! Payout released to seller.', 'success');
      }
    } catch (e) {
      console.error(e);
      showToast('Error', 'Failed to confirm inspection satisfaction.', 'error');
    }
  };

  // Buyer: Report a Problem (Dispute)
  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDescription.trim()) {
      showToast('Description Required', 'Please explain the specific issue encountered.', 'warning');
      return;
    }

    try {
      const res = await transactionService.raiseDispute(order.id, disputeReason, disputeDescription);
      if (res.data) {
        setOrder({ ...res.data });
        setIsDisputeModalOpen(false);
        showToast('Problem Reported', 'Settlement held. Arbitrator case assigned.', 'warning');
      }
    } catch (e) {
      console.error(e);
      showToast('Error', 'Failed to record dispute.', 'error');
    }
  };

  const isCourier = order.deliveryMethod === 'courier';
  const isSettled = order.currentStage === 'seller_settlement_initiated';
  const isDisputed = order.currentStage === 'dispute_raised';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Top Navigation & Role View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-8">
        <div>
          <Link
            to={viewPerspective === 'buyer' ? '/buyer/dashboard' : '/seller/dashboard'}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to {viewPerspective === 'buyer' ? 'Buyer Dashboard' : 'Seller Dashboard'}</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Lifecycle Tracking</h1>
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200">
              #{order.orderId || order.id}
            </span>
          </div>
        </div>

        {/* Perspective Toggle (Section F: Buyer vs Seller View) */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => setViewPerspective('buyer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewPerspective === 'buyer'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buyer Order View
          </button>
          <button
            type="button"
            onClick={() => setViewPerspective('seller')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewPerspective === 'seller'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Seller Order View
          </button>
        </div>
      </div>

      {/* DISPUTE STATUS BANNER IF ACTIVE */}
      {isDisputed && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-rose-950 uppercase tracking-wider">
              Settlement Frozen · Neutral Arbitration Active
            </h3>
            <p className="text-rose-800 leading-relaxed">
              Reason: <strong>{order.dispute?.reason?.replace(/_/g, ' ')}</strong>. An ONTRA dispute officer is reviewing evidence photographs and seller dispatch records. Payout is safely frozen in platform vault.
            </p>
          </div>
        </div>
      )}

      {/* HEADER BANNER: Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Product Snapshot */}
          <div className="md:col-span-5 flex items-center gap-4">
            <img
              src={order.productImage}
              alt={order.productTitle}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {order.deliveryMethod === 'courier' ? 'Tracked Courier' : 'Direct Handover'}
              </span>
              <h2 className="text-base font-bold text-slate-900 line-clamp-1">{order.productTitle}</h2>
              <p className="text-xs text-slate-500">
                Counterparty: <strong>{viewPerspective === 'buyer' ? order.sellerName : order.buyerName}</strong>
              </p>
            </div>
          </div>

          {/* Pricing & Custody State */}
          <div className="md:col-span-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Locked Deposit:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(order.agreedPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Settlement Status:</span>
              <span className="font-semibold text-blue-900">
                {isSettled ? 'Settled to Seller' : isDisputed ? 'Frozen Under Review' : 'Held for Inspection'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Demo Reference:</span>
              <span className="font-mono text-slate-600 truncate max-w-[130px]">
                {order.paymentDetails?.demoReference || 'ONTRA-DEMO-2026-849102'}
              </span>
            </div>
          </div>

          {/* Perspective-Specific Action Callout */}
          <div className="md:col-span-3 flex flex-col gap-2 justify-center">
            {viewPerspective === 'buyer' ? (
              <>
                {isSettled ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs justify-center shadow-xs"
                      leftIcon={<Star className="w-3.5 h-3.5 fill-white" />}
                    >
                      Rate & Review Seller
                    </Button>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Satisfaction Confirmed
                    </div>
                  </>
                ) : isDisputed ? (
                  <Link to="/disputes">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs justify-center shadow-xs"
                      leftIcon={<Scale className="w-3.5 h-3.5" />}
                    >
                      View Dispute Case
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsSatisfactionModalOpen(true)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs justify-center shadow-xs"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Confirm Satisfaction
                    </Button>
                    <Link to={`/disputes/new/${order.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs justify-center border-slate-300 hover:border-rose-300 hover:text-rose-700"
                        leftIcon={<AlertCircle className="w-3.5 h-3.5" />}
                      >
                        Report a Problem
                      </Button>
                    </Link>
                  </>
                )}
              </>
            ) : (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1 text-center">
                <span className="font-bold block">Seller Payout Status</span>
                <p className="text-[11px] leading-snug">
                  {isSettled
                    ? 'Funds disbursed to your verified bank account.'
                    : 'Payout triggers automatically upon buyer satisfaction or 48h timer expiration.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: The 9-Stage Visual Order Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">9-Stage Transaction Timeline</h3>
                <p className="text-xs text-slate-500">Chronological custody and fulfillment log.</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Stage {currentStageIndex + 1} of 9
              </span>
            </div>

            {/* Vertical Stepper Timeline */}
            <div className="relative pl-6 space-y-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {ORDER_TIMELINE_STAGES.map((item, idx) => {
                const isPassed = currentStageIndex > idx;
                const isCurrent = currentStageIndex === idx;
                const isUpcoming = currentStageIndex < idx;

                const description = isCourier ? item.courierDescription : item.handoverDescription;

                return (
                  <div key={item.stage} className="relative flex items-start gap-4">
                    {/* Circle Pin */}
                    <div
                      className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-900 text-white ring-4 ring-blue-100 animate-pulse'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-blue-900'
                              : isPassed
                              ? 'text-slate-900'
                              : 'text-slate-400'
                          }`}
                        >
                          {item.label}
                        </h4>

                        {isCurrent && (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            Current Stage
                          </span>
                        )}

                        {isPassed && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            Completed
                          </span>
                        )}
                      </div>

                      <p className={`text-xs leading-relaxed ${isUpcoming ? 'text-slate-400' : 'text-slate-600'}`}>
                        {description}
                      </p>

                      {/* Display inspection live timer if on inspection stage */}
                      {item.stage === 'inspection_in_progress' && isCurrent && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Clock className="w-4 h-4 text-amber-700" /> 48h Inspection Window Active:
                          </span>
                          <span className="font-mono font-bold text-amber-950 text-sm">
                            {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DEMO STAGE JUMPER (Convenient prototype demonstration) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-900 block">
                Simulate Order Stage Progression:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ORDER_TIMELINE_STAGES.map((s) => (
                  <button
                    key={s.stage}
                    type="button"
                    onClick={() => handleSimulateStageChange(s.stage)}
                    className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                      order.currentStage === s.stage
                        ? 'bg-blue-900 text-white border-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MANDATORY PROTECTED PAYMENT DISCLOSURE (Section E) */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-950">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-900" />
              <span>Platform Escrow Protection Rules</span>
            </div>
            <p className="leading-relaxed font-medium">
              "Your payment is processed through the platform's payment provider. Seller settlement follows the inspection and dispute-resolution rules of the transaction."
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Fulfillment Dossier & Counterparty Views (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Fulfillment Details: Courier vs Handover */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {isCourier ? 'Tracked Courier Logistics' : 'Direct Handover Protocol'}
              </h3>
              {isCourier ? <Truck className="w-4 h-4 text-blue-900" /> : <QrCode className="w-4 h-4 text-blue-900" />}
            </div>

            {isCourier ? (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Courier Workflow:</span>
                    <span className="font-bold text-slate-900">{order.shipping?.carrier || 'Blue Dart Air Express (Insured)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AWB / Tracking No.:</span>
                    <span className="font-mono font-bold text-blue-900">{order.shipping?.trackingNumber || 'BD-924180-BLR-JAI'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Insurance Coverage:</span>
                    <span className="font-mono text-emerald-700 font-semibold">{formatCurrency(order.agreedPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery Verification:</span>
                    <span className="font-semibold text-slate-900">PIN-Code & OTP Confirmation</span>
                  </div>
                </div>

                {order.deliveryAddress && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-slate-900 block">Destination Address:</span>
                    <p className="text-slate-700 font-medium">{order.deliveryAddress.fullName}</p>
                    <p className="text-slate-600">
                      {order.deliveryAddress.houseFlat ? `${order.deliveryAddress.houseFlat}, ` : ''}
                      {order.deliveryAddress.streetAddress}
                      {order.deliveryAddress.area ? `, ${order.deliveryAddress.area}` : ''}
                    </p>
                    <p className="text-slate-600">
                      {order.deliveryAddress.city}
                      {order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''} - {order.deliveryAddress.postalCode}, {order.deliveryAddress.country}
                    </p>
                  </div>
                )}

                <div className="pt-1">
                  <Link to={`/delivery/courier/${order.orderId || order.id}`}>
                    <Button variant="outline" size="sm" className="w-full justify-center text-xs font-semibold">
                      Open Courier Dispatch & Tracking Desk
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-1">
                  <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider block">
                    Buyer Authentication OTP
                  </span>
                  <span className="font-mono text-2xl font-bold tracking-widest text-blue-900 block">
                    {order.handoverDetails?.otpCode || '582-904'}
                  </span>
                  <p className="text-[11px] text-blue-800 leading-tight">
                    Show this 6-digit code to seller ONLY after you physically meet and receive the item.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-900 block">Coordinated Meeting Site:</span>
                  <p className="text-slate-800">{order.handoverDetails?.locationName || 'World Trade Park Central Atrium, Jaipur'}</p>
                  <p className="text-slate-500">{order.handoverDetails?.scheduledDate || 'Tomorrow at 14:00 IST'}</p>
                </div>

                <div className="pt-1">
                  <Link to={`/delivery/handover/${order.orderId || order.id}`}>
                    <Button variant="outline" size="sm" className="w-full justify-center text-xs font-semibold">
                      Open Full In-Person Handover Portal
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Section F: Buyer vs Seller Perspective Specifics */}
          {viewPerspective === 'buyer' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                Buyer Inspection Checklist
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Match serial number against masked listing record.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Inspect exterior for undocumented scratches or dents.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Verify all included accessories and manufacturer box.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Power on and test full optical/mechanical operation.</span>
                </li>
              </ul>
              <div className="pt-2 space-y-2">
                <Link to={`/inspection/${order.orderId || order.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center text-xs font-semibold text-blue-900 border-blue-200 hover:bg-blue-50"
                  >
                    Open 48-Hour Hands-On Inspection Workspace
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsSatisfactionModalOpen(true)}
                  disabled={isSettled}
                  className="w-full justify-center bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs"
                >
                  {isSettled ? 'Satisfaction Recorded' : 'Approve & Release Seller Payout'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                Seller Settlement & Payout Status
              </h3>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Gross Settlement:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(order.agreedPrice)}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Platform Selling Fee (0% Launch Promo):</span>
                  <span className="font-mono font-semibold text-emerald-700">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 font-bold">
                  <span className="text-emerald-900">Net Seller Payout:</span>
                  <span className="font-mono text-emerald-950">{formatCurrency(order.agreedPrice)}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Payout is routed via IMPS / NEFT / UPI directly to your verified Indian bank account upon inspection approval.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM SATISFACTION MODAL */}
      {isSatisfactionModalOpen && (
        <Modal
          isOpen={isSatisfactionModalOpen}
          onClose={() => setIsSatisfactionModalOpen(false)}
          title="Confirm Buyer Satisfaction"
          subtitle={`Releasing seller settlement for: ${order.productTitle}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Physical Inspection Verification
              </p>
              <p className="text-emerald-900 text-[11px] leading-relaxed">
                By confirming satisfaction, you certify that the product matches the listing condition and that you authorize the platform payment provider to release full settlement to {order.sellerName}.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1.5">
                Inspection Approval Notes (Optional)
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={satisfactionNotes}
                onChange={(e) => setSatisfactionNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsSatisfactionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                onClick={handleConfirmSatisfaction}
              >
                Release Payout to Seller
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* REPORT A PROBLEM / DISPUTE MODAL */}
      {isDisputeModalOpen && (
        <Modal
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          title="Report a Transaction Problem"
          subtitle="Immediately freezes seller settlement and assigns platform arbitration"
          maxWidth="md"
        >
          <form onSubmit={handleRaiseDispute} className="space-y-4 text-xs text-slate-700">
            <div>
              <label className="block font-semibold text-slate-900 mb-1.5">Primary Issue Category</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="item_not_as_described">Item not as described (undocumented defects / cosmetic wear)</option>
                <option value="damage_in_transit">Damaged in transit (carrier package crushed or compromised)</option>
                <option value="missing_accessories">Missing accessories / incomplete box contents</option>
                <option value="counterfeit_concern">Authenticity / counterfeit concern</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1.5">Detailed Description</label>
              <textarea
                rows={4}
                required
                placeholder="Explain the specific discrepancy between the received item and the seller's condition manifest..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              <strong>Arbitration Freeze:</strong> Submitting this report immediately freezes the {formatCurrency(order.agreedPrice)} seller payout. A neutral arbitrator will review within 24 hours.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDisputeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-rose-900 hover:bg-rose-950 text-white font-semibold">
                Freeze Settlement & File Report
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Verified Buyer Review & Rating Modal */}
      {isReviewModalOpen && order && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          transaction={order}
          onReviewSubmitted={() => {
            showToast('Review Submitted', 'Thank you! Your verified purchase review has been published.', 'success');
          }}
        />
      )}
    </div>
  );
};
