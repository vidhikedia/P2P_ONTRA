/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { transactionService } from '../services/transactionService.ts';
import { productService } from '../services/productService.ts';
import { Transaction, Product } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { Button } from '../components/ui/Button.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { useToast } from '../hooks/useToast.ts';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Truck,
  QrCode,
  FileText,
  Play,
  X,
  Maximize2,
  Calendar,
  AlertCircle,
  Wrench,
  Box,
  Shield,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Lock,
} from 'lucide-react';

export const BuyerInspectionPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Transaction | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Active Media Index for photo gallery & video
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Inspection Checklist verification states
  const [checklist, setChecklist] = useState({
    serialNumberMatch: true,
    cosmeticAppearanceMatch: true,
    mechanicalOperational: true,
    allAccessoriesPresent: true,
    originalInvoiceVerified: true,
  });

  // 48-Hour Inspection Deadline Countdown
  // Configurable example period of 48 hours
  const [countdown, setCountdown] = useState({ hours: 47, minutes: 28, seconds: 45 });
  const [inspectionState, setInspectionState] = useState<'active' | 'near_expiry' | 'expired' | 'settled'>('active');

  // Confirmation Dialog (Section D)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState<
    'item_not_as_described' | 'damage_in_transit' | 'counterfeit_concern' | 'missing_accessories'
  >('item_not_as_described');
  const [disputeText, setDisputeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setHasError(false);
      try {
        const idToLookup = orderId || 'ORD-89241';
        const orderRes = await transactionService.getTransactionById(idToLookup);
        if (orderRes.data) {
          setOrder(orderRes.data);
          if (orderRes.data.currentStage === 'seller_settlement_initiated') {
            setInspectionState('settled');
          }

          // Fetch original listing product dossier
          const prodRes = await productService.getProductById(orderRes.data.productId);
          if (prodRes.data) {
            setProduct(prodRes.data);
          }
        } else {
          // fallback
          const list = await transactionService.getTransactions();
          if (list.data && list.data.length > 0) {
            setOrder(list.data[0]);
            const prodRes = await productService.getProductById(list.data[0].productId);
            if (prodRes.data) setProduct(prodRes.data);
          } else {
            setHasError(true);
          }
        }
      } catch (err) {
        console.error('Failed to load inspection workspace', err);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  // Live timer countdown
  useEffect(() => {
    if (inspectionState !== 'active' && inspectionState !== 'near_expiry') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          const nextHours = prev.hours - 1;
          if (nextHours < 4) setInspectionState('near_expiry');
          return { hours: nextHours, minutes: 59, seconds: 59 };
        } else {
          // Expired
          setInspectionState('expired');
          return { hours: 0, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [inspectionState]);

  // LOADING STATE (Prompt Requirement E)
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-medium">Loading 48-hour hands-on buyer inspection workspace...</p>
      </div>
    );
  }

  // ERROR STATE (Prompt Requirement E)
  if (hasError || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to Load Inspection Record</h2>
        <p className="text-slate-600 text-sm">
          Could not locate active delivery confirmation or inspection window for #{orderId}.
        </p>
        <div className="pt-2">
          <Link to="/buyer/dashboard">
            <Button variant="primary">Return to Buyer Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const allChecksPassed =
    checklist.serialNumberMatch &&
    checklist.cosmeticAppearanceMatch &&
    checklist.mechanicalOperational &&
    checklist.allAccessoriesPresent &&
    checklist.originalInvoiceVerified;

  const galleryImages = product?.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [order.productImage, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'];

  // Handle Buyer Confirming Satisfaction
  const handleExecuteSatisfactionApproval = async () => {
    setIsSubmitting(true);
    try {
      const res = await transactionService.approveInspection(
        order.id,
        'Buyer thoroughly inspected product against manifest. Serial and operation confirmed without defect.'
      );
      if (res.data) {
        setOrder({ ...res.data });
        setInspectionState('settled');
        setIsConfirmationDialogOpen(false);
        showToast('Satisfaction Recorded', 'Seller settlement initiated via platform payment partner!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to record inspection satisfaction.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Dispute Filing
  const handleExecuteReportProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeText.trim()) {
      showToast('Description Required', 'Please detail the discrepancy or defect.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await transactionService.raiseDispute(order.id, disputeReason, disputeText);
      if (res.data) {
        setOrder({ ...res.data });
        setIsDisputeModalOpen(false);
        showToast('Problem Reported', 'Seller settlement paused. Case forwarded to arbitration officer.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to report issue.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate Expired State (Section E requirement)
  const handleSimulateExpiredState = async () => {
    try {
      const res = await transactionService.expireInspectionWindow(order.id);
      if (res.data) {
        setOrder({ ...res.data });
        setInspectionState('expired');
        showToast('Simulated Expiry', '48h window elapsed. Automatic seller settlement initiated.', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          to={`/order-tracking/${order.orderId || order.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Order Lifecycle</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">48-Hour Hands-On Inspection</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Order #{order.orderId || order.id} · Counterparty: <strong>{order.sellerName}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-900 px-3 py-1.5 rounded-lg border border-blue-200">
              Escrow Custody: {formatCurrency(order.agreedPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* MANDATORY PROMPT STATEMENT BANNER (Clear Inspection Guarantee) */}
      <div className="mb-8 p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
          <CheckCircle2 className="w-4 h-4" /> Physical Delivery Authenticated
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          "Your product has arrived. Please inspect it before confirming satisfaction."
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Delivery confirmation and buyer satisfaction are separate. Do not feel rushed. You have a full 48-hour examination window to verify the serial number, cosmetic condition, and operation before funds are released.
        </p>
      </div>

      {/* INSPECTION COUNTDOWN & REMINDER BANNER */}
      <div className="mb-8 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-mono ${
                inspectionState === 'settled'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : inspectionState === 'expired'
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : inspectionState === 'near_expiry'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {inspectionState === 'settled'
                ? 'Inspection Completed & Settled'
                : inspectionState === 'expired'
                ? '48h Window Expired (Auto-Settled)'
                : inspectionState === 'near_expiry'
                ? 'Urgent: Under 4 Hours Remaining'
                : 'Active 48-Hour Window'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Started upon {order.deliveryMethod === 'courier' ? 'courier signature' : 'OTP verification'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
            {inspectionState === 'settled'
              ? 'You approved the inspection manifest. Full seller settlement has been initiated.'
              : inspectionState === 'expired'
              ? 'The 48-hour period ended without a dispute filing. According to platform rules, automatic settlement was initiated.'
              : 'Test all functions thoroughly against the seller\'s dossier below. If you notice undisclosed flaws, click "Report a Problem" to freeze settlement.'}
          </p>
        </div>

        {/* Live Timer Display */}
        <div className="text-center sm:text-right p-4 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
            Time Remaining
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {inspectionState === 'settled'
              ? 'APPROVED'
              : inspectionState === 'expired'
              ? '00h 00m 00s'
              : `${String(countdown.hours).padStart(2, '0')}h ${String(countdown.minutes).padStart(2, '0')}m ${String(countdown.seconds).padStart(2, '0')}s`}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Auto-settles upon 00:00:00 expiry
          </span>
        </div>
      </div>

      {/* STATE TESTING CONTROLS (Demo Prototype Evaluation) */}
      <div className="mb-8 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
        <span className="font-semibold text-slate-700">Prototype Simulator:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => { setInspectionState('active'); setCountdown({ hours: 47, minutes: 28, seconds: 45 }); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              inspectionState === 'active' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            1. Active (48h)
          </button>
          <button
            type="button"
            onClick={() => { setInspectionState('near_expiry'); setCountdown({ hours: 2, minutes: 14, seconds: 12 }); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              inspectionState === 'near_expiry' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            2. Near-Expiry
          </button>
          <button
            type="button"
            onClick={handleSimulateExpiredState}
            className={`px-3 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              inspectionState === 'expired' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            3. Expired State
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmationDialogOpen(true)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              inspectionState === 'settled' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            4. Buyer Approved
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Media Gallery, Video Player, and Listing Dossier (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Photos & Video Comparison Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Original Listing Photos & Video</h3>
              <span className="text-xs text-slate-500 font-mono">Compare side-by-side</span>
            </div>

            {/* Main Media Box */}
            <div className="relative aspect-4/3 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              {isPlayingVideo && product?.videoUrl ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video src={product.videoUrl} controls autoPlay className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setIsPlayingVideo(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <img
                  src={galleryImages[activePhotoIndex]}
                  alt={order.productTitle}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Verified Serial Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-xs font-semibold text-slate-900 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Masked Serial: {product?.verification?.serialNumberMasked || 'SN-8924•••••'}</span>
              </div>
            </div>

            {/* Thumbnails + Video selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setIsPlayingVideo(false); setActivePhotoIndex(i); }}
                  className={`w-16 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    !isPlayingVideo && activePhotoIndex === i
                      ? 'border-blue-900 ring-1 ring-blue-900'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}

              {product?.videoUrl && (
                <button
                  type="button"
                  onClick={() => setIsPlayingVideo(true)}
                  className={`w-20 h-14 rounded-lg border-2 flex flex-col items-center justify-center transition-all shrink-0 cursor-pointer ${
                    isPlayingVideo ? 'bg-blue-950 text-white border-blue-900' : 'bg-slate-900 text-white border-slate-200'
                  }`}
                >
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <span className="text-[9px] font-bold uppercase mt-0.5">Video</span>
                </button>
              )}
            </div>
          </div>

          {/* Dossier Specifications & Expected Condition */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Expected Condition & Manifest
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Condition Grade:</span>
                <p className="font-bold text-slate-900 capitalize">
                  {product?.condition?.replace(/_/g, ' ') || 'Very Good (Documented Care)'}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {product?.conditionDetails || 'Minimal mechanical wear, inspected regularly.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Documented Blemishes / Scratches:</span>
                <p className="text-slate-600">
                  {product?.defectsAndScratches || 'No structural cracks. Documented micro hairline marks on baseplate.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Repairs & Replacements:</span>
                <p className="text-slate-600">
                  {product?.repairsAndReplacements || 'None. Original factory optics and internal components.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Original Invoice & GST Receipt:</span>
                <p className="font-semibold text-emerald-700">
                  {product?.hasOriginalInvoice ? 'Included in Package' : 'Not Included · Serial Authenticated'}
                </p>
              </div>
            </div>

            {/* Included Accessories */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Included Accessories Manifest:</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <ul className="space-y-1 text-slate-600">
                  {(product?.accessoriesIncluded || ['Original packaging presentation box', 'Standard power charger & cables', 'Manufacturer warranty booklet']).map((acc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Checklist & Decision Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Verification Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hands-On Inspection Checklist</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check off each item after physical hands-on verification.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <label className="p-3 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.serialNumberMatch}
                  onChange={(e) => setChecklist({ ...checklist, serialNumberMatch: e.target.checked })}
                  className="rounded border-slate-300 text-blue-900 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">1. Serial Number Match</span>
                  <p className="text-[11px] text-slate-500">Hardware serial matches masked listing verification.</p>
                </div>
              </label>

              <label className="p-3 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.cosmeticAppearanceMatch}
                  onChange={(e) => setChecklist({ ...checklist, cosmeticAppearanceMatch: e.target.checked })}
                  className="rounded border-slate-300 text-blue-900 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">2. Cosmetic Condition Match</span>
                  <p className="text-[11px] text-slate-500">No undisclosed dents, cracks, or heavy scratches.</p>
                </div>
              </label>

              <label className="p-3 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.mechanicalOperational}
                  onChange={(e) => setChecklist({ ...checklist, mechanicalOperational: e.target.checked })}
                  className="rounded border-slate-300 text-blue-900 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">3. Operational & Mechanical Function</span>
                  <p className="text-[11px] text-slate-500">Powered on, dials work, all optical/electronic features actuate.</p>
                </div>
              </label>

              <label className="p-3 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.allAccessoriesPresent}
                  onChange={(e) => setChecklist({ ...checklist, allAccessoriesPresent: e.target.checked })}
                  className="rounded border-slate-300 text-blue-900 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">4. All Accessories Present</span>
                  <p className="text-[11px] text-slate-500">Box, cables, adapters, and stated manuals are in the carton.</p>
                </div>
              </label>

              <label className="p-3 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.originalInvoiceVerified}
                  onChange={(e) => setChecklist({ ...checklist, originalInvoiceVerified: e.target.checked })}
                  className="rounded border-slate-300 text-blue-900 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">5. Documentation / Proof of Purchase</span>
                  <p className="text-[11px] text-slate-500">Invoice or manufacturer warranty certificate inspected.</p>
                </div>
              </label>
            </div>

            {/* Delivery Reference Log */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
              <span className="font-bold text-slate-900 block">Delivery Verification Record:</span>
              <p>Method: <strong>{order.deliveryMethod === 'courier' ? 'Insured Courier (Shiprocket-Compatible)' : 'Direct Handover (OTP)'}</strong></p>
              <p>Received by: {order.buyerName}</p>
              <p className="text-[11px] text-emerald-700 font-semibold">
                Physical delivery confirmed prior to inspection commencement.
              </p>
            </div>

            {/* Primary Action Buttons (Section C Actions) */}
            <div className="space-y-2.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                disabled={!allChecksPassed || inspectionState === 'settled'}
                onClick={() => setIsConfirmationDialogOpen(true)}
                className={`w-full justify-center text-xs font-semibold shadow-xs ${
                  allChecksPassed && inspectionState !== 'settled'
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {inspectionState === 'settled' ? 'Satisfaction Already Confirmed' : 'Confirm Satisfaction'}
              </Button>

              <Button
                variant="outline"
                size="md"
                disabled={inspectionState === 'settled'}
                onClick={() => setIsDisputeModalOpen(true)}
                className="w-full justify-center text-xs text-rose-700 border-slate-300 hover:bg-rose-50 hover:border-rose-300 font-semibold"
                leftIcon={<AlertTriangle className="w-4 h-4" />}
              >
                Report a Problem
              </Button>
            </div>
          </div>

          {/* PROTECTED PAYMENT EXPLANATION (Section E) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Platform Settlement Rules
            </span>
            <p className="text-slate-600 leading-relaxed font-medium">
              "Your payment is processed through the platform's payment provider. Seller settlement follows the inspection and dispute-resolution rules of the transaction."
            </p>
          </div>
        </div>
      </div>

      {/* INSPECTION CONFIRMATION DIALOG (Section D Requirement) */}
      {isConfirmationDialogOpen && (
        <Modal
          isOpen={isConfirmationDialogOpen}
          onClose={() => setIsConfirmationDialogOpen(false)}
          title="Confirm Inspection Satisfaction"
          subtitle={`Releasing seller settlement for: ${order.productTitle}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Buyer Inspection Declaration</span>
              </div>
              <p className="text-emerald-900 leading-relaxed">
                By clicking below, you certify that you have physically received and inspected the product, and you agree that it matches the transaction terms, serial records, and condition disclosures.
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold border-t border-emerald-200 pt-2">
                Upon confirmation, the platform payment provider will immediately initiate seller settlement ({formatCurrency(order.agreedPrice)}).
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Settlement Summary:</span>
              <div className="flex justify-between">
                <span>Agreed Item Price:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(order.agreedPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Seller Recipient:</span>
                <span>{order.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Settlement Status:</span>
                <span className="font-bold text-blue-900">Initiated upon confirmation</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsConfirmationDialogOpen(false)} disabled={isSubmitting}>
                Cancel & Continue Testing
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteSatisfactionApproval}
                disabled={isSubmitting}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
              >
                {isSubmitting ? 'Initiating Settlement...' : 'Yes, Confirm Satisfaction & Release Payout'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* REPORT A PROBLEM MODAL */}
      {isDisputeModalOpen && (
        <Modal
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          title="Report a Product Problem"
          subtitle="Immediately halts seller settlement and engages certified arbitrator"
          maxWidth="md"
        >
          <form onSubmit={handleExecuteReportProblem} className="space-y-4 text-xs text-slate-700">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Issue Category</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="item_not_as_described">Item not as described (undocumented defects / cosmetic flaws)</option>
                <option value="damage_in_transit">Transit damage (crushed carton, fractured components)</option>
                <option value="missing_accessories">Missing accessories or documents listed in dossier</option>
                <option value="counterfeit_concern">Authenticity / counterfeit serial concern</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Detailed Explanation</label>
              <textarea
                rows={4}
                required
                placeholder="Describe exactly what defect or discrepancy was discovered during your hands-on examination..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={disputeText}
                onChange={(e) => setDisputeText(e.target.value)}
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              <strong>Escrow Protection Freeze:</strong> Filing this report immediately halts the {formatCurrency(order.agreedPrice)} payout. A neutral ONTRA arbitrator will review within 24 hours.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDisputeModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                className="bg-rose-900 hover:bg-rose-950 text-white font-semibold"
              >
                {isSubmitting ? 'Submitting Report...' : 'Halt Settlement & File Report'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
