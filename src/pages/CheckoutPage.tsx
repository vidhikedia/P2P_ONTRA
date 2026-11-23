/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/productService.ts';
import { transactionService } from '../services/transactionService.ts';
import { Product, OrderDeliveryAddress, OrderHandoverDetails } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { validateCheckoutAddress, validateHandoverDetails } from '../utils/validators.ts';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { useToast } from '../hooks/useToast.ts';
import {
  ShieldCheck,
  Truck,
  QrCode,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delivery method: courier vs direct handover
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'direct_handover'>('courier');

  // Negotiated price override from query params (e.g. from offer acceptance)
  const negotiatedPriceParam = searchParams.get('negotiatedPrice');
  const offerIdParam = searchParams.get('offerId');

  // Form states - Delivery Address (Indian Market Format, Jaipur Launch Default)
  const [address, setAddress] = useState<OrderDeliveryAddress>({
    fullName: 'Ananya Sharma',
    houseFlat: 'Flat 304, Pearl Residency',
    streetAddress: 'Prithviraj Road, C-Scheme',
    area: 'C-Scheme',
    city: 'Jaipur',
    state: 'Rajasthan',
    postalCode: '302001',
    country: 'India',
    phone: '+91 98290 45120',
  });

  // Form states - Handover Details (Jaipur Launch Location)
  const [handoverDetails, setHandoverDetails] = useState<OrderHandoverDetails>({
    locationName: 'World Trade Park Central Atrium (Malviya Nagar, Jaipur)',
    scheduledDate: 'Tomorrow at 14:00 IST',
    otpCode: Math.floor(100000 + Math.random() * 900000).toString(),
    instructions: 'Exchange to take place in well-lit public area. Buyer will inspect exterior before confirming 6-digit OTP exchange.',
  });

  // Buyer agreement checkbox
  const [termsAgreed, setTermsAgreed] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const targetId = productId || 'prod_leica_m6';
        const res = await productService.getProductById(targetId);
        if (res.data) {
          setProduct(res.data);
        } else {
          // fallback to first active product
          const allRes = await productService.getProducts();
          if (allRes.data && allRes.data.length > 0) {
            setProduct(allRes.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load product for checkout', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-medium">Initializing secure checkout session...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-600 text-sm mb-6">The listing you are trying to purchase is no longer available.</p>
        <Link to="/explore">
          <Button variant="primary">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  // Price calculations (INR)
  const originalListingPrice = product.askingPrice;
  const agreedPrice = negotiatedPriceParam ? parseFloat(negotiatedPriceParam) : product.askingPrice;
  const isNegotiated = agreedPrice < originalListingPrice;
  const courierFee = deliveryMethod === 'courier' ? (product.insuredShippingCost || 299) : 0;
  const platformFee = Math.round(agreedPrice * 0.015);
  const totalAmountPayable = agreedPrice + courierFee + platformFee;

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAgreed) {
      showToast('Agreement Required', 'Please confirm you understand the payment protection rules.', 'warning');
      return;
    }

    if (deliveryMethod === 'courier') {
      const val = validateCheckoutAddress(address);
      if (!val.isValid) {
        showToast('Incomplete Address', Object.values(val.errors)[0], 'warning');
        return;
      }
    } else {
      const val = validateHandoverDetails(handoverDetails);
      if (!val.isValid) {
        showToast('Incomplete Meeting Plan', Object.values(val.errors)[0], 'warning');
        return;
      }
    }

    setSubmitting(true);
    try {
      const orderRes = await transactionService.createCheckoutOrder({
        productId: product.id,
        productTitle: product.title,
        productImage: (product.galleryImages && product.galleryImages[0]) || product.featuredImage,
        buyerId: 'usr_buyer_01',
        buyerName: address.fullName,
        buyerEmail: 'ananya.sharma@ontra.in',
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        sellerLocation: product.sellerLocation,
        sellerTrustScore: product.sellerTrustScore,
        sellerRating: product.sellerRating,
        originalListingPrice,
        agreedPrice,
        deliveryCharge: courierFee,
        platformFee,
        totalAmountPayable,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'courier' ? address : undefined,
        handoverDetails: deliveryMethod === 'direct_handover' ? handoverDetails : undefined,
      });

      if (orderRes.data) {
        showToast('Checkout Initialized', 'Proceeding to secure payment authorization.', 'success');
        navigate(`/payment/${orderRes.data.orderId || orderRes.data.id}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to initialize order checkout.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Top Breadcrumb & Title */}
      <div className="mb-6">
        <Link
          to={`/product/${product.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Product Details</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Checkout</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review transaction details, select fulfillment, and proceed to payment authorization.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Step 1 of 3: Checkout Terms</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleProceedToPayment}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Delivery Choice & Fulfillment Information (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Fulfillment Method Selection */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">1. Select Fulfillment Method</h2>
                  <p className="text-xs text-slate-500">Choose how you will receive this item from the seller.</p>
                </div>
                <span className="text-xs font-semibold text-slate-900 font-mono">Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Option 1: Courier */}
                <div
                  onClick={() => setDeliveryMethod('courier')}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === 'courier'
                      ? 'border-slate-900 bg-slate-50/80 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${deliveryMethod === 'courier' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Tracked Courier</p>
                        <p className="text-xs text-slate-500">Shiprocket-Compatible Insured</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {formatCurrency(product.insuredShippingCost || 299)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    Doorstep PIN-verified delivery. Insured for full declared value of {formatCurrency(agreedPrice)}.
                  </p>
                </div>

                {/* Option 2: Direct Handover */}
                <div
                  onClick={() => setDeliveryMethod('direct_handover')}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === 'direct_handover'
                      ? 'border-slate-900 bg-slate-50/80 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${deliveryMethod === 'direct_handover' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Direct Handover</p>
                        <p className="text-xs text-slate-500">OTP-Verified Meetup</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Free
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    Meet seller in {product.sellerLocation}. Item exchanged using a secure 6-digit one-time code.
                  </p>
                </div>
              </div>

              {/* Delivery Instructions Callout */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Info className="w-4 h-4 text-blue-900" />
                  <span>
                    {deliveryMethod === 'courier'
                      ? 'Courier Delivery Instructions & Protocol'
                      : 'Direct Physical Handover Protocol & Security'}
                  </span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  {deliveryMethod === 'courier' ? (
                    <>
                      The seller will securely package the item with tamper-evident tape and book insured courier dispatch within 48 hours.
                      An adult signature and government ID verification are mandatory upon doorstep delivery. You will receive real-time carrier tracking.
                    </>
                  ) : (
                    <>
                      Coordinate the exact meeting time inside the platform's encrypted contract chat. A secure 6-digit OTP code will be generated upon payment.
                      <strong> Only disclose this OTP code to the seller after you meet in person and inspect the physical carton.</strong>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Address or Handover Details Form */}
            {deliveryMethod === 'courier' ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">2. Indian Shipping Address</h2>
                    <p className="text-xs text-slate-500">PIN-code and mobile number required for tracked domestic dispatch.</p>
                  </div>
                  <MapPin className="w-4 h-4 text-slate-400" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Recipient Full Name"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="House / Flat / Building No."
                      placeholder="e.g. Flat 304, Pearl Residency"
                      value={address.houseFlat || ''}
                      onChange={(e) => setAddress({ ...address, houseFlat: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      label="Street / Road"
                      placeholder="e.g. Prithviraj Road"
                      value={address.streetAddress}
                      onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="Area / Locality / Landmark"
                      placeholder="e.g. C-Scheme / Vaishali Nagar"
                      value={address.area || ''}
                      onChange={(e) => setAddress({ ...address, area: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      label="City"
                      placeholder="e.g. Jaipur"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      State / Union Territory <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={address.state || 'Rajasthan'}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    >
                      {[
                        'Rajasthan',
                        'Karnataka',
                        'Maharashtra',
                        'Delhi',
                        'Haryana',
                        'Uttar Pradesh',
                        'Gujarat',
                        'Tamil Nadu',
                        'Telangana',
                        'West Bengal',
                        'Kerala',
                        'Punjab',
                        'Madhya Pradesh',
                        'Chandigarh',
                      ].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Input
                      label="6-Digit PIN Code"
                      placeholder="302001"
                      maxLength={6}
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="Country"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="Mobile Phone (+91 for delivery OTP & SMS)"
                      placeholder="+91 98290 45120"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">2. Physical Handover Meeting Plan</h2>
                    <p className="text-xs text-slate-500">Propose a secure public meeting location in {product.sellerLocation}.</p>
                  </div>
                  <QrCode className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-4">
                  <div>
                    <Input
                      label="Public Handover Location (e.g. Bank lobby, transit station, police station exchange zone)"
                      value={handoverDetails.locationName}
                      onChange={(e) => setHandoverDetails({ ...handoverDetails, locationName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="Proposed Meeting Date & Time Window"
                      value={handoverDetails.scheduledDate}
                      onChange={(e) => setHandoverDetails({ ...handoverDetails, scheduledDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Meeting Notes & Handover Instructions
                    </label>
                    <textarea
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={handoverDetails.instructions}
                      onChange={(e) => setHandoverDetails({ ...handoverDetails, instructions: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MANDATORY PROTECTED PAYMENT DISCLOSURE (Section E) */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0" />
                <span className="text-xs font-bold text-blue-950">Platform Payment Protection</span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                "Your payment is processed through the platform's payment provider. Seller settlement follows the inspection and dispute-resolution rules of the transaction."
              </p>
              <div className="pt-1 text-[11px] text-slate-600 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 48h Inspection Window
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Neutral Arbitrator Resolution
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero Direct Off-Platform Transfer
                </span>
              </div>
            </div>

            {/* Terms confirmation checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 p-2">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
              />
              <span className="leading-relaxed">
                I understand that my payment will be held with the payment provider until I receive the product and complete my 48-hour physical inspection.
              </span>
            </label>
          </div>

          {/* RIGHT COLUMN: Order Summary Card (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 sticky top-24">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Transaction Summary
            </h2>

            {/* Product Snapshot */}
            <div className="flex gap-3.5 items-center">
              <img
                src={(product.galleryImages && product.galleryImages[0]) || product.featuredImage}
                alt={product.title}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {product.brand} · {product.model}
                </span>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{product.title}</h3>
                <p className="text-xs text-slate-500 capitalize">
                  Condition: <span className="font-semibold text-slate-800">{product.condition.replace(/_/g, ' ')}</span>
                </p>
              </div>
            </div>

            {/* Seller Information */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Seller:</span>
                <span className="font-bold text-slate-900">{product.sellerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-slate-700">{product.sellerLocation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reputation:</span>
                <span className="font-semibold text-blue-900">{product.sellerTrustScore}% Trust · {product.sellerRating} ★</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center">
                <span>Original Listing Price:</span>
                <span className={`font-mono ${isNegotiated ? 'line-through text-slate-400' : 'text-slate-900 font-semibold'}`}>
                  {formatCurrency(originalListingPrice)}
                </span>
              </div>

              {isNegotiated && (
                <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                  <span className="flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> Final Negotiated Price:
                  </span>
                  <span className="font-mono font-bold">{formatCurrency(agreedPrice)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Delivery Charge ({deliveryMethod === 'courier' ? 'Tracked Courier' : 'Direct Meetup'}):
                </span>
                <span className="font-mono text-slate-900 font-semibold">
                  {courierFee > 0 ? formatCurrency(courierFee) : 'FREE'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Platform Protection & Custody (1.5%):
                </span>
                <span className="font-mono text-slate-900 font-semibold">
                  {formatCurrency(platformFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                <div>
                  <span className="text-sm font-bold block">Total Amount Payable:</span>
                  <span className="text-xs text-slate-500 font-normal">Includes taxes & full transit protection</span>
                </div>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                  {formatCurrency(totalAmountPayable)}
                </span>
              </div>
            </div>

            {/* Action CTA */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs"
              leftIcon={<Lock className="w-4 h-4 text-emerald-400" />}
            >
              {submitting ? 'Creating Order...' : 'Continue to Secure Payment'}
            </Button>

            <p className="text-xs text-slate-400 text-center">
              Next step: Authorize payment via simulated payment provider gateway.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
