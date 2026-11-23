/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { transactionService } from '../services/transactionService.ts';
import { Transaction } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { useToast } from '../hooks/useToast.ts';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  Lock,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Info,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment states: idle, processing, failed, succeeded
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'failed' | 'succeeded'>('idle');
  const [activePaymentTab, setActivePaymentTab] = useState<'upi' | 'card' | 'net_banking'>('upi');
  const [simulateFailureToggle, setSimulateFailureToggle] = useState(false);
  const [failureReason, setFailureReason] = useState<string>('Declined by issuing bank: Insufficient sandbox authorization limit or UPI timeout.');

  // Demo Card Form Fields (Zero CVV/PIN collected)
  const [cardName, setCardName] = useState('Ananya Sharma');
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 1111');
  const [cardExpiry, setCardExpiry] = useState('08/28');

  // Demo Net Banking / IMPS Reference
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [bankReference, setBankReference] = useState('');

  // Demo UPI / Virtual ID
  const [upiId, setUpiId] = useState('ananya.sharma@okicici');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const idToLookup = orderId || 'ORD-89241';
        const res = await transactionService.getTransactionById(idToLookup);
        if (res.data) {
          setOrder(res.data);
          setBankReference(`ONTRA-REF-${res.data.orderId || res.data.id}`);
        } else {
          // fallback to first transaction
          const listRes = await transactionService.getTransactions();
          if (listRes.data && listRes.data.length > 0) {
            setOrder(listRes.data[0]);
            setBankReference(`ONTRA-REF-${listRes.data[0].orderId || listRes.data[0].id}`);
          }
        }
      } catch (err) {
        console.error('Failed to load order', err);
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
        <p className="text-slate-600 text-sm font-medium">Connecting to secure payment gateway sandbox...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Located</h2>
        <p className="text-slate-600 text-sm mb-6">Could not find checkout records for reference {orderId}.</p>
        <Link to="/explore">
          <Button variant="primary">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const totalAmount = order.totalAmountPayable || order.payment?.totalCharged || order.agreedPrice;

  const handleAuthorizePayment = async () => {
    setPaymentState('processing');

    setTimeout(async () => {
      if (simulateFailureToggle) {
        setPaymentState('failed');
        showToast('Payment Declined', 'Simulated gateway returned authorization error.', 'error');
      } else {
        try {
          await transactionService.processSimulatedPayment(order.id, {
            shouldFail: false,
            paymentMethod:
              activePaymentTab === 'upi'
                ? 'upi'
                : activePaymentTab === 'card'
                ? 'debit_card'
                : 'net_banking',
          });

          setPaymentState('succeeded');
          showToast('Payment Verified', 'Simulated payment authorized. Funds deposited into platform escrow custody.', 'success');

          // Navigate to confirmation after 1.2s delay for visual feedback
          setTimeout(() => {
            navigate(`/order-confirmation/${order.orderId || order.id}`);
          }, 1200);
        } catch (e) {
          console.error(e);
          setPaymentState('failed');
        }
      }
    }, 1100);
  };

  const handleRetryPayment = () => {
    setPaymentState('idle');
    setSimulateFailureToggle(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Top Breadcrumb & Step Tracker */}
      <div className="mb-6">
        <Link
          to={`/checkout/${order.productId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Fulfillment Terms</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Authorization</h1>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                Order #{order.orderId || order.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure sandbox environment designed for integration with certified payment service providers.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Step 2 of 3: Payment Sandbox</span>
          </div>
        </div>
      </div>

      {/* PROMINENT SIMULATION SAFETY BANNER (Explicit Prompt Mandate) */}
      <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Demo Mode: Simulated Payment Gateway</span>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed font-medium">
          This is a simulated payment gateway interface for prototype evaluation. Never enter or store real credit card PINs, CVVs, netbanking passwords, or UPI PINs. No real currency will be debited.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Payment Interface & Provider Gateway (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            {/* Header with Provider Branding Placeholder */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Indian Payment Gateway (Sandbox)</h2>
                <p className="text-[11px] text-slate-500">
                  Razorpay / Cashfree-compatible escrow sandbox (UPI · Cards · Net Banking)
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-900">256-Bit TLS</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setActivePaymentTab('upi'); setPaymentState('idle'); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activePaymentTab === 'upi'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI (Instant)</span>
              </button>

              <button
                type="button"
                onClick={() => { setActivePaymentTab('card'); setPaymentState('idle'); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activePaymentTab === 'card'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Debit / Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => { setActivePaymentTab('net_banking'); setPaymentState('idle'); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activePaymentTab === 'net_banking'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* FAILED STATE NOTIFICATION */}
            {paymentState === 'failed' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                      Simulated Payment Authorization Failed
                    </h3>
                    <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                      {failureReason}
                    </p>
                    <p className="text-[11px] text-rose-700 mt-1">
                      No funds were deducted. You may adjust simulation settings and retry payment.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRetryPayment}
                    className="bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Retry Payment
                  </Button>
                  <button
                    type="button"
                    onClick={() => setSimulateFailureToggle(false)}
                    className="text-xs text-rose-700 hover:underline cursor-pointer"
                  >
                    Switch to Success Mode
                  </button>
                </div>
              </div>
            )}

            {/* PROCESSING STATE NOTIFICATION */}
            {paymentState === 'processing' && (
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-3">
                <div className="w-10 h-10 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-blue-950">Simulating Gateway Processing</h3>
                  <p className="text-xs text-blue-800 mt-1">
                    Validating test authorization tokens with partner payment network...
                  </p>
                </div>
              </div>
            )}

            {/* SUCCEEDED STATE NOTIFICATION */}
            {paymentState === 'succeeded' && (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-950">Payment Authorization Successful!</h3>
                <p className="text-xs text-emerald-800">
                  Redirecting to order confirmation and transaction vault timeline...
                </p>
              </div>
            )}

            {/* FORM BODIES BY TAB (IDLE STATE) */}
            {paymentState !== 'processing' && paymentState !== 'succeeded' && (
              <div className="space-y-4">
                {activePaymentTab === 'upi' && (
                  <div className="space-y-4">
                    <Input
                      label="Virtual Payment Address (VPA) / UPI ID"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okicici"
                    />
                    <div className="grid grid-cols-4 gap-2 text-[11px] text-center font-medium text-slate-700">
                      {['BHIM UPI', 'GPay', 'PhonePe', 'Paytm'].map((app) => (
                        <div key={app} className="py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200">
                          {app}
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                      <strong>Security Note:</strong> UPI PIN approval happens strictly inside your UPI app. ONTRA never prompts for or stores your UPI PIN.
                    </div>
                  </div>
                )}

                {activePaymentTab === 'card' && (
                  <div className="space-y-4">
                    <Input
                      label="Cardholder Full Name (Debit / Credit Card)"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Ananya Sharma"
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Card Number (RuPay / Visa / Mastercard Demo Sandbox)
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Expiration Date"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                      />

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          CVV Security Code
                        </label>
                        <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-500 font-mono italic">
                          Omitted for Demo Security
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Per security protocol, CVVs are never collected in this frontend prototype.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activePaymentTab === 'net_banking' && (
                  <div className="space-y-3.5 text-xs text-slate-700">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Select Indian Bank (Net Banking / IMPS / NEFT)
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Escrow Beneficiary:</span>
                        <span className="font-bold text-slate-900">ONTRA Escrow Custody India</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Virtual Account (Demo):</span>
                        <span className="font-mono font-bold text-slate-900">ONTRA908100239481</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">IFSC Code (Sandbox):</span>
                        <span className="font-mono text-slate-900">ONTRA0000101</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5">
                        <span className="text-slate-500">Transfer Reference:</span>
                        <span className="font-mono font-bold text-blue-900">{bankReference}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      In production, ONTRA connects with Razorpay / Cashfree Net Banking & IMPS/NEFT virtual account webhooks. In demo mode, clicking authorize simulates sandbox verification.
                    </p>
                  </div>
                )}

                {/* SIMULATOR TEST TOGGLE (Section B Requirement) */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Simulator Controls (Test Both Flows):</span>
                    <span className="text-[10px] font-mono text-slate-500">Dev Sandbox</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={simulateFailureToggle}
                      onChange={(e) => setSimulateFailureToggle(e.target.checked)}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span>
                      Simulate <strong>Payment Failure</strong> (e.g. Card declined / Network timeout)
                    </span>
                  </label>
                  {simulateFailureToggle && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                      When enabled, clicking authorize will trigger a simulated gateway decline error with full retry functionality.
                    </div>
                  )}
                </div>

                {/* Primary Authorization Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAuthorizePayment}
                  className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs"
                  leftIcon={<Lock className="w-4 h-4 text-emerald-400" />}
                >
                  Authorize Payment of {formatCurrency(totalAmount)}
                </Button>
              </div>
            )}
          </div>

          {/* MANDATORY PROTECTED PAYMENT EXPLANATION (Section E) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Payment Custody Guarantee</span>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              "Your payment is processed through the platform's payment provider. Seller settlement follows the inspection and dispute-resolution rules of the transaction."
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Breakdown Snapshot (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 sticky top-24">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Payment Summary
          </h2>

          <div className="flex items-center gap-3">
            <img
              src={order.productImage}
              alt={order.productTitle}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div>
              <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{order.productTitle}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Seller: <strong>{order.sellerName}</strong>
              </p>
              <p className="text-[11px] text-slate-500 capitalize">
                Method: <strong>{order.deliveryMethod === 'courier' ? 'Tracked Courier' : 'Direct Handover'}</strong>
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Agreed Item Price:</span>
              <span className="font-mono text-slate-900 font-semibold">{formatCurrency(order.agreedPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge:</span>
              <span className="font-mono text-slate-900 font-semibold">
                {order.deliveryCharge ? formatCurrency(order.deliveryCharge) : 'FREE'}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform Custody Fee (1.5%):</span>
              <span className="font-mono text-slate-900 font-semibold">
                {order.platformFee ? formatCurrency(order.platformFee) : formatCurrency(Math.round(order.agreedPrice * 0.015))}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Authorization:</span>
              <span className="font-mono text-slate-900 tabular-nums">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Full replacement insurance against transit damage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>48-hour hands-on physical inspection upon receipt</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Dispute resolution with neutral arbitrator support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
