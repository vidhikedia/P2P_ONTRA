/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { MOCK_IMAGES } from '../data/mockData.ts';
import { 
  Search, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  QrCode, 
  Users, 
  CheckCircle2, 
  FileText, 
  Lock, 
  MessageSquare, 
  History, 
  Scale, 
  Star, 
  CreditCard,
  Handshake,
  Clock,
  AlertCircle
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated, openAuthModal, role, switchRole } = useAuth();
  const navigate = useNavigate();

  // Search input state for hero search bar
  const [searchQuery, setSearchQuery] = useState('');

  // Journey flow tab: buyer | seller
  const [journeyTab, setJourneyTab] = useState<'buyer' | 'seller'>('buyer');

  const handleStartSelling = () => {
    if (!isAuthenticated) {
      openAuthModal('signup');
    } else {
      if (role !== 'seller') {
        switchRole('seller');
      }
      navigate('/seller/dashboard?tab=add_product');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/explore?query=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section – What is ONTRA? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 lg:p-12 shadow-xs">
          {/* Left Hero Column: Explanation, Search & Action Buttons */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider flex-wrap">
              <span className="font-bold text-slate-900">ONTRA</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Buy Smart. Sell Easy. Trust Every Deal.</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Protected Platform Payments</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15] text-balance">
                What is ONTRA?
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                ONTRA is India’s trusted peer-to-peer second-hand marketplace where verified individuals buy and sell pre-owned items directly. Instead of blind classifieds, every deal includes structured safeguards: evidence disclosures, platform-held INR payments, PIN-tracked handover, and an inspection window before seller payout.
              </p>
            </div>

            {/* Integrated Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search pre-owned items (e.g. laptop, camera, bike, phone...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
                />
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                size="md" 
                className="font-semibold text-xs whitespace-nowrap justify-center shadow-xs"
              >
                Search
              </Button>
            </form>

            {/* Explore Products and Start Selling Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link to="/explore">
                <Button 
                  variant="primary" 
                  size="lg" 
                  rightIcon={<ArrowRight className="w-4 h-4" />} 
                  className="font-semibold shadow-xs"
                >
                  Explore Products
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleStartSelling}
                className="font-medium"
              >
                Start Selling
              </Button>
            </div>

            {/* Fast Highlights */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Timestamped evidence & serials on listings</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                <span>Platform payment protection during transit</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                <span>Seller payout released after inspection pass</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Authentic peer-to-peer marketplace visual */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 bg-slate-100">
              <img
                src={MOCK_IMAGES.heroStill}
                alt="Peer-to-peer pre-owned products photographed in a real home setting"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-300">
                  Real People · Direct Peer-to-Peer
                </span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  Mobiles · Laptops · Furniture · Books · Appliances · Sports
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Real Home Photography
                  </span>
                  <span>·</span>
                  <span>Configurable Inspection Window</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Why ONTRA? – Three Key Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
            Core Value Proposition
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Why ONTRA?
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Standard classified ads force strangers to rely on blind trust or risky cash handoffs. ONTRA replaces uncertainty with three structural protections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Benefit 1: In-Platform Negotiation */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900">
                <Handshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                In-Platform Negotiation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Make binding purchase offers, counter-offers, and agree on delivery terms directly in the order thread. No fragmented off-platform chats or ambiguous verbal promises.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Documented offer history</span>
            </div>
          </div>

          {/* Benefit 2: Platform-Based Payments */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Platform-Based Payments
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buyer payments are collected and held securely by the platform upon deal confirmation. Funds are never wired directly to an unfamiliar seller before receipt.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Protected funds during transit</span>
            </div>
          </div>

          {/* Benefit 3: Inspection Before Seller Payout */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Inspection Before Seller Payout
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every transaction includes a dedicated inspection window upon arrival. Buyers physically verify the item against the listing before payout is released to the seller.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Delayed payout until approval</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How ONTRA Works – Step-by-Step Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Transparent Milestone Progression
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                How ONTRA Works
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                A clear, 6-stage journey connecting discovery to final INR settlement. Toggle between Buyer and Seller views to explore the process from either perspective.
              </p>
            </div>

            {/* Persona Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-start md:self-end">
              <button
                type="button"
                onClick={() => setJourneyTab('buyer')}
                className={`py-2 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  journeyTab === 'buyer'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Buyer Journey</span>
              </button>
              <button
                type="button"
                onClick={() => setJourneyTab('seller')}
                className={`py-2 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  journeyTab === 'seller'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Seller Journey</span>
              </button>
            </div>
          </div>

          {/* 6 Connected Steps */}
          {journeyTab === 'buyer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
              {[
                {
                  step: '01',
                  title: 'Discover Product',
                  desc: 'Browse listings with authentic daylight photos, serial disclosures, and honest wear notes.',
                },
                {
                  step: '02',
                  title: 'Negotiate',
                  desc: 'Submit binding in-platform purchase offers or counter-offers with clear terms.',
                },
                {
                  step: '03',
                  title: 'Pay Through Platform',
                  desc: 'Fund the agreed purchase amount securely; payment is held safely by the platform.',
                },
                {
                  step: '04',
                  title: 'Choose Delivery',
                  desc: 'Select tracked carrier delivery or a direct in-person physical handover authenticated by OTP.',
                },
                {
                  step: '05',
                  title: 'Inspect Product',
                  desc: 'Examine and test the item during the listing’s dedicated physical inspection window.',
                },
                {
                  step: '06',
                  title: 'Confirm or Dispute',
                  desc: 'Approve to release seller payout, or lodge a dispute with evidence if items deviate.',
                },
              ].map((st, idx) => (
                <div
                  key={st.step}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                        {st.step}
                      </span>
                      {idx < 5 && (
                        <ChevronRight className="w-4 h-4 text-slate-400 hidden xl:block" />
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 pt-0.5 leading-snug">{st.title}</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
              {[
                {
                  step: '01',
                  title: 'List with Evidence',
                  desc: 'Upload multi-angle mobile photos, disclose cosmetic wear, and note serial numbers.',
                },
                {
                  step: '02',
                  title: 'Negotiate',
                  desc: 'Review binding buyer offers. Accept, decline, or counter without time-wasting.',
                },
                {
                  step: '03',
                  title: 'Pay Through Platform',
                  desc: 'Receive confirmation once the buyer funds the purchase into platform protection.',
                },
                {
                  step: '04',
                  title: 'Choose Delivery',
                  desc: 'Ship using a tracked carrier label or meet locally to verify exchange via buyer OTP.',
                },
                {
                  step: '05',
                  title: 'Buyer Inspects',
                  desc: 'Buyer conducts physical inspection against your original listing description.',
                },
                {
                  step: '06',
                  title: 'Payout Released',
                  desc: 'Funds disburse directly to your account upon buyer approval or inspection window expiry.',
                },
              ].map((st, idx) => (
                <div
                  key={st.step}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                        {st.step}
                      </span>
                      {idx < 5 && (
                        <ChevronRight className="w-4 h-4 text-slate-400 hidden xl:block" />
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 pt-0.5 leading-snug">{st.title}</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Transaction Assurance Covenant Bar */}
          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Platform Safeguard:</strong> Payments are retained in platform protection until the listing’s inspection period concludes without an active dispute.
              </span>
            </div>
            <Link to="/how-it-works">
              <Button variant="outline" size="sm" className="whitespace-nowrap text-xs">
                Detailed Guide →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Two Flexible Delivery Options */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
            Fulfillment Methods
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Two Flexible Delivery Options
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Choose the fulfillment method that best matches your preference, whether you prefer doorstep carrier logistics or an in-person exchange.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Option A: Tracked Courier Delivery */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <Truck className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tracked Courier Delivery</h3>
                  <span className="text-[11px] text-slate-500">Tracked carrier shipment with doorstep confirmation</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                The seller ships using a tracked parcel carrier. Transit progress is tracked end-to-end, and the package requires delivery confirmation scan upon arrival at the destination address.
              </p>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Tracking & Delivery Confirmation</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  End-to-end milestone scans verify package dispatch, transit, and final delivery, with applicable carrier protection against loss or damage in transit.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              Suitable for long-distance transactions across cities.
            </div>
          </div>

          {/* Option B: Direct Physical Handover with OTP */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <QrCode className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Direct Physical Handover with OTP</h3>
                  <span className="text-[11px] text-slate-500">Local in-person meetup authenticated by one-time code</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Meet locally in a safe public setting. The buyer generates a secure 6-digit one-time passcode (OTP) inside the platform and presents it to the seller to record physical receipt.
              </p>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Recorded Handover Without Cash Vulnerabilities</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Eliminates carrying large sums of cash. Entering the buyer’s OTP records physical receipt instantly in platform records.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              Ideal for local exchanges, heavy furniture, or fragile optics.
            </div>
          </div>
        </div>

        {/* Prominent Mandatory Note */}
        <div className="mt-6 p-4 sm:p-5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-950">
              Important: Delivery confirmation does not mean product satisfaction.
            </p>
            <p className="text-amber-900/90 leading-relaxed">
              Whether an item arrives via tracked courier or is exchanged in person via OTP, the physical transfer only initiates the inspection window. Funds remain safely held by the platform and seller payout is never released until the buyer confirms satisfaction or the configurable inspection window concludes without an open dispute.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Trust & Safety Architecture – 6 Compact Cards in 3-Column Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 shadow-xs">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
              Risk Reduction Architecture
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Trust & Safety Architecture
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              ONTRA is built on structural controls designed to align buyer and seller incentives, reduce transaction friction, and ensure transparent evidence at every step.
            </p>
          </div>

          {/* 6 Key Architecture Cards in 3-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: In-Platform Negotiation */}
            <div className="p-5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <MessageSquare className="w-5 h-5 text-slate-800 mb-2.5" />
                <h3 className="text-xs font-bold text-slate-900">1. In-Platform Negotiation</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Binding offers, counter-offers, and transaction terms remain archived in the order thread, creating a documented evidentiary trail.
                </p>
              </div>
            </div>

            {/* Card 2: Detailed Product Information */}
            <div className="p-5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <FileText className="w-5 h-5 text-slate-800 mb-2.5" />
                <h3 className="text-xs font-bold text-slate-900">2. Detailed Product Information</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Mandatory multi-angle photographs, declared cosmetic wear, and serial numbers establish baseline evidence before purchase.
                </p>
              </div>
            </div>

            {/* Card 3: Protected Payment Workflow */}
            <div className="p-5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <Lock className="w-5 h-5 text-slate-800 mb-2.5" />
                <h3 className="text-xs font-bold text-slate-900">3. Protected Payment Workflow</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Purchase payments are held securely by the platform during transit and throughout the physical inspection period.
                </p>
              </div>
            </div>

            {/* Card 4: Auditable Transaction History */}
            <div className="p-5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <History className="w-5 h-5 text-slate-800 mb-2.5" />
                <h3 className="text-xs font-bold text-slate-900">4. Auditable Transaction History</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Every order milestone—offer acceptance, payment holding, courier tracking scans, and OTP handovers—is logged with audit timestamps.
                </p>
              </div>
            </div>

            {/* Card 5: Inspection & Dispute Support */}
            <div className="p-5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <Scale className="w-5 h-5 text-slate-800 mb-2.5" />
                <h3 className="text-xs font-bold text-slate-900">5. Inspection & Dispute Support</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  If an item deviates from the listing description, payout is paused immediately while platform support reviews photo evidence.
                </p>
              </div>
            </div>

            {/* Card 6: Verified Transaction Reviews */}
            <div className="p-5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <Star className="w-5 h-5 text-slate-800 mb-2.5" />
                <h3 className="text-xs font-bold text-slate-900">6. Verified Transaction Reviews</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Only buyers and sellers who successfully complete actual transactions can leave ratings and feedback, preventing fake reviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
