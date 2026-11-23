/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { disputeService, DISPUTE_REASONS_CONFIG } from '../services/disputeService.ts';
import { transactionService } from '../services/transactionService.ts';
import { DisputeCase, DisputeReason, DisputeStatus, Transaction } from '../types/index.ts';
import { formatCurrency, formatDate, formatDateTimeIST } from '../utils/formatters.ts';
import { Button } from '../components/ui/Button.tsx';
import { useToast } from '../hooks/useToast.ts';
import {
  Scale,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Upload,
  FileText,
  Image,
  Video,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Eye,
  Send,
  X,
  FileCheck2,
  UserCheck,
  Building2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const STATUS_BADGE_CONFIG: Record<
  DisputeStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  open: { label: 'Open', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  awaiting_seller_response: {
    label: 'Awaiting Seller Response',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  under_admin_review: {
    label: 'Under Admin Review',
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-200',
  },
  additional_evidence_required: {
    label: 'Additional Evidence Required',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
  },
};

export const DisputePage: React.FC = () => {
  const { disputeId, orderId } = useParams<{ disputeId?: string; orderId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isCreatingNew = location.pathname.includes('/new') || !disputeId;

  // Data states
  const [dispute, setDispute] = useState<DisputeCase | null>(null);
  const [order, setOrder] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states - Raising Dispute (Section A)
  const [selectedReason, setSelectedReason] = useState<DisputeReason>('undisclosed_defects');
  const [explanation, setExplanation] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
  ]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  ]);
  const [photoInputUrl, setPhotoInputUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seller response form states (Section B)
  const [sellerStatement, setSellerStatement] = useState('');
  const [sellerPhotos, setSellerPhotos] = useState<string[]>([]);
  const [sellerPhotoInput, setSellerPhotoInput] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (!isCreatingNew && disputeId) {
          const res = await disputeService.getDisputeById(disputeId);
          if (res.data) {
            setDispute(res.data);
            const ordRes = await transactionService.getTransactionById(res.data.orderId);
            if (ordRes.data) setOrder(ordRes.data);
          }
        } else {
          // Creating a new dispute for order
          const targetOrderId = orderId || 'ORD-89241';
          const ordRes = await transactionService.getTransactionById(targetOrderId);
          if (ordRes.data) {
            setOrder(ordRes.data);
          } else {
            const allOrd = await transactionService.getTransactions();
            if (allOrd.data && allOrd.data.length > 0) setOrder(allOrd.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load dispute data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [disputeId, orderId, isCreatingNew]);

  // Section A: Handle Buyer Dispute Submission
  const handleCreateDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (!explanation.trim()) {
      showToast('Explanation Required', 'Please provide detailed notes on the discrepancy.', 'warning');
      return;
    }

    if (uploadedPhotos.length === 0) {
      showToast('Evidence Required', 'Please attach at least one supporting photo.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await disputeService.createDispute({
        orderId: order.orderId || order.id,
        transactionId: order.id,
        productId: order.productId,
        productTitle: order.productTitle,
        productImage: order.productImage,
        agreedPrice: order.agreedPrice,
        currency: 'INR',
        buyerId: order.buyerId || 'usr_buyer_01',
        buyerName: order.buyerName || 'Ananya Sharma',
        sellerId: order.sellerId,
        sellerName: order.sellerName,
        reason: selectedReason,
        detailedExplanation: explanation,
        supportingPhotos: uploadedPhotos,
        supportingVideos: uploadedVideos,
      });

      if (res.data) {
        // Also pause settlement on transaction
        await transactionService.raiseDispute(order.id, 'item_not_as_described', explanation, uploadedPhotos);
        showToast('Complaint Submitted', 'Seller settlement held. Assigned case ID ' + res.data.id, 'success');
        navigate(`/disputes/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Submission Error', 'Failed to submit dispute complaint.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Section B: Handle Seller Rebuttal Submission
  const handleSellerResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispute) return;

    if (!sellerStatement.trim()) {
      showToast('Statement Required', 'Please provide your explanation or rebuttal.', 'warning');
      return;
    }

    setIsSubmittingResponse(true);
    try {
      const res = await disputeService.submitSellerResponse(dispute.id, sellerStatement, sellerPhotos);
      if (res.data) {
        setDispute({ ...res.data });
        showToast('Response Submitted', 'Statement recorded. Case advanced to Under Admin Review.', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to record response.', 'error');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleAddPhoto = () => {
    if (!photoInputUrl.trim()) return;
    setUploadedPhotos([...uploadedPhotos, photoInputUrl.trim()]);
    setPhotoInputUrl('');
    showToast('Photo Added', 'Supporting photograph attached.', 'info');
  };

  const handleAddSellerPhoto = () => {
    if (!sellerPhotoInput.trim()) return;
    setSellerPhotos([...sellerPhotos, sellerPhotoInput.trim()]);
    setSellerPhotoInput('');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-medium">Connecting to ONTRA Neutral Arbitration Desk...</p>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: REPORT A PROBLEM FORM (Section A)
  // ==========================================
  if (isCreatingNew) {
    if (!order) {
      return (
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Located</h2>
          <p className="text-slate-600 text-sm mb-6">Could not identify order for dispute filing.</p>
          <Link to="/buyer/dashboard">
            <Button variant="primary">Return to Buyer Dashboard</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
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
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-600" />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report a Problem & Raise Dispute</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Immediately freezes the {formatCurrency(order.agreedPrice)} seller settlement for neutral arbitrator review.
              </p>
            </div>
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200">
              Order #{order.orderId || order.id}
            </span>
          </div>
        </div>

        {/* Product Snapshot */}
        <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={order.productImage}
              alt={order.productTitle}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div>
              <h2 className="text-sm font-bold text-slate-900">{order.productTitle}</h2>
              <p className="text-xs text-slate-500">
                Seller: <strong>{order.sellerName}</strong> ({order.sellerLocation || 'Bengaluru, Karnataka'})
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Locked Escrow</span>
            <span className="font-mono font-bold text-slate-900 text-base">{formatCurrency(order.agreedPrice)}</span>
          </div>
        </div>

        {/* Dispute Form */}
        <form onSubmit={handleCreateDisputeSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            {/* 1. Dispute Reason Selection (All 8 reasons from Section A) */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                1. Select Specific Dispute Reason
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DISPUTE_REASONS_CONFIG.map((item) => {
                  const isSelected = selectedReason === item.reason;
                  return (
                    <div
                      key={item.reason}
                      onClick={() => setSelectedReason(item.reason)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-900 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="disputeReason"
                          checked={isSelected}
                          onChange={() => setSelectedReason(item.reason)}
                          className="text-blue-900 focus:ring-blue-900 mt-0.5"
                        />
                        <span className={`text-xs font-bold ${isSelected ? 'text-blue-950' : 'text-slate-900'}`}>
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 pl-5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Detailed Explanation */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                2. Detailed Explanation & Chronology
              </label>
              <textarea
                rows={4}
                required
                placeholder="Explain the specific issue encountered. Describe physical blemishes, optical haze, missing items, or functional failures not documented in the listing manifest..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Be specific and objective. This statement will be reviewed by the seller and certified arbitrator.
              </span>
            </div>

            {/* 3. Supporting Photos */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Supporting Photographic Evidence
              </label>
              <div className="flex flex-wrap gap-3">
                {uploadedPhotos.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">
                      Photo {idx + 1}
                    </span>
                  </div>
                ))}

                {/* Add Photo Input */}
                <div className="flex items-center gap-2 w-full pt-1">
                  <input
                    type="url"
                    placeholder="Paste image URL (or sample photo URL)..."
                    value={photoInputUrl}
                    onChange={(e) => setPhotoInputUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddPhoto}>
                    Add Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* 4. Supporting Videos */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                4. Supporting Video Evidence (Optional)
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                {uploadedVideos.map((vid, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-800">
                      <Video className="w-4 h-4 text-blue-900" />
                      <span className="truncate max-w-sm font-mono text-[11px]">{vid}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedVideos(uploadedVideos.filter((_, i) => i !== idx))}
                      className="text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <span className="text-[11px] text-slate-500 block">
                  Demonstrate mechanical actuation, audio rattles, power failure, or light pass-through.
                </span>
              </div>
            </div>
          </div>

          {/* Submission Banner */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs text-rose-950">
            <span className="font-bold flex items-center gap-1.5 text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-700" /> Platform Settlement Protection
            </span>
            <p className="leading-relaxed text-rose-900">
              Submitting this complaint immediately pauses the {formatCurrency(order.agreedPrice)} seller payout. The seller will be given 24 hours to review your evidence and submit a response before senior neutral arbitrator review.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Link to={`/order-tracking/${order.orderId || order.id}`}>
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="danger"
              size="md"
              disabled={isSubmitting}
              className="bg-rose-900 hover:bg-rose-950 text-white font-semibold shadow-xs"
              leftIcon={<ShieldAlert className="w-4 h-4" />}
            >
              {isSubmitting ? 'Filing Complaint...' : 'Submit Complaint & Freeze Settlement'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: DISPUTE TRACKING & SELLER RESPONSE (Sections B & C)
  // ==========================================
  if (!dispute) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Dispute Record Not Found</h2>
        <p className="text-slate-600 text-sm mb-6">Could not locate dispute case #{disputeId}.</p>
        <Link to="/buyer/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const badge = STATUS_BADGE_CONFIG[dispute.currentStatus] || STATUS_BADGE_CONFIG.open;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/order-tracking/${dispute.orderId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Order #{dispute.orderId}</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-6 h-6 text-blue-900" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Dispute Tracking Case #{dispute.id}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Order: <span className="font-mono font-bold text-slate-800">#{dispute.orderId}</span> · Raised on {formatDate(dispute.dateRaised)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              Status: {badge.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Dispute Details, Evidence & Seller Rebuttal (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dispute Reason & Buyer Complaint */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                Reason: {dispute.reasonLabel}
              </span>
              <span className="text-xs text-slate-500">
                Claimed by: <strong>{dispute.buyerName}</strong>
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Buyer Detailed Explanation
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                "{dispute.detailedExplanation}"
              </p>
            </div>

            {/* Buyer Evidence Media Gallery */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Buyer Evidence Attached ({dispute.buyerEvidence.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dispute.buyerEvidence.map((ev) => (
                  <div key={ev.id} className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                    {ev.type === 'photo' ? (
                      <div className="aspect-4/3 rounded-lg overflow-hidden border border-slate-200">
                        <img src={ev.url} alt={ev.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-4/3 rounded-lg bg-black flex items-center justify-center text-white">
                        <Video className="w-6 h-6 text-emerald-400" />
                      </div>
                    )}
                    <span className="font-mono text-[10px] text-slate-600 truncate block mt-1">{ev.name}</span>
                    {ev.caption && <p className="text-[10px] text-slate-500 line-clamp-2">{ev.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION B: SELLER RESPONSE MODULE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-900" />
                <span>Seller Response & Documentation</span>
              </h3>
              <span className="text-xs text-slate-500">
                Seller: <strong>{dispute.sellerName}</strong>
              </span>
            </div>

            {dispute.sellerResponse ? (
              /* Already responded view */
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between font-bold text-blue-950">
                    <span>Seller Statement:</span>
                    <span className="font-mono font-normal text-[11px] text-slate-500">
                      {formatDate(dispute.sellerResponse.respondedAt)}
                    </span>
                  </div>
                  <p className="leading-relaxed text-blue-900">
                    "{dispute.sellerResponse.statement}"
                  </p>
                </div>

                {dispute.sellerResponse.evidence.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 block">Seller Counter-Evidence Documents:</span>
                    <div className="flex flex-wrap gap-2">
                      {dispute.sellerResponse.evidence.map((doc) => (
                        <div key={doc.id} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-900" />
                          <span className="font-mono text-[11px]">{doc.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Seller submission form (Section B) */
              <form onSubmit={handleSellerResponseSubmit} className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  As the seller, you have the right to respond to the buyer's claims and present matching pre-shipment photographs or service paperwork.
                </p>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Your Official Statement / Rebuttal
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain why the product matches the pre-shipment manifest, or propose a resolution (e.g. partial reimbursement or return authorization)..."
                    value={sellerStatement}
                    onChange={(e) => setSellerStatement(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-slate-900">
                    Upload Pre-Shipment Proof / CLA Receipts (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image or document URL..."
                      value={sellerPhotoInput}
                      onChange={(e) => setSellerPhotoInput(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddSellerPhoto}>
                      Attach
                    </Button>
                  </div>
                  {sellerPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {sellerPhotos.map((p, i) => (
                        <span key={i} className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {p.slice(0, 30)}...
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmittingResponse}
                  className="bg-blue-900 hover:bg-blue-950 font-semibold text-xs"
                >
                  {isSubmittingResponse ? 'Submitting Statement...' : 'Submit Official Seller Response'}
                </Button>
              </form>
            )}
          </div>

          {/* ADMIN DECISION BOX (IF DECIDED) */}
          {dispute.adminDecision && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-xs space-y-3 text-xs text-emerald-950">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-emerald-900">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  Neutral Arbitration Decision
                </span>
                <span className="font-mono text-[11px] text-emerald-800">
                  Arbitrator: {dispute.adminDecision.arbitratorName}
                </span>
              </div>

              <div>
                <span className="font-bold block text-sm">
                  Ruling: {dispute.adminDecision.decision.replace(/_/g, ' ').toUpperCase()}
                </span>
                <p className="mt-1 leading-relaxed text-emerald-900">
                  "{dispute.adminDecision.reasoning}"
                </p>
                {dispute.adminDecision.refundAmount && (
                  <p className="mt-2 font-mono font-bold text-sm text-emerald-950">
                    Authorized Refund: {formatCurrency(dispute.adminDecision.refundAmount)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Chronological Resolution Timeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Resolution Timeline</h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="relative pl-5 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {dispute.resolutionTimeline.map((item, idx) => (
                <div key={item.id || idx} className="relative flex items-start gap-3">
                  <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-blue-900 ring-4 ring-blue-100" />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-mono text-[10px] text-slate-400 block">
                      {formatDateTimeIST(item.timestamp)}
                    </span>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{item.description}</p>
                    <span className="text-[10px] font-semibold text-slate-400 block pt-0.5">
                      Actor: {item.actorName} ({item.actor})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick link to Admin Interface */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-slate-900 block">Platform Governance Note:</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              ONTRA compliance officers inspect pre-shipment evidence objectively. Neither buyer nor seller is automatically favoured.
            </p>
            <Link to="/admin/dashboard" className="text-blue-900 hover:underline font-semibold text-xs flex items-center gap-1 pt-1">
              <span>View in Admin Arbitration Desk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
