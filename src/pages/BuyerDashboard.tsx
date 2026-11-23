/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../hooks/useToast.ts';
import { useWishlist } from '../context/WishlistContext.tsx';
import { transactionService } from '../services/transactionService.ts';
import { 
  Transaction, 
  BuyerDashboardTab, 
  BuyerNegotiationThread, 
  RecentlyViewedItem 
} from '../types/index.ts';
import { 
  MOCK_BUYER_THREADS, 
  MOCK_RECENTLY_VIEWED, 
  MOCK_USERS 
} from '../data/mockData.ts';
import { BuyerSidebar } from '../components/buyer/BuyerSidebar.tsx';
import { BuyerOverviewTab } from '../components/buyer/BuyerOverviewTab.tsx';
import { BuyerMessagesTab } from '../components/buyer/BuyerMessagesTab.tsx';
import { BuyerOrdersTab } from '../components/buyer/BuyerOrdersTab.tsx';
import { BuyerOffersTab } from '../components/buyer/BuyerOffersTab.tsx';
import { BuyerInspectionTab } from '../components/buyer/BuyerInspectionTab.tsx';
import { BuyerDeliveryTab } from '../components/buyer/BuyerDeliveryTab.tsx';
import { BuyerWishlistTab } from '../components/buyer/BuyerWishlistTab.tsx';
import { BuyerCheckoutModal } from '../components/buyer/BuyerCheckoutModal.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { Button } from '../components/ui/Button.tsx';
import { formatCurrency, formatDate, formatDateTimeIST } from '../utils/formatters.ts';
import { 
  Menu, 
  ShieldCheck, 
  Star, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { wishlistCount } = useWishlist();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as BuyerDashboardTab) || 'overview';
  const [currentTab, setCurrentTab] = useState<BuyerDashboardTab>(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as BuyerDashboardTab | null;
    if (tabParam) {
      setCurrentTab(tabParam);
    }
  }, [searchParams]);

  const handleSelectTab = (tab: BuyerDashboardTab) => {
    setCurrentTab(tab);
    setSearchParams({ tab });
  };

  // Core state for buyer transactions, negotiation threads, and inspection
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [threads, setThreads] = useState<BuyerNegotiationThread[]>(MOCK_BUYER_THREADS);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(MOCK_RECENTLY_VIEWED);

  // Active Inspection Modal
  const [inspectingTx, setInspectingTx] = useState<Transaction | null>(null);

  // Checkout Modal State
  const [checkoutModalState, setCheckoutModalState] = useState<{
    isOpen: boolean;
    thread: BuyerNegotiationThread | null;
    agreedPrice: number;
  }>({
    isOpen: false,
    thread: null,
    agreedPrice: 0,
  });

  useEffect(() => {
    transactionService.getTransactions(user?.id).then((res) => {
      setTransactions(res.data);
    });
  }, [user]);

  // Inspection approval
  const handleApproveInspection = async (txId: string) => {
    try {
      await transactionService.approveInspection(txId);
      showToast(
        'Inspection Approved & Payout Disbursed',
        'Physical inspection confirmed. Escrow vault has released guaranteed funds to Rohan Mehta.',
        'success'
      );
      setInspectingTx(null);
      const res = await transactionService.getTransactions(user?.id);
      setTransactions(res.data);
    } catch {
      showToast('Error', 'Could not complete inspection approval', 'error');
    }
  };

  // Dispute filing
  const handleRaiseDispute = async (txId: string) => {
    try {
      await transactionService.raiseDispute(
        txId,
        'item_not_as_described',
        'Buyer flagged microscopic cosmetic discrepancy not documented in original listing.'
      );
      showToast(
        'Dispute Opened & Escrow Locked',
        'Seller payout halted. ONTRA certified arbitrator will review within 24 hours.',
        'warning'
      );
      setInspectingTx(null);
      const res = await transactionService.getTransactions(user?.id);
      setTransactions(res.data);
    } catch {
      showToast('Error', 'Could not file dispute', 'error');
    }
  };

  // Update conversation thread in state
  const handleUpdateThread = (updated: BuyerNegotiationThread) => {
    setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Open Checkout Modal for accepted offer
  const handleProceedToCheckout = (thread: BuyerNegotiationThread, agreedPrice: number) => {
    setCheckoutModalState({
      isOpen: true,
      thread,
      agreedPrice,
    });
  };

  // Confirm order execution from modal
  const handleConfirmOrder = ({
    productId,
    agreedPrice,
    deliveryMethod,
    paymentMethod,
  }: {
    productId: string;
    agreedPrice: number;
    deliveryMethod: 'courier' | 'direct_handover';
    paymentMethod: 'upi' | 'debit_card' | 'credit_card' | 'net_banking' | 'card' | 'bank_wire';
  }) => {
    // Navigate to Orders or Overview
    setCurrentTab('orders');
  };

  const counts = {
    activeOrders: 1,
    pendingInspections: 1,
    unreadMessages: threads.reduce((acc, t) => acc + t.unreadCount, 0),
    wishlistCount,
    notificationsCount: 2,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Buyer Header & Trust Metric Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
            {user?.name?.charAt(0) || 'A'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-700" />
                Buyer Console
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> ID Verified Member
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Welcome back, {user?.name || 'Ananya Sharma'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>{user?.city || 'Jaipur, Rajasthan'}</span>
              <span>·</span>
              <span className="flex items-center gap-1 font-semibold text-slate-900">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.96 ★
              </span>
              <span>·</span>
              <span>14 completed purchases</span>
              <span>·</span>
              <span className="font-bold text-blue-900">98% Trust Score</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileSidebarOpen(true)}
            leftIcon={<Menu className="w-4 h-4" />}
            className="lg:hidden text-xs"
          >
            Menu
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentTab('messages')}
            className="text-xs font-semibold"
          >
            Negotiations ({threads.length})
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentTab('inspection')}
            className="bg-slate-900 hover:bg-slate-800 text-xs font-semibold shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1"></span>
            Active Inspection (~22h)
          </Button>
        </div>
      </div>

      {/* 2. Main Layout Split (Sidebar + Active Tab) */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        <BuyerSidebar
          currentTab={currentTab}
          onSelectTab={(tab) => handleSelectTab(tab)}
          counts={counts}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <div className="flex-1 w-full min-w-0">
          {currentTab === 'overview' && (
            <BuyerOverviewTab
              transactions={transactions}
              recentlyViewed={recentlyViewed}
              onNavigateTab={(tab) => handleSelectTab(tab)}
              onOpenInspectionModal={(tx) => setInspectingTx(tx)}
            />
          )}

          {currentTab === 'messages' && (
            <BuyerMessagesTab
              threads={threads}
              onUpdateThread={handleUpdateThread}
              onProceedToCheckout={handleProceedToCheckout}
            />
          )}

          {currentTab === 'orders' && (
            <BuyerOrdersTab
              transactions={transactions}
              onOpenInspectionModal={(tx) => setInspectingTx(tx)}
              onNavigateToMessages={() => handleSelectTab('messages')}
            />
          )}

          {currentTab === 'offers' && (
            <BuyerOffersTab
              threads={threads}
              onNavigateToThread={(_threadId) => {
                handleSelectTab('messages');
              }}
              onProceedToCheckout={handleProceedToCheckout}
            />
          )}

          {currentTab === 'inspection' && transactions[0] && (
            <BuyerInspectionTab
              transaction={transactions[0]}
              onApprove={handleApproveInspection}
              onRaiseDispute={handleRaiseDispute}
            />
          )}

          {currentTab === 'delivery' && (
            <BuyerDeliveryTab />
          )}

          {currentTab === 'wishlist' && (
            <BuyerWishlistTab />
          )}

          {currentTab === 'payments' && (
            <BuyerOrdersTab
              transactions={transactions}
              onOpenInspectionModal={(tx) => setInspectingTx(tx)}
              onNavigateToMessages={() => handleSelectTab('messages')}
            />
          )}

          {currentTab === 'disputes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Dispute & Refund Protection</h2>
                  <p className="text-xs text-slate-500">
                    If an item arrives damaged or discrepant, you have 48 hours to freeze funds and request neutral arbitration.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/disputes"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <span>Dispute Desk</span>
                    <span>→</span>
                  </Link>
                  <Link
                    to="/refunds"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    <span>Refund Statements</span>
                  </Link>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900">Dispute #DISP-98412</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Under Admin Review
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-xs">{formatCurrency(14500)} Held</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Leica M6 TTL 0.72x Black Chrome 35mm Rangefinder
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Reason: Undisclosed Defects. Seller Rohan Mehta submitted response with service certificate. Neutral arbitrator Priya Nair reviewing findings.
                </p>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <a
                    href="/disputes/DISP-98412"
                    className="text-slate-900 hover:underline font-semibold text-xs"
                  >
                    View Dispute Timeline & Evidence →
                  </a>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Purchase & Transaction History</h2>
                  <p className="text-xs text-slate-500">Complete historical audit trail for all your marketplace transactions.</p>
                </div>
                <a
                  href="/transactions"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <span>Open Full Transaction Ledger</span>
                  <span>→</span>
                </a>
              </div>
              <BuyerOrdersTab
                transactions={transactions}
                onOpenInspectionModal={(tx) => setInspectingTx(tx)}
                onNavigateToMessages={() => setCurrentTab('messages')}
              />
            </div>
          )}

          {currentTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Verified Reviews & Feedback</h2>
                  <p className="text-xs text-slate-500">Reviews published after inspection passing and seller settlement.</p>
                </div>
                <a
                  href="/reviews"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                >
                  <span>View All Marketplace Reviews</span>
                  <span>→</span>
                </a>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">For: Rohan Mehta (Apple MacBook Pro 16" M3 Max)</span>
                  <span className="text-slate-400 font-mono text-[10px]">{formatDate('2026-09-15')}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
                <p className="text-slate-600 leading-relaxed">
                  "Item arrived in condition better than described. Shutter speeds matched factory specs exactly. Flawless transaction."
                </p>
              </div>
            </div>
          )}

          {currentTab === 'notifications' && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">Buyer Notifications</h2>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs flex items-start gap-3">
                <Clock className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Doorstep Delivery Recorded (Shiprocket-Compatible Courier)</p>
                  <p className="text-slate-600 mt-0.5">
                    Your 48-hour physical inspection countdown for Apple MacBook Pro #tx_98412 is active until {formatDateTimeIST('2026-11-05T08:45:00Z')}.
                  </p>
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Offer Counter Received from Rohan Mehta</p>
                  <p className="text-slate-600 mt-0.5">
                    Rohan Mehta countered at {formatCurrency(31000)} for the Apple MacBook Pro 16&quot; M3 Max.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4 max-w-xl text-xs">
              <h2 className="text-base font-bold text-slate-900">Buyer Delivery Profile & Address</h2>
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Recipient Name</label>
                <input
                  type="text"
                  defaultValue="Ananya Sharma"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Delivery Address</label>
                <input
                  type="text"
                  defaultValue="Flat 304, Prithviraj Road, C-Scheme, Jaipur, Rajasthan 302001, India"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => showToast('Address Saved', 'Default shipping destination updated.', 'success')}
                className="bg-blue-900"
              >
                Save Preferences
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Inspection Modal Dialog */}
      {inspectingTx && (
        <Modal
          isOpen={!!inspectingTx}
          onClose={() => setInspectingTx(null)}
          title="48-Hour Hands-On Inspection Checklist"
          subtitle={`Item: ${inspectingTx.productTitle} · Vault Deposit: ${formatCurrency(inspectingTx.agreedPrice)}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900">Escrow Security Covenant:</p>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Carrier confirmed doorstep delivery. You have until <strong>{formatDateTimeIST('2026-11-05T08:45:00Z')}</strong> to test mechanical timing and cosmetics against the seller manifest. Your funds will only be released once you approve below.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
                <span>Chassis and caseback serial matches manifest</span>
              </label>
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
                <span>Cosmetic condition matches documented defects</span>
              </label>
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
                <span>Mechanical movement and dials actuate correctly</span>
              </label>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRaiseDispute(inspectingTx.id)}
                className="text-rose-600 hover:text-rose-700 w-full sm:w-auto text-xs"
              >
                Report Discrepancy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApproveInspection(inspectingTx.id)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold w-full sm:w-auto text-xs"
              >
                Approve & Release Seller Payout
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Escrow Checkout Modal Connected to Accepted Offer */}
      {checkoutModalState.isOpen && (
        <BuyerCheckoutModal
          isOpen={checkoutModalState.isOpen}
          onClose={() => setCheckoutModalState({ isOpen: false, thread: null, agreedPrice: 0 })}
          thread={checkoutModalState.thread}
          agreedPrice={checkoutModalState.agreedPrice}
          onConfirmOrder={handleConfirmOrder}
        />
      )}
    </div>
  );
};
