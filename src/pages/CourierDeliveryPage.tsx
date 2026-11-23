/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { transactionService } from '../services/transactionService.ts';
import { Transaction, CourierTrackingStep } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { Button } from '../components/ui/Button.tsx';
import { useToast } from '../hooks/useToast.ts';
import {
  Truck,
  Package,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Printer,
  ArrowLeft,
  AlertTriangle,
  Info,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Send,
  UserCheck,
} from 'lucide-react';

const COURIER_TIMELINE_STEPS: {
  step: CourierTrackingStep;
  label: string;
  defaultLocation: string;
  defaultDescription: string;
}[] = [
  {
    step: 'pickup_scheduled',
    label: '1. Pickup Scheduled',
    defaultLocation: 'Seller Dispatch Center, Bengaluru (560038)',
    defaultDescription: 'Courier pickup scheduled via Shiprocket-compatible workflow with declared-value coverage.',
  },
  {
    step: 'picked_up',
    label: '2. Picked Up',
    defaultLocation: 'Bengaluru Kempegowda Air Cargo Hub, Karnataka',
    defaultDescription: 'Package collected from seller. AWB barcode scanned and tamper-evident seal verified.',
  },
  {
    step: 'in_transit',
    label: '3. In Transit',
    defaultLocation: 'Jaipur Regional Logistics Hub, Rajasthan',
    defaultDescription: 'Air linehaul sorting completed. En route to local delivery center in Jaipur.',
  },
  {
    step: 'out_for_delivery',
    label: '4. Out for Delivery',
    defaultLocation: 'C-Scheme Delivery Station, Jaipur (302001)',
    defaultDescription: 'Out for delivery with field executive. Delivery OTP & recipient verification required.',
  },
  {
    step: 'delivered',
    label: '5. Delivered',
    defaultLocation: 'Recipient Doorstep, C-Scheme, Jaipur, Rajasthan',
    defaultDescription: 'Delivered to buyer via PIN & OTP confirmation. 48h Inspection Window starts.',
  },
];

