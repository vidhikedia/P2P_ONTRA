/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService.ts';
import { Product } from '../types/index.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';
import { CONDITION_LABELS } from '../utils/statusHelpers.ts';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../hooks/useToast.ts';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { 
  ShieldCheck, 
  Heart, 
  Star, 
  MapPin, 
  FileText, 
  Truck, 
  QrCode, 
  Lock, 
  MessageSquare, 
  CheckCircle2, 
  Maximize2, 
  Play, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Wrench, 
  Box, 
  Shield, 
  HelpCircle, 
  ArrowLeft,
  X,
  Send,
  Building2,
  Camera,
  ZoomIn,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Modals
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [offerNote, setOfferNote] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'seller',
      time: 'Yesterday 18:20',
      text: 'Hello! All pre-shipment evidence photos are verified. Let me know if you would like video tests of any specific mechanical angle.',
    }
  ]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productService.getProductById(id).then((res) => {
      setProduct(res.data);
      if (res.data) {
        setOfferAmount(res.data.minOfferAllowed || res.data.askingPrice);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        Loading verified product dossier...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested verified listing is no longer available in the active catalog.
        </p>
        <Link to="/explore">
          <Button variant="primary" size="md">
            Return to Explore
          </Button>
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const conditionMeta = CONDITION_LABELS[product.condition];
  const allImages = product.galleryImages && product.galleryImages.length > 0 
    ? product.galleryImages 
    : [product.featuredImage];
  const activeImage = allImages[activeMediaIndex] || product.featuredImage;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const newMsg = {
      sender: 'buyer',
      time: 'Just now',
      text: chatMessage,
    };
    setChatHistory((prev) => [...prev, newMsg]);
    setChatMessage('');
    showToast('Message Transmitted', `Secure contract message sent to ${product.sellerName}.`, 'success');
  };

  const handleConfirmOffer = async () => {
    if (!product) return;
    if (offerAmount <= 0) {
      showToast('Invalid Amount', 'Please specify a positive offer amount.', 'error');
      return;
    }
    if (product.minOfferAllowed && offerAmount < product.minOfferAllowed) {
      showToast('Offer Below Floor', `The seller specified a minimum binding offer of ${formatCurrency(product.minOfferAllowed, product.currency)}.`, 'warning');
      return;
    }

    setSubmittingOffer(true);
    try {
      await productService.submitOffer(product.id, offerAmount, offerNote);
      setIsOfferModalOpen(false);
      showToast(
        'Binding Offer Lodged',
        `Your offer of ${formatCurrency(offerAmount, product.currency)} has been submitted to ${product.sellerName} with escrow protection.`,
        'success'
      );
    } catch (err: unknown) {
      showToast('Offer Error', err instanceof Error ? err.message : 'Could not submit offer.', 'error');
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/explore" className="hover:text-slate-900 transition-colors">Explore</Link>
        <span>/</span>
        <Link to={`/explore?category=${product.category}`} className="hover:text-slate-900 transition-colors capitalize">
          {product.category.replace(/_/g, ' ')}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.brand} {product.model}</span>
      </nav>

      {/* TOP SECTION: Split Grid (Left: Gallery & Video | Right: Contiguous Purchase Module) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Media Gallery & Video Player (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Media Viewer */}
          <div className="relative aspect-4/3 w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            {showVideo && product.videoUrl ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  src={product.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setShowVideo(false)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                  title="Close Video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {!imageErrors[activeImage] ? (
                  <img
                    src={activeImage}
                    alt={`${product.title} - Photo ${activeMediaIndex + 1}`}
                    referrerPolicy="no-referrer"
                    onError={() => setImageErrors((prev) => ({ ...prev, [activeImage]: true }))}
                    className="w-full h-full object-cover transition-opacity duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-6">
                    <Camera className="w-12 h-12 mb-3 stroke-1 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">{product.brand} {product.model}</span>
                    <span className="text-xs text-slate-500 mt-1">Realistic peer-to-peer seller photography</span>
                  </div>
                )}

                {/* Full-screen Lightbox Zoom Button */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer shadow-sm"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Inspect Full-Res ({activeMediaIndex + 1}/{allImages.length})</span>
                </button>

                {/* Top Overlay Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                  {product.verification.serialVerified && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-xs font-semibold text-slate-900 shadow-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Serial: {product.verification.serialNumberMasked}</span>
                    </div>
                  )}

                  <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-xs font-medium text-white shadow-xs">
                    Photo {activeMediaIndex + 1} of {allImages.length}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Thumbnails Strip & Video Player Tab */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setShowVideo(false);
                  setActiveMediaIndex(idx);
                }}
                className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  !showVideo && activeMediaIndex === idx
                    ? 'border-slate-900 ring-2 ring-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                }`}
                title={`View Photo ${idx + 1}`}
              >
                {!imageErrors[img] ? (
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    onError={() => setImageErrors((prev) => ({ ...prev, [img]: true }))}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                    <Camera className="w-4 h-4" />
                  </div>
                )}
                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-slate-950/70 text-[9px] font-mono text-white leading-none">
                  {idx + 1}
                </span>
              </button>
            ))}

            {/* Video Thumbnail Button if exists */}
            {product.videoUrl && (
              <button
                type="button"
                onClick={() => setShowVideo(true)}
                className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 flex flex-col items-center justify-center transition-all shrink-0 cursor-pointer ${
                  showVideo
                    ? 'border-blue-900 bg-blue-950 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Play className="w-4 h-4 text-emerald-400 mb-0.5 fill-emerald-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Video Test</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Contiguous Purchase Module (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
          {/* Header Title & Brand */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                {product.brand} · {product.model}
              </span>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  isSaved
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Pricing & Value Comparison */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {formatCurrency(product.askingPrice, product.currency)}
              </span>
              {product.originalRetailPrice > product.askingPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                    {formatCurrency(product.originalRetailPrice, product.currency)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Save {Math.round(((product.originalRetailPrice - product.askingPrice) / product.originalRetailPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Escrow custody fee included · Payout released only after your 48-hour physical inspection
            </p>
          </div>

          {/* Authentic Peer-to-Peer Condition Scale */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Disclosed Condition:</span>
              <span className={`font-bold ${
                product.condition === 'for_parts'
                  ? 'text-amber-700'
                  : product.condition === 'fair'
                  ? 'text-orange-700'
                  : 'text-slate-900'
              }`}>
                {conditionMeta.label}
              </span>
            </div>

            {/* Visual condition step bar */}
            <div className="grid grid-cols-5 gap-1.5 pt-0.5">
              {[
                { key: 'like_new', label: 'Like New' },
                { key: 'excellent', label: 'Excellent' },
                { key: 'good', label: 'Good' },
                { key: 'fair', label: 'Fair' },
                { key: 'for_parts', label: 'For Parts' }
              ].map((step) => {
                const isCurrent =
                  product.condition === step.key ||
                  (step.key === 'like_new' && product.condition === 'mint_in_box') ||
                  (step.key === 'excellent' && product.condition === 'very_good');
                return (
                  <div key={step.key} className="space-y-1 text-center">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isCurrent
                          ? product.condition === 'for_parts'
                            ? 'bg-amber-600'
                            : product.condition === 'fair'
                            ? 'bg-orange-500'
                            : 'bg-slate-900'
                          : 'bg-slate-200'
                      }`}
                    />
                    <span className={`block text-[10px] leading-tight truncate ${isCurrent ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-600 leading-snug pt-0.5">
              {conditionMeta.description}
            </p>
          </div>

          {/* Condition & Spec Summary Rows */}
          <div className="divide-y divide-slate-100 text-xs">
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">Condition Grade</span>
              <span className="font-semibold text-slate-900">{conditionMeta.label}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">Original Invoice</span>
              <span className={`font-semibold ${product.hasOriginalInvoice ? 'text-emerald-700' : 'text-slate-600'}`}>
                {product.hasOriginalInvoice ? 'Available & Included' : 'Not Included'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">Physical Inspection</span>
              <span className="font-semibold text-slate-900">48-Hour Hands-On Window</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">Location</span>
              <span className="font-medium text-slate-700">{product.sellerLocation}</span>
            </div>
          </div>

          {/* Action CTAs: Buy Now, Make an Offer, Chat with Seller */}
          <div className="space-y-2.5 pt-1">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center bg-slate-900 hover:bg-slate-800 font-semibold shadow-xs"
              onClick={() => navigate(`/checkout/${product.id}`)}
              leftIcon={<Lock className="w-4 h-4 text-emerald-400" />}
            >
              Buy Now (Pay Through Escrow)
            </Button>

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                size="md"
                className="justify-center font-semibold text-slate-800 hover:bg-slate-50"
                onClick={() => setIsOfferModalOpen(true)}
              >
                Make an Offer
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="justify-center font-medium bg-slate-100 hover:bg-slate-200 text-slate-800"
                onClick={() => setIsChatOpen(true)}
                leftIcon={<MessageSquare className="w-3.5 h-3.5 text-slate-600" />}
              >
                Chat with Seller
              </Button>
            </div>
          </div>

          {/* Seller Snapshot Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0">
                {product.sellerName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900">{product.sellerName}</p>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-800">{product.sellerRating}</span>
                  <span>·</span>
                  <span>{product.sellerCompletedTransactions || 42} sales</span>
                </div>
              </div>
            </div>

            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ID Verified
            </span>
          </div>
        </div>
      </div>

      {/* COMPLETE PRODUCT INFORMATION (Restructured into 3 Logical Sections + Description) */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-8">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Verified Specification
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Complete Product Dossier & Verified Condition
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Every listing on ONTRA requires strict disclosure of physical condition, provenance, and defects.
          </p>
        </div>

        {/* 1. Overview & Description */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <span>Product Description & Context</span>
          </h3>
          <p className="text-xs leading-relaxed text-slate-700">
            {product.conditionDetails} {product.subtitle}
          </p>
        </div>

        {/* Structured 3-Column / 3-Card Manifest Grouping */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: Provenance & Usage History */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Provenance & Usage</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Original Purchase Date</span>
                <span className="font-semibold text-slate-900">{product.purchaseDate || 'May 2023'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Usage Duration</span>
                <span className="font-semibold text-slate-900">{product.usageDuration || 'Approx. 5-7 months on rotation'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Original Retail Price</span>
                <span className="font-semibold text-slate-900 font-mono">{formatCurrency(product.originalRetailPrice, product.currency)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Reason for Selling</span>
                <span className="text-slate-700">{product.reasonForSelling || 'Upgrading equipment; rotating personal collection.'}</span>
              </div>
            </div>
          </div>

          {/* Card B: Physical Condition & Mechanics */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Condition & Mechanics</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Working Condition</span>
                <span className="font-semibold text-slate-900 leading-snug block mt-0.5">
                  {product.workingConditionDetails || '100% functional, all mechanical components and dials verified.'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Scratches & Physical Blemishes</span>
                <span className="text-slate-700 leading-snug block mt-0.5">
                  {product.defectsAndScratches || 'No structural damage. Documented micro-wear only as detailed in evidence photos.'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Repairs & Replacements</span>
                <span className="text-slate-700 leading-snug block mt-0.5">
                  {product.repairsAndReplacements || 'None. Completely original factory internal components.'}
                </span>
              </div>
            </div>
          </div>

          {/* Card C: Package, Warranty & Documents */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Box className="w-3.5 h-3.5 text-slate-600" />
              <span>Package & Verification</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium mb-1">Accessories Included</span>
                <ul className="space-y-1 text-slate-700">
                  {(product.accessoriesIncluded || ['Original packaging and presentation box', 'Standard manufacturer cables & documentation']).map((acc, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Warranty Coverage</span>
                <span className="text-slate-700 block mt-0.5">{product.warrantyStatus || 'Valid factory / service warranty transferable to buyer.'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Invoice Status</span>
                <span className={`block mt-0.5 font-medium ${product.hasOriginalInvoice ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {product.hasOriginalInvoice 
                    ? 'Original printed GST / retail tax invoice included in package.' 
                    : 'Original receipt not available. Authentic serial verified via manufacturer registry.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Angle Photo Evidence & Defect Disclosures Gallery */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-700" />
                <span>Multi-Angle Inspection & Defect Evidence ({(product.evidencePhotos?.length || allImages.length)} Photographs)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic photographs uploaded by seller to verify physical condition, cosmetic flaws, and included accessories.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
              ✓ Verified Against Escrow Checklist
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(product.evidencePhotos && product.evidencePhotos.length > 0 
              ? product.evidencePhotos 
              : allImages.map((img, i) => ({ id: `ev_gen_${i}`, url: img, label: `Angle #${i + 1} - Physical Inspection Photo` }))
            ).map((ev, index) => (
              <div
                key={ev.id || index}
                onClick={() => {
                  const targetIdx = allImages.findIndex((im) => im === ev.url);
                  if (targetIdx !== -1) setActiveMediaIndex(targetIdx);
                  setIsLightboxOpen(true);
                }}
                className="group relative rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col"
              >
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={ev.url}
                    alt={ev.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                  />
                  <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
                    Photo {index + 1}
                  </span>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                  <p className="text-xs font-semibold text-slate-900 leading-snug">
                    {ev.label}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Disclosed
                    </span>
                    <span className="text-slate-400 group-hover:text-slate-900 font-medium transition-colors">
                      Tap to zoom →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Defect summary callout if disclosed */}
          {product.defectsAndScratches && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1 text-slate-700">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Honest Pre-Owned Condition & Wear Disclosure:
              </span>
              <p className="text-slate-600 leading-relaxed pl-5">
                "{product.defectsAndScratches}" — Please inspect these exact areas in the photos above and during your 48-hour hands-on window before approving escrow payout.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SELLER DOSSIER & DELIVERY PROVISIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seller Information */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Seller Dossier & Reputation</h3>
            <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> ID Verified Member
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-base flex items-center justify-center shrink-0">
              {product.sellerName.charAt(0)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">{product.sellerName}</p>
              <p className="text-xs text-slate-500">
                {product.sellerLocation} · Member since {product.sellerMemberSince || 'October 2023'}
              </p>
              <div className="flex items-center gap-2 text-xs pt-1">
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {product.sellerRating}
                </span>
                <span>·</span>
                <span className="text-slate-600 font-mono">{product.sellerCompletedTransactions || 42} completed trades</span>
                <span>·</span>
                <span className="font-bold text-emerald-800">{product.sellerTrustScore}% Trust Score</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <p className="font-semibold text-slate-900 mb-0.5">ONTRA Seller Covenant:</p>
            <p className="leading-relaxed">
              This seller has accepted the platform escrow agreement. Payouts are systematically delayed until your 48-hour physical inspection passes without defects.
            </p>
          </div>
        </div>

        {/* F. Delivery Information (Privacy compliant) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Delivery & Handover Options</h3>
            <span className="text-xs text-slate-500">Privacy Protected</span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            {/* Courier */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <Truck className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">1. Tracked Insured Courier (Shiprocket-Compatible)</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Insured for full declared value ({formatCurrency(product.askingPrice, product.currency)}). PIN-code tracked dispatch with doorstep confirmation across India.
                </p>
              </div>
            </div>

            {/* Direct Handover */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <QrCode className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">2. Direct Physical Handover with OTP</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Available in {product.approximateLocation || product.sellerLocation}. Exchange verified with 6-digit one-time code.
                </p>
              </div>
            </div>

            {/* Privacy notice */}
            <div className="text-[11px] text-slate-500 flex items-start gap-2 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                To safeguard member privacy, exact street addresses are never published. Coordinate direct handover locations inside our encrypted platform chat.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN IMAGE LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between text-white text-xs z-10 max-w-5xl">
            <div className="flex items-center gap-2">
              <span className="font-bold">{product.brand} {product.model}</span>
              <span className="text-white/50">·</span>
              <span className="text-white/80">Photo {activeMediaIndex + 1} of {allImages.length}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Central Image Viewer with Prev / Next Navigation */}
          <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-2">
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                className="absolute left-2 sm:left-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer backdrop-blur-xs"
                title="Previous Photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="max-w-4xl max-h-[75vh] overflow-hidden rounded-xl">
              <img
                src={activeImage}
                alt={`${product.title} - View ${activeMediaIndex + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            {allImages.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveMediaIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 sm:right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer backdrop-blur-xs"
                title="Next Photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveMediaIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  activeMediaIndex === idx
                    ? 'border-white ring-2 ring-white scale-105'
                    : 'border-white/20 hover:border-white/60 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAKE AN OFFER MODAL */}
      {isOfferModalOpen && (
        <Modal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          title={`Submit Offer on ${product.brand} ${product.model}`}
          subtitle={`Asking Price: ${formatCurrency(product.askingPrice)} · 48h Inspection Guaranteed`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <Input
              label="Your Offer Amount (INR ₹)"
              type="number"
              min={product.minOfferAllowed || 500}
              max={product.askingPrice}
              value={offerAmount}
              onChange={(e) => setOfferAmount(Number(e.target.value))}
              helperText={`Minimum allowed offer is ${formatCurrency(product.minOfferAllowed || 500, product.currency)}`}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Note to Seller (Optional)
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                rows={3}
                placeholder="Include questions about packaging, CLA receipts, or local pickup preferences..."
                value={offerNote}
                onChange={(e) => setOfferNote(e.target.value)}
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Binding Offer Term:</p>
              <p className="text-[11px] mt-0.5">
                If the seller accepts, the price is locked and you will have 24 hours to fund the escrow deposit.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsOfferModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 font-semibold"
                onClick={handleConfirmOffer}
                disabled={submittingOffer}
              >
                {submittingOffer ? 'Submitting...' : 'Submit Binding Offer'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CHAT WITH SELLER DIALOG */}
      {isChatOpen && (
        <Modal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          title={`Encrypted Contract Chat with ${product.sellerName}`}
          subtitle={`Item: ${product.brand} ${product.model} · All communications logged for arbitration protection`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            {/* Chat Messages Log */}
            <div className="h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'buyer' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5">{msg.time}</span>
                  <div
                    className={`p-2.5 rounded-lg max-w-xs leading-relaxed ${
                      msg.sender === 'buyer'
                        ? 'bg-slate-900 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message to the seller..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <Button type="submit" variant="primary" size="sm" className="bg-slate-900 hover:bg-slate-800 shrink-0">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>

            <p className="text-[10px] text-slate-400 text-center">
              Off-platform UPI transfers, direct bank payments, and personal account sharing are prohibited under ONTRA safety rules.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
