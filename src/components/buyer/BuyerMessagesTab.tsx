/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BuyerNegotiationThread, BuyerNegotiationOffer } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Modal } from '../ui/Modal.tsx';
import { 
  Send, 
  Tag, 
  ShieldCheck, 
  Star, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Camera, 
  Video, 
  FileText, 
  Check, 
  Lock, 
  Truck, 
  QrCode, 
  ExternalLink,
  CreditCard,
  Building2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.ts';
import { Link } from 'react-router-dom';

interface BuyerMessagesTabProps {
  threads: BuyerNegotiationThread[];
  onUpdateThread: (updated: BuyerNegotiationThread) => void;
  onProceedToCheckout: (thread: BuyerNegotiationThread, finalPrice: number) => void;
}

export const BuyerMessagesTab: React.FC<BuyerMessagesTabProps> = ({
  threads,
  onUpdateThread,
  onProceedToCheckout,
}) => {
  const { showToast } = useToast();
  const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id || '');
  const [chatInput, setChatInput] = useState('');

  // Negotiation offer state
  const [isOfferInputOpen, setIsOfferInputOpen] = useState(false);
  const [newOfferAmount, setNewOfferAmount] = useState<number>(0);
  const [offerNote, setOfferNote] = useState('');

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  // Send standard chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'buyer' as const,
      text: chatInput,
      timestamp: 'Just now',
    };

    const updatedThread: BuyerNegotiationThread = {
      ...activeThread,
      messages: [...activeThread.messages, newMsg],
      lastMessageTimestamp: 'Just now',
    };

    onUpdateThread(updatedThread);
    setChatInput('');
    showToast('Message Transmitted', `Sent message to ${activeThread.sellerName}.`, 'success');
  };

  // Structured inquiry quick buttons
  const handleSendQuickInquiry = (
    type: 'photo_request' | 'video_request' | 'invoice_inquiry' | 'condition_inquiry' | 'delivery_inquiry',
    text: string
  ) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'buyer' as const,
      text,
      timestamp: 'Just now',
      inquiryType: type,
    };

    const updatedThread: BuyerNegotiationThread = {
      ...activeThread,
      messages: [...activeThread.messages, newMsg],
      lastMessageTimestamp: 'Just now',
    };

    onUpdateThread(updatedThread);
    showToast('Structured Inquiry Sent', text, 'info');
  };

  // Buyer submits an offer
  const handleSubmitOffer = () => {
    if (!newOfferAmount || newOfferAmount <= 0) return;

    const offerObj: BuyerNegotiationOffer = activeThread.offer
      ? {
          ...activeThread.offer,
          currentOfferAmount: newOfferAmount,
          status: 'pending_seller',
          history: [
            ...activeThread.offer.history,
            { role: 'buyer', amount: newOfferAmount, timestamp: 'Just now', note: offerNote }
          ]
        }
      : {
          id: `off_${Date.now()}`,
          originalPrice: activeThread.originalPrice,
          currentOfferAmount: newOfferAmount,
          status: 'pending_seller',
          expiresAt: 'In 24 hours',
          history: [
            { role: 'buyer', amount: newOfferAmount, timestamp: 'Just now', note: offerNote }
          ]
        };

    const systemMsg = {
      id: `msg_${Date.now()}`,
      sender: 'system' as const,
      text: `You submitted a binding offer of ${formatCurrency(newOfferAmount)} to ${activeThread.sellerName}.`,
      timestamp: 'Just now',
    };

    const updatedThread: BuyerNegotiationThread = {
      ...activeThread,
      offer: offerObj,
      messages: [...activeThread.messages, systemMsg],
    };

    onUpdateThread(updatedThread);
    setIsOfferInputOpen(false);
    setNewOfferAmount(0);
    setOfferNote('');
    showToast(
      'Binding Offer Submitted',
      `Offer of ${formatCurrency(newOfferAmount)} sent to ${activeThread.sellerName}.`,
      'success'
    );
  };

  // Buyer accepts seller's counteroffer
  const handleAcceptCounterOffer = () => {
    if (!activeThread.offer?.counterOfferAmount) return;

    const agreedPrice = activeThread.offer.counterOfferAmount;
    const updatedOffer: BuyerNegotiationOffer = {
      ...activeThread.offer,
      finalAgreedPrice: agreedPrice,
      status: 'accepted',
      history: [
        ...activeThread.offer.history,
        { role: 'buyer', amount: agreedPrice, timestamp: 'Just now', note: 'Buyer accepted counteroffer.' }
      ]
    };

    const systemMsg = {
      id: `msg_${Date.now()}`,
      sender: 'system' as const,
      text: `Agreement reached! You accepted ${activeThread.sellerName}'s counteroffer of ${formatCurrency(agreedPrice)}. Please proceed to escrow checkout.`,
      timestamp: 'Just now'
    };

    const updatedThread: BuyerNegotiationThread = {
      ...activeThread,
      offer: updatedOffer,
      messages: [...activeThread.messages, systemMsg],
    };

    onUpdateThread(updatedThread);
    showToast(
      'Counteroffer Accepted',
      `Agreed on ${formatCurrency(agreedPrice)}. You may now proceed to checkout.`,
      'success'
    );
  };

  // Buyer rejects seller's counteroffer
  const handleRejectCounterOffer = () => {
    if (!activeThread.offer) return;

    const updatedOffer: BuyerNegotiationOffer = {
      ...activeThread.offer,
      status: 'declined',
      history: [
        ...activeThread.offer.history,
        { role: 'buyer', amount: activeThread.offer.counterOfferAmount || 0, timestamp: 'Just now', note: 'Buyer rejected counteroffer.' }
      ]
    };

    const systemMsg = {
      id: `msg_${Date.now()}`,
      sender: 'system' as const,
      text: `You declined ${activeThread.sellerName}'s counteroffer. You may submit a revised proposal or purchase at the original asking price.`,
      timestamp: 'Just now'
    };

    const updatedThread: BuyerNegotiationThread = {
      ...activeThread,
      offer: updatedOffer,
      messages: [...activeThread.messages, systemMsg],
    };

    onUpdateThread(updatedThread);
    showToast('Counteroffer Rejected', 'The negotiation proposal was declined.', 'info');
  };

  // Simulated seller response toggle (lets the user test the full lifecycle)
  const handleSimulateSellerAction = (action: 'accept' | 'counter' | 'reject') => {
    if (!activeThread.offer) return;

    if (action === 'accept') {
      const agreed = activeThread.offer.currentOfferAmount;
      const updatedOffer: BuyerNegotiationOffer = {
        ...activeThread.offer,
        finalAgreedPrice: agreed,
        status: 'accepted',
        history: [
          ...activeThread.offer.history,
          { role: 'seller', amount: agreed, timestamp: 'Just now', note: 'Seller accepted offer.' }
        ]
      };
      const sysMsg = {
        id: `msg_${Date.now()}`,
        sender: 'system' as const,
        text: `${activeThread.sellerName} accepted your offer of ${formatCurrency(agreed)}! Price is now locked for escrow deposit.`,
        timestamp: 'Just now'
      };
      onUpdateThread({
        ...activeThread,
        offer: updatedOffer,
        messages: [...activeThread.messages, sysMsg]
      });
      showToast('Offer Accepted by Seller', `Final price locked at ${formatCurrency(agreed)}.`, 'success');
    } else if (action === 'counter') {
      const counterAmt = Math.round(activeThread.originalPrice * 0.95);
      const updatedOffer: BuyerNegotiationOffer = {
        ...activeThread.offer,
        counterOfferAmount: counterAmt,
        status: 'counter_received',
        history: [
          ...activeThread.offer.history,
          { role: 'seller', amount: counterAmt, timestamp: 'Just now', note: 'Seller counter-offered.' }
        ]
      };
      const sellerMsg = {
        id: `msg_${Date.now()}`,
        sender: 'seller' as const,
        text: `I can meet you at ${formatCurrency(counterAmt)} with insured shipping included. Let me know if that works for you!`,
        timestamp: 'Just now'
      };
      onUpdateThread({
        ...activeThread,
        offer: updatedOffer,
        messages: [...activeThread.messages, sellerMsg]
      });
      showToast('Counteroffer Received', `${activeThread.sellerName} countered at ${formatCurrency(counterAmt)}.`, 'info');
    } else if (action === 'reject') {
      const updatedOffer: BuyerNegotiationOffer = {
        ...activeThread.offer,
        status: 'declined',
      };
      const sysMsg = {
        id: `msg_${Date.now()}`,
        sender: 'system' as const,
        text: `${activeThread.sellerName} declined your offer of ${formatCurrency(activeThread.offer.currentOfferAmount)}.`,
        timestamp: 'Just now'
      };
      onUpdateThread({
        ...activeThread,
        offer: updatedOffer,
        messages: [...activeThread.messages, sysMsg]
      });
      showToast('Offer Declined', 'Seller declined the proposal.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">In-Platform Messaging & Negotiation</h2>
        <p className="text-xs text-slate-500">
          Negotiate directly with verified sellers. Binding offers lock agreed pricing into secure escrow checkout.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column: Conversation List (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 p-3.5 space-y-2 overflow-y-auto bg-slate-50/40">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Conversations ({threads.length})
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              Escrow Enabled
            </span>
          </div>

          <div className="space-y-1.5">
            {threads.map((thread) => {
              const isSelected = thread.id === activeThreadId;
              const hasAcceptedOffer = thread.offer?.status === 'accepted';
              const hasCounterOffer = thread.offer?.status === 'counter_received';

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={thread.productImage}
                      alt={thread.productTitle}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 mt-0.5"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {thread.sellerName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {thread.lastMessageTimestamp}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold text-slate-700 truncate mt-0.5">
                        {thread.productTitle}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="font-mono font-bold text-slate-900">
                          {thread.offer?.finalAgreedPrice
                            ? formatCurrency(thread.offer.finalAgreedPrice)
                            : formatCurrency(thread.originalPrice)}
                        </span>

                        {hasAcceptedOffer && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Offer Agreed
                          </span>
                        )}
                        {hasCounterOffer && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Counter Received
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat Stream & Negotiation Deck (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white">
          {/* Header 1: Product Being Discussed */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={activeThread.productImage}
                alt={activeThread.productTitle}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <Link
                  to={`/product/${activeThread.productId}`}
                  className="font-bold text-slate-900 text-xs hover:underline truncate block"
                >
                  {activeThread.productTitle}
                </Link>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span>Asking: <strong>{formatCurrency(activeThread.originalPrice)}</strong></span>
                  <span>·</span>
                  <span>{activeThread.condition}</span>
                  <span>·</span>
                  <span>{activeThread.sellerLocation}</span>
                </div>
              </div>
            </div>

            <Link to={`/product/${activeThread.productId}`}>
              <Button variant="outline" size="sm" className="text-xs shrink-0" rightIcon={<ExternalLink className="w-3 h-3" />}>
                View Dossier
              </Button>
            </Link>
          </div>

          {/* Header 2: Seller Profile Snapshot */}
          <div className="px-5 py-2.5 bg-slate-100/50 border-b border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{activeThread.sellerName}</span>
              <span className="flex items-center gap-1 text-slate-600 font-semibold text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {activeThread.sellerRating} ★
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{activeThread.sellerCompletedTrades} completed trades</span>
            </div>

            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {activeThread.sellerTrustScore}% Trust Score
            </span>
          </div>

          {/* Interactive Negotiation & Offer Card */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs">
            {activeThread.offer ? (
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-900" />
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Price Negotiation Portal
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {activeThread.offer.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Offer Accepted & Price Locked
                      </span>
                    )}
                    {activeThread.offer.status === 'counter_received' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        Seller Counteroffer Received
                      </span>
                    )}
                    {activeThread.offer.status === 'pending_seller' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Seller Decision
                      </span>
                    )}
                    {activeThread.offer.status === 'declined' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-rose-50 text-rose-700 border border-rose-200 text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        Offer Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Listing Price</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {formatCurrency(activeThread.originalPrice)}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Your Offer</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(activeThread.offer.currentOfferAmount)}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Seller Counter</span>
                    <span className="font-mono font-bold text-amber-700 text-sm">
                      {activeThread.offer.counterOfferAmount
                        ? formatCurrency(activeThread.offer.counterOfferAmount)
                        : '—'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block font-semibold">Final Agreed Price</span>
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                      {activeThread.offer.finalAgreedPrice
                        ? formatCurrency(activeThread.offer.finalAgreedPrice)
                        : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Offer Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  {/* Left: Simulation helpers (allows user to test accepting/countering from seller perspective) */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>Simulate Seller:</span>
                    <button
                      type="button"
                      onClick={() => handleSimulateSellerAction('accept')}
                      className="hover:text-slate-900 underline cursor-pointer"
                    >
                      Accept
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => handleSimulateSellerAction('counter')}
                      className="hover:text-slate-900 underline cursor-pointer"
                    >
                      Counter
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => handleSimulateSellerAction('reject')}
                      className="hover:text-slate-900 underline cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>

                  {/* Right: Buyer CTAs based on status */}
                  <div className="flex items-center gap-2">
                    {/* If counter received: Accept or Reject counter */}
                    {activeThread.offer.status === 'counter_received' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRejectCounterOffer}
                          className="text-xs text-rose-600 hover:text-rose-700"
                        >
                          Reject Counter
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleAcceptCounterOffer}
                          className="bg-blue-900 hover:bg-blue-950 font-semibold text-xs"
                        >
                          Accept {formatCurrency(activeThread.offer.counterOfferAmount || 0)}
                        </Button>
                      </>
                    )}

                    {/* If agreed: Proceed to Checkout! */}
                    {activeThread.offer.status === 'accepted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onProceedToCheckout(activeThread, activeThread.offer?.finalAgreedPrice || activeThread.originalPrice)}
                        className="bg-emerald-700 hover:bg-emerald-800 font-bold text-xs shadow-xs"
                        leftIcon={<Lock className="w-3.5 h-3.5" />}
                      >
                        Proceed to Checkout ({formatCurrency(activeThread.offer.finalAgreedPrice || activeThread.originalPrice)})
                      </Button>
                    )}

                    {/* If declined: allow re-submitting an offer */}
                    {activeThread.offer.status === 'declined' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOfferInputOpen(true)}
                        className="text-xs"
                      >
                        Submit Revised Offer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* No active offer yet */
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Make an In-Platform Binding Offer</p>
                  <p className="text-[11px] text-slate-500">
                    Sellers respond within 24 hours. Accepted offers lock the price into escrow.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsOfferInputOpen(true)}
                  leftIcon={<Tag className="w-3.5 h-3.5" />}
                  className="bg-blue-900 text-xs font-semibold"
                >
                  Make an Offer
                </Button>
              </div>
            )}
          </div>

          {/* Message Feed */}
          <div className="p-5 space-y-3.5 flex-1 overflow-y-auto max-h-[340px]">
            {activeThread.messages.map((m) => {
              if (m.sender === 'system') {
                return (
                  <div key={m.id} className="text-center py-2">
                    <span className="inline-block text-[11px] font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      {m.text} · <span className="text-slate-400 font-mono">{m.timestamp}</span>
                    </span>
                  </div>
                );
              }

              const isBuyer = m.sender === 'buyer';

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 font-mono">{m.timestamp}</span>
                  <div
                    className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed shadow-xs ${
                      isBuyer
                        ? 'bg-slate-900 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {m.inquiryType && (
                      <span className="text-[10px] uppercase font-bold text-blue-200 block mb-1">
                        [{m.inquiryType.replace('_', ' ')}]
                      </span>
                    )}
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Structured Inquiry Quick Action Chips */}
          <div className="px-5 py-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium">Quick Inquiries:</span>
            <button
              type="button"
              onClick={() => handleSendQuickInquiry('photo_request', 'Could you share an additional high-res photo of the chassis serial and optical glass under light?')}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap cursor-pointer flex items-center gap-1"
            >
              <Camera className="w-3 h-3 text-slate-600" /> Additional Photos
            </button>
            <button
              type="button"
              onClick={() => handleSendQuickInquiry('video_request', 'Could you provide a 20-second video demonstrating the mechanical power-on and functional switches?')}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap cursor-pointer flex items-center gap-1"
            >
              <Video className="w-3 h-3 text-slate-600" /> Video Demo
            </button>
            <button
              type="button"
              onClick={() => handleSendQuickInquiry('invoice_inquiry', 'Is the original printed purchase GST tax invoice or store receipt included with the documentation?')}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3 h-3 text-slate-600" /> GST Invoice Check
            </button>
            <button
              type="button"
              onClick={() => handleSendQuickInquiry('delivery_inquiry', 'Are you available for physical OTP handover in Jaipur, or should we use insured courier freight?')}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap cursor-pointer flex items-center gap-1"
            >
              <Truck className="w-3 h-3 text-slate-600" /> Delivery Options
            </button>
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder={`Message ${activeThread.sellerName} (All communications logged for dispute safety)...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <Button type="submit" variant="primary" size="sm" className="bg-blue-900 shrink-0">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Make An Offer Modal */}
      {isOfferInputOpen && (
        <Modal
          isOpen={isOfferInputOpen}
          onClose={() => setIsOfferInputOpen(false)}
          title={`Submit Binding Offer to ${activeThread.sellerName}`}
          subtitle={`Item: ${activeThread.productTitle} · Listed Price: ${formatCurrency(activeThread.originalPrice)}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <Input
              label="Your Offer Amount (INR ₹)"
              type="number"
              min={500}
              max={activeThread.originalPrice}
              value={newOfferAmount || ''}
              onChange={(e) => setNewOfferAmount(Number(e.target.value))}
              helperText={`Asking price is ${formatCurrency(activeThread.originalPrice)}`}
              required
            />

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Note to Seller (Optional)
              </label>
              <textarea
                rows={2}
                value={offerNote}
                onChange={(e) => setOfferNote(e.target.value)}
                placeholder="e.g. Ready to fund escrow deposit immediately upon acceptance."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">Binding Negotiation Rule:</p>
              <p className="text-[11px] leading-relaxed">
                If the seller accepts, the price is guaranteed locked. You will be prompted to deposit funds into the escrow vault within 24 hours.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsOfferInputOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmitOffer} className="bg-blue-900 font-semibold">
                Submit Binding Offer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