export const CourierDeliveryPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // View mode: 'seller' | 'buyer'
  const [activePerspective, setActivePerspective] = useState<'seller' | 'buyer'>('seller');

  // Seller delivery management form state
  const [selectedCarrier, setSelectedCarrier] = useState('Blue Dart Air Express (Insured)');
  const [trackingNumber, setTrackingNumber] = useState('BD-924180-BLR-JAI');
  const [pickupDate, setPickupDate] = useState('Tomorrow, 10:00 - 13:00 IST');
  const [pickupAddress, setPickupAddress] = useState('12th Main Road, Indiranagar, Bengaluru, Karnataka 560038');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const idToLookup = orderId || 'ORD-89241';
        const res = await transactionService.getTransactionById(idToLookup);
        if (res.data) {
          setOrder(res.data);
          if (res.data.shipping?.carrier) setSelectedCarrier(res.data.shipping.carrier);
          if (res.data.shipping?.trackingNumber) setTrackingNumber(res.data.shipping.trackingNumber);
        } else {
          const listRes = await transactionService.getTransactions();
          if (listRes.data && listRes.data.length > 0) {
            setOrder(listRes.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load courier order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-medium">Connecting to carrier logistics dispatch system...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Located</h2>
        <p className="text-slate-600 text-sm mb-6">Could not find delivery records for order reference {orderId}.</p>
        <Link to="/seller/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const currentStep = order.shipping?.courierStep || (order.currentStage === 'inspection_in_progress' ? 'delivered' : 'pickup_scheduled');
  const stepKeys = COURIER_TIMELINE_STEPS.map((s) => s.step);
  const currentStepIndex = stepKeys.indexOf(currentStep);

  // Advance simulated courier status
  const handleAdvanceCourierStep = async (targetStep: CourierTrackingStep) => {
    try {
      const stepDef = COURIER_TIMELINE_STEPS.find((s) => s.step === targetStep);
      const res = await transactionService.updateCourierProgress(order.id, targetStep, {
        carrier: selectedCarrier,
        trackingNumber,
        location: stepDef?.defaultLocation,
        note: stepDef?.defaultDescription,
      });

      if (res.data) {
        setOrder({ ...res.data });
        showToast('Courier Updated', `Shipment status advanced to: ${stepDef?.label}`, 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to update courier tracking step.', 'error');
    }
  };

  const handlePrintShippingLabel = () => {
    showToast(
      'Insured Shipping Label Ready',
      `AWB barcoded label #${trackingNumber} generated with declared-value coverage (${formatCurrency(order.agreedPrice)}).`,
      'success'
    );
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tracked Courier Delivery</h1>
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200">
              #{order.orderId || order.id}
            </span>
          </div>
        </div>

        {/* Perspective Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => setActivePerspective('seller')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activePerspective === 'seller'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Seller Delivery Management
          </button>
          <button
            type="button"
            onClick={() => setActivePerspective('buyer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activePerspective === 'buyer'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buyer Courier Tracking
          </button>
        </div>
      </div>

      {/* PROTOTYPE NOTICE & API PLACEHOLDER */}
      <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900">
            Simulated Courier Updates (Shiprocket-Compatible Tracking Sandbox)
          </span>
          <p className="text-slate-600 leading-relaxed">
            This module simulates pickup scheduling, PIN-code AWB tracking events, and doorstep delivery confirmation across Indian logistics corridors. No live courier partner API is claimed in demo mode.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 5-Step Courier Tracking Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-900" />
                <h2 className="text-sm font-bold text-slate-900">Courier Tracking Timeline</h2>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {currentStep === 'delivered' ? 'Delivered & Signed' : 'In Transit'}
              </span>
            </div>

            {/* Visual Stepper */}
            <div className="relative pl-6 space-y-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {COURIER_TIMELINE_STEPS.map((stepItem, index) => {
                const isPassed = currentStepIndex > index;
                const isCurrent = currentStepIndex === index;
                const isUpcoming = currentStepIndex < index;

                return (
                  <div key={stepItem.step} className="relative flex items-start gap-3.5">
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
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{index + 1}</span>}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-xs font-bold ${
                            isCurrent ? 'text-blue-900' : isPassed ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {stepItem.label}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                            Active Step
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{stepItem.defaultLocation}</span>
                      </div>

                      <p className={`text-xs leading-relaxed ${isUpcoming ? 'text-slate-400' : 'text-slate-600'}`}>
                        {stepItem.defaultDescription}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carrier Sandbox Simulator Buttons */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-900" />
                  Simulate Courier Scan Event:
                </span>
                <span className="text-[10px] font-mono text-slate-500">API Webhook Trigger</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COURIER_TIMELINE_STEPS.map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => handleAdvanceCourierStep(s.step)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                      currentStep === s.step
                        ? 'bg-blue-900 text-white border-blue-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* If delivered -> show banner to open 48h Inspection */}
            {currentStep === 'delivered' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Package Delivered & Verified
                  </span>
                  <p className="text-emerald-900 text-[11px]">
                    Adult signature recorded. 48-Hour Hands-On Buyer Inspection Window is now open!
                  </p>
                </div>
                <Link to={`/inspection/${order.orderId || order.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shrink-0"
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Open Inspection Desk
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Seller Delivery Management / Buyer Order Dossier (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {activePerspective === 'seller' ? (
            /* SELLER DELIVERY MANAGEMENT VIEW (Section A Requirement) */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Seller Delivery Management</h3>
                <span className="text-[10px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Seller Dispatch Desk
                </span>
              </div>

              {/* Order & Product Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-slate-900">{order.orderId || order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Item:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[170px]">{order.productTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Declared Value:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatCurrency(order.agreedPrice)}</span>
                </div>
              </div>

              {/* Buyer Information Relevant to Delivery */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Buyer Shipping Address
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                  <p className="font-bold text-slate-900">
                    {order.deliveryAddress?.fullName || order.buyerName}
                  </p>
                  <p className="text-slate-600">
                    {order.deliveryAddress?.houseFlat ? `${order.deliveryAddress.houseFlat}, ` : ''}
                    {order.deliveryAddress?.streetAddress || 'Flat 304, Prithviraj Road, C-Scheme'}
                  </p>
                  <p className="text-slate-600">
                    {order.deliveryAddress?.city || 'Jaipur'}, {order.deliveryAddress?.state || 'Rajasthan'} - {order.deliveryAddress?.postalCode || '302001'}, {order.deliveryAddress?.country || 'India'}
                  </p>
                  <p className="text-slate-500 pt-1 font-mono text-[11px]">
                    Mobile Phone: {order.deliveryAddress?.phone || '+91 98290 45120'}
                  </p>
                </div>
              </div>

              {/* Courier Selection Placeholder */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    Select Shiprocket-Compatible Courier Workflow:
                  </label>
                  <select
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Blue Dart Air Express (Insured)">Blue Dart Air Express (Insured)</option>
                    <option value="Delhivery Air & Surface Express">Delhivery Air & Surface Express</option>
                    <option value="DTDC Plus Insured Parcel">DTDC Plus Insured Parcel</option>
                    <option value="India Post Speed Post Insured">India Post Speed Post Insured</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    AWB / Tracking Number:
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full font-mono rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    Scheduled Pickup Date & Window:
                  </label>
                  <input
                    type="text"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Dispatch Action CTAs */}
              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handlePrintShippingLabel}
                  leftIcon={<Printer className="w-4 h-4" />}
                  className="w-full justify-center bg-blue-900 hover:bg-blue-950 font-semibold text-xs"
                >
                  Print Insured Carrier Label
                </Button>
                <p className="text-[11px] text-slate-400 text-center">
                  Attach pre-paid barcode to box with tamper-evident tape.
                </p>
              </div>
            </div>
          ) : (
            /* BUYER COURIER TRACKING VIEW */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Buyer Delivery Tracking</h3>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Buyer Protection Active
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Carrier:</span>
                  <span className="font-bold text-slate-900">{selectedCarrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tracking Code:</span>
                  <span className="font-mono font-bold text-blue-900">{trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Requirement:</span>
                  <span className="font-semibold text-slate-900">PIN-Code & Delivery OTP</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-xs text-blue-950">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-900" /> Doorstep Arrival Protocol
                </span>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  When the courier arrives, inspect the exterior seals before signing. Once delivered, your <strong>48-hour hands-on inspection window</strong> activates. Seller payout is never released merely upon delivery.
                </p>
              </div>

              <Link to={`/inspection/${order.orderId || order.id}`}>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full justify-center text-xs font-semibold"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View Inspection Status & Criteria
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
