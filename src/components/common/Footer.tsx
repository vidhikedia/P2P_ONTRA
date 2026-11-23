/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, RefreshCw } from 'lucide-react';
import { PolicyModal, PolicyKey } from './PolicyModal.tsx';

export const Footer: React.FC = () => {
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null);

  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-600">
      {/* Trust Guarantee Highlights */}
      <div className="border-b border-slate-100 bg-slate-50/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Proof-Before-Payment</p>
                <p className="text-slate-500 mt-0.5">Sellers upload timestamped optical evidence and serial verification before listing.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Protected Escrow Workflow</p>
                <p className="text-slate-500 mt-0.5">Buyer funds remain locked in escrow until the inspection window concludes.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">48-Hour Inspection Window</p>
                <p className="text-slate-500 mt-0.5">Physical hands-on verification against the listing manifest before payout is released.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Impartial Dispute Desk</p>
                <p className="text-slate-500 mt-0.5">Certified arbitrators review evidence discrepancies with guaranteed return protection.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Sitemap with 100% Working Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand & Purpose */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                O
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">ONTRA</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Online Network for Trusted Resale and Access — Buy Smart. Sell Easy. Trust Every Deal. Built for India with timestamped evidence, INR escrow protection, pan-India courier or local OTP handover, and delayed seller settlement.
            </p>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} ONTRA Marketplace India. All rights reserved.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('about_us')}
                  className="hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('contact')}
                  className="hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('help_centre')}
                  className="hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  Help Centre
                </button>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-slate-900 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Guidelines</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('buyer_guidelines')}
                  className="hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  Buyer Guidelines
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('seller_guidelines')}
                  className="hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  Seller Guidelines
                </button>
              </li>
              <li>
                <Link to="/categories" className="hover:text-slate-900 transition-colors">
                  Category Evidence
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-slate-900 transition-colors">
                  Explore Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Legal & Policies</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('terms_conditions')}
                  className="hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('privacy_policy')}
                  className="hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('refund_dispute_policy')}
                  className="hover:text-slate-900 transition-colors text-left cursor-pointer"
                >
                  Refund and Dispute Policy
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Policy Modal Viewer */}
      <PolicyModal policyKey={activePolicy} onClose={() => setActivePolicy(null)} />
    </footer>
  );
};
