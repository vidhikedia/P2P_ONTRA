/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../hooks/useToast.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';
import { adminService } from '../services/adminService.ts';
import { disputeService } from '../services/disputeService.ts';
import { transactionService } from '../services/transactionService.ts';
import {
  AdminTab,
  AdminOverviewMetrics,
  AdminUserRecord,
  AdminVerificationRecord,
  AdminProductModerationItem,
  AdminPaymentRecord,
  AdminSettlementRecord,
  AdminAuditLog,
  AdminReportItem,
  PlatformFeeConfig,
  CategoryManagementItem,
  DisputeCase,
  AdminDecisionType,
  Transaction,
} from '../types/index.ts';
import { Button } from '../components/ui/Button.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Package,
  ShoppingCart,
  CreditCard,
  Banknote,
  Scale,
  RotateCcw,
  Star,
  Flag,
  Layers,
  Percent,
  History,
  Settings,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  AlertTriangle,
  Check,
  X,
  FileText,
  Truck,
  QrCode,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Lock,
  Unlock,
  Clock,
  UserCheck,
  UserX,
  ChevronRight,
  Info,
  Sparkles,
  Video,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Send,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [metrics, setMetrics] = useState<AdminOverviewMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [verifications, setVerifications] = useState<AdminVerificationRecord[]>([]);
  const [listings, setListings] = useState<AdminProductModerationItem[]>([]);
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [settlements, setSettlements] = useState<AdminSettlementRecord[]>([]);
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [categories, setCategories] = useState<CategoryManagementItem[]>([]);
  const [feeConfig, setFeeConfig] = useState<PlatformFeeConfig | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Filtering & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [listingStatusFilter, setListingStatusFilter] = useState('all');

  // Modals & Selection
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<AdminVerificationRecord | null>(null);
  const [selectedListing, setSelectedListing] = useState<AdminProductModerationItem | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null);

  // Action Modals
  const [isUserActionModalOpen, setIsUserActionModalOpen] = useState(false);
  const [userActionType, setUserActionType] = useState<'suspended' | 'restricted' | 'active'>('suspended');
  const [userActionReason, setUserActionReason] = useState('');

  const [isListingActionModalOpen, setIsListingActionModalOpen] = useState(false);
  const [listingActionType, setListingActionType] = useState<'approved' | 'rejected' | 'flagged'>('approved');
  const [listingActionNotes, setListingActionNotes] = useState('');

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<AdminDecisionType>('approve_full_refund');
  const [partialRefundAmount, setPartialRefundAmount] = useState<number>(5000);
  const [reasoningText, setReasoningText] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Settings State
  const [editedFeeConfig, setEditedFeeConfig] = useState<PlatformFeeConfig | null>(null);

  // Load all initial data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [mRes, uRes, vRes, lRes, oRes, pRes, sRes, dRes, rRes, cRes, fRes, aRes] = await Promise.all([
        adminService.getOverviewMetrics(),
        adminService.getUsers(),
        adminService.getVerificationRequests(),
        adminService.getModerationListings(),
        transactionService.getTransactions(),
        adminService.getPaymentRecords(),
        adminService.getSettlementRecords(),
        disputeService.getDisputes(),
        adminService.getReports(),
        adminService.getCategories(),
        adminService.getFeeConfig(),
        adminService.getAuditLogs(),
      ]);

      if (mRes.data) setMetrics(mRes.data);
      if (uRes.data) setUsers(uRes.data);
      if (vRes.data) setVerifications(vRes.data);
      if (lRes.data) setListings(lRes.data);
      if (oRes.data) setOrders(oRes.data);
      if (pRes.data) setPayments(pRes.data);
      if (sRes.data) setSettlements(sRes.data);
      if (dRes.data) {
        setDisputes(dRes.data);
        if (dRes.data.length > 0) setSelectedDispute(dRes.data[0]);
      }
      if (rRes.data) setReports(rRes.data);
      if (cRes.data) setCategories(cRes.data);
      if (fRes.data) {
        setFeeConfig(fRes.data);
        setEditedFeeConfig(fRes.data);
      }
      if (aRes.data) setAuditLogs(aRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
      showToast('Error', 'Failed to load dashboard data. Retrying...', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.city.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered listings
  const filteredListings = listings.filter((l) => {
    if (listingStatusFilter === 'all') return true;
    return l.status === listingStatusFilter;
  });

  // Handlers
  const handleExecuteUserAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await adminService.updateUserStatus(selectedUser.id, userActionType, userActionReason);
      showToast('Status Updated', `User account ${selectedUser.name} is now ${userActionType}.`, 'success');
      setIsUserActionModalOpen(false);
      setUserActionReason('');
      // Reload users & audit logs
      const [uRes, aRes] = await Promise.all([adminService.getUsers(), adminService.getAuditLogs()]);
      if (uRes.data) setUsers(uRes.data);
      if (aRes.data) setAuditLogs(aRes.data);
    } catch (err) {
      showToast('Error', 'Failed to update user status.', 'error');
    }
  };

  const handleExecuteListingModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    try {
      await adminService.moderateListing(selectedListing.id, listingActionType, listingActionNotes);
      showToast('Listing Moderated', `Listing status set to ${listingActionType}.`, 'success');
      setIsListingActionModalOpen(false);
      setListingActionNotes('');
      // Reload listings & audit logs
      const [lRes, aRes] = await Promise.all([adminService.getModerationListings(), adminService.getAuditLogs()]);
      if (lRes.data) setListings(lRes.data);
      if (aRes.data) setAuditLogs(aRes.data);
    } catch (err) {
      showToast('Error', 'Failed to update listing moderation status.', 'error');
    }
  };

  const handleReviewVerification = async (id: string, decision: 'approved' | 'rejected') => {
    try {
      await adminService.reviewVerification(id, decision);
      showToast(
        decision === 'approved' ? 'KYC Approved' : 'KYC Rejected',
        `Seller verification has been ${decision}.`,
        decision === 'approved' ? 'success' : 'warning'
      );
      setSelectedVerification(null);
      const [vRes, uRes, aRes] = await Promise.all([
        adminService.getVerificationRequests(),
        adminService.getUsers(),
        adminService.getAuditLogs(),
      ]);
      if (vRes.data) setVerifications(vRes.data);
      if (uRes.data) setUsers(uRes.data);
      if (aRes.data) setAuditLogs(aRes.data);
    } catch (err) {
      showToast('Error', 'Failed to record verification decision.', 'error');
    }
  };

  const handleOpenDecisionModal = (type: AdminDecisionType) => {
    setDecisionType(type);
    if (selectedDispute && type === 'approve_partial_refund') {
      setPartialRefundAmount(Math.round(selectedDispute.agreedPrice * 0.25));
    }
    setReasoningText('');
    setIsDecisionModalOpen(true);
  };

  const handleExecuteDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;

    if (!reasoningText.trim()) {
      showToast('Reason Required', 'You must record the objective reason for this arbitration decision.', 'warning');
      return;
    }

    setIsSubmittingDecision(true);
    try {
      const res = await disputeService.submitAdminDecision(selectedDispute.id, {
        decision: decisionType,
        reasoning: reasoningText.trim(),
        arbitratorName: user?.name || 'Priya Nair (Senior Neutral Arbitrator)',
        refundAmount: decisionType === 'approve_partial_refund' ? partialRefundAmount : selectedDispute.agreedPrice,
      });

      if (res.data) {
        setSelectedDispute(res.data.dispute);
        showToast('Binding Decision Recorded', 'Arbitration ruling executed and recorded to transaction ledger.', 'success');
        setIsDecisionModalOpen(false);
        const [dRes, aRes] = await Promise.all([disputeService.getDisputes(), adminService.getAuditLogs()]);
        if (dRes.data) setDisputes(dRes.data);
        if (aRes.data) setAuditLogs(aRes.data);
      }
    } catch (err) {
      showToast('Error', 'Failed to record decision.', 'error');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleSaveFeeConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedFeeConfig) return;
    try {
      const res = await adminService.updateFeeConfig(editedFeeConfig);
      if (res.data) {
        setFeeConfig(res.data);
        showToast('Policies Saved', 'Platform fee and escrow rules updated successfully.', 'success');
        const aRes = await adminService.getAuditLogs();
        if (aRes.data) setAuditLogs(aRes.data);
      }
    } catch (err) {
      showToast('Error', 'Failed to update fee policies.', 'error');
    }
  };

  const handleToggleCategoryLock = async (catId: string) => {
    try {
      await adminService.toggleCategoryLock(catId);
      const cRes = await adminService.getCategories();
      if (cRes.data) setCategories(cRes.data);
      showToast('Updated', 'Category lock status updated.', 'info');
    } catch (err) {
      showToast('Error', 'Failed to update category.', 'error');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await adminService.resolveReport(reportId, 'Reviewed by trust & safety; appropriate moderation action taken.');
      showToast('Report Resolved', 'Flag has been processed and closed.', 'success');
      const rRes = await adminService.getReports();
      if (rRes.data) setReports(rRes.data);
    } catch (err) {
      showToast('Error', 'Failed to resolve report.', 'error');
    }
  };

  // Nav menu items definition
  const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" />, badge: users.filter((u) => u.status === 'suspended').length || undefined },
    { id: 'verification', label: 'Seller Verification', icon: <ShieldCheck className="w-4 h-4" />, badge: verifications.filter((v) => v.status === 'pending').length || undefined },
    { id: 'products', label: 'Product Moderation', icon: <Package className="w-4 h-4" />, badge: listings.filter((l) => l.status === 'flagged').length || undefined },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'settlements', label: 'Settlements', icon: <Banknote className="w-4 h-4" />, badge: settlements.filter((s) => s.status === 'scheduled').length || undefined },
    { id: 'disputes', label: 'Disputes & Arbitration', icon: <Scale className="w-4 h-4" />, badge: disputes.filter((d) => d.currentStatus === 'under_admin_review').length || undefined },
    { id: 'refunds', label: 'Refunds', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Flags', icon: <Flag className="w-4 h-4" />, badge: reports.filter((r) => r.status === 'open').length || undefined },
    { id: 'categories', label: 'Categories', icon: <Layers className="w-4 h-4" /> },
    { id: 'fees', label: 'Platform Fees & Policies', icon: <Percent className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Logs', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Notice Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold tracking-wide uppercase text-[10px]">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Admin Command Center
          </span>
          <span className="text-slate-300">
            ONTRA Governance & Neutral Arbitration Portal (Role: {user?.role || 'admin'})
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Demo Environment • Protected Route</span>
          <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
            Exit to Marketplace <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                ON
              </div>
              <div>
                <h1 className="font-bold text-sm text-white leading-tight">ONTRA Admin</h1>
                <p className="text-[11px] text-slate-400">Platform Operations</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-blue-800 text-white' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Admin User Card */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-xs">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@ontra.in'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Loading administrative ledgers...</p>
            </div>
          ) : (
            <>
              {/* SECTION: OVERVIEW */}
              {activeTab === 'overview' && metrics && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">Platform Command Overview</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Real-time operational status, escrow liquidity and neutral dispute metrics.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Escrow Engine Healthy
                      </span>
                    </div>
                  </div>

                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-medium text-slate-500 block">Registered Users</span>
                      <span className="text-lg font-bold text-slate-900 mt-1 block">
                        {metrics.totalUsers.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {metrics.buyersCount.toLocaleString('en-IN')} Buyers • {metrics.sellersCount.toLocaleString('en-IN')} Sellers
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-medium text-slate-500 block">Active Listings</span>
                      <span className="text-lg font-bold text-slate-900 mt-1 block">
                        {metrics.activeListings.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                        100% Serial Verification
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-medium text-slate-500 block">Total Orders</span>
                      <span className="text-lg font-bold text-slate-900 mt-1 block">
                        {metrics.totalOrders.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {metrics.completedTransactions.toLocaleString('en-IN')} Completed
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-medium text-slate-500 block">Escrow In Hold</span>
                      <span className="text-lg font-bold text-blue-700 mt-1 block">
                        {formatCurrency(metrics.escrowHolding)}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {metrics.pendingSettlements} Pending 48h Inspection
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-medium text-slate-500 block">Open Disputes</span>
                      <span className="text-lg font-bold text-rose-700 mt-1 block">
                        {metrics.openDisputes}
                      </span>
                      <span className="text-[10px] text-rose-600 font-medium mt-0.5 block">
                        Under Admin Review
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-medium text-slate-500 block">Platform Revenue</span>
                      <span className="text-lg font-bold text-emerald-700 mt-1 block">
                        {formatCurrency(metrics.platformRevenue)}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        1.5% Buyer Protection Fee
                      </span>
                    </div>
                  </div>

                  {/* Operational Alerts & Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                          <Scale className="w-4 h-4 text-rose-700" />
                          <span>Arbitration Docket ({disputes.length})</span>
                        </div>
                        <p className="text-xs text-rose-800/80 mt-1.5 leading-relaxed">
                          Cases requiring neutral 7-point evidence review and binding resolution.
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveTab('disputes')}
                        className="mt-3 bg-rose-900 hover:bg-rose-950 text-white font-semibold text-xs justify-center"
                      >
                        Enter Arbitration Docket
                      </Button>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                          <ShieldCheck className="w-4 h-4 text-blue-700" />
                          <span>Seller KYC Queue ({verifications.filter((v) => v.status === 'pending').length})</span>
                        </div>
                        <p className="text-xs text-blue-800/80 mt-1.5 leading-relaxed">
                          Sellers awaiting government ID, facial match, and bank account ownership review.
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveTab('verification')}
                        className="mt-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs justify-center"
                      >
                        Review Verification Queue
                      </Button>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          <span>Flagged Listings ({listings.filter((l) => l.status === 'flagged').length})</span>
                        </div>
                        <p className="text-xs text-amber-800/80 mt-1.5 leading-relaxed">
                          Community reported or AI-flagged product manifests pending moderator review.
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveTab('products')}
                        className="mt-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs justify-center"
                      >
                        Inspect Flagged Listings
                      </Button>
                    </div>
                  </div>

                  {/* Recent Audit Stream */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-500" />
                        Platform Governance Audit Log
                      </h3>
                      <button
                        onClick={() => setActiveTab('audit')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        View Full Ledger <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {auditLogs.slice(0, 4).map((log) => (
                        <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                          <div>
                            <span className="font-semibold text-slate-900">{log.action}</span>
                            <p className="text-slate-600 mt-0.5">{log.details}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-[11px] text-slate-400 block">{log.timestamp}</span>
                            <span className="text-[10px] text-slate-500">{log.adminName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: USER MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">User Management</h2>
                      <p className="text-xs text-slate-500">
                        Inspect user accounts, verification standing, trust score metrics, and manage account restrictions.
                      </p>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 shadow-xs">
                    <div className="flex-1 min-w-[240px] relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, or city..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Role:</span>
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700"
                      >
                        <option value="all">All Roles</option>
                        <option value="buyer">Buyers</option>
                        <option value="seller">Sellers</option>
                        <option value="admin">Admins</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Status:</span>
                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                        className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="restricted">Restricted</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-3">User & Contact</th>
                          <th className="p-3">Role & Location</th>
                          <th className="p-3">Verification Badges</th>
                          <th className="p-3">Trust Score</th>
                          <th className="p-3">Transactions</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              No users match the search criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-3">
                                <div className="font-semibold text-slate-900">{u.name}</div>
                                <div className="text-slate-500 text-[11px] font-mono">{u.email}</div>
                                <div className="text-slate-400 text-[10px]">{u.phone}</div>
                              </td>
                              <td className="p-3">
                                <span className="inline-block px-2 py-0.5 rounded font-semibold text-[10px] uppercase bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                                  {u.role}
                                </span>
                                <div className="text-slate-500 text-[11px]">{u.city}</div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col gap-1 text-[11px]">
                                  <span className={`inline-flex items-center gap-1 ${u.identityStatus === 'verified' ? 'text-emerald-700' : 'text-slate-400'}`}>
                                    <CheckCircle2 className="w-3 h-3" /> ID: {u.identityStatus}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 ${u.bankStatus === 'verified' ? 'text-emerald-700' : 'text-slate-400'}`}>
                                    <CheckCircle2 className="w-3 h-3" /> Bank: {u.bankStatus}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                  <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs">
                                    {u.trustScore}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="font-semibold text-slate-900">{u.totalTransactions}</span>
                                <span className="text-[10px] text-slate-400 block">{u.disputesInvolved} disputes</span>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    u.status === 'active'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : u.status === 'restricted'
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {u.status}
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setUserActionType(u.status === 'suspended' ? 'active' : 'suspended');
                                    setIsUserActionModalOpen(true);
                                  }}
                                  className="text-[11px] py-1 px-2.5 h-auto"
                                >
                                  Manage
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: SELLER VERIFICATION */}
              {activeTab === 'verification' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Seller KYC Verification Queue</h2>
                      <p className="text-xs text-slate-500">
                        Inspect submitted government identity documents, live facial selfies, and bank account ownership proof.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {verifications.map((v) => (
                      <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block">{v.id}</span>
                            <h3 className="font-bold text-sm text-slate-900">{v.sellerName}</h3>
                            <p className="text-xs text-slate-500">{v.email} • {v.phone}</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              v.status === 'pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : v.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>

                        {/* Document Photo Previews */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-slate-500 block">Government ID</span>
                            <img
                              src={v.idDocumentUrl}
                              alt="ID Proof"
                              className="w-full h-24 object-cover rounded-lg border border-slate-200"
                            />
                            <span className="text-[9px] text-slate-400 font-mono block truncate">
                              {v.idType.toUpperCase()}: {v.idDocNumber}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-slate-500 block">Live Liveness Match</span>
                            <img
                              src={v.selfieWithIdUrl}
                              alt="Selfie Match"
                              className="w-full h-24 object-cover rounded-lg border border-slate-200"
                            />
                            <span className="text-[9px] text-emerald-600 font-semibold block">Face Match: 99.2%</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-slate-500 block">Bank Account Proof</span>
                            <img
                              src={v.bankProofUrl}
                              alt="Bank Statement"
                              className="w-full h-24 object-cover rounded-lg border border-slate-200"
                            />
                            <span className="text-[9px] text-slate-400 block truncate">Name Verified</span>
                          </div>
                        </div>

                        {v.notes && (
                          <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/60">
                            <strong>Audit Note:</strong> {v.notes}
                          </div>
                        )}

                        {v.status === 'pending' && (
                          <div className="flex gap-2 pt-2 border-t border-slate-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewVerification(v.id, 'rejected')}
                              className="flex-1 text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                              leftIcon={<X className="w-3.5 h-3.5" />}
                            >
                              Reject KYC
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleReviewVerification(v.id, 'approved')}
                              className="flex-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                              leftIcon={<Check className="w-3.5 h-3.5" />}
                            >
                              Approve KYC & Activate Seller
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: PRODUCT MODERATION */}
              {activeTab === 'products' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Product Moderation</h2>
                      <p className="text-xs text-slate-500">
                        Inspect device condition manifests, serial verification photos, and user reports.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Filter:</span>
                      <select
                        value={listingStatusFilter}
                        onChange={(e) => setListingStatusFilter(e.target.value)}
                        className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700"
                      >
                        <option value="all">All Listings</option>
                        <option value="flagged">Flagged Only</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredListings.map((l) => (
                      <div key={l.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="relative">
                            <img
                              src={l.photos[0]}
                              alt={l.title}
                              className="w-full h-40 object-cover rounded-lg border border-slate-200"
                            />
                            {l.videoUrl && (
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1">
                                <Video className="w-3 h-3 text-blue-400" /> Video Manifest
                              </span>
                            )}
                            <span
                              className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                l.status === 'flagged'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : l.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {l.status}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 font-mono block">{l.category}</span>
                            <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">{l.title}</h3>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm font-extrabold text-blue-700">{formatCurrency(l.askingPrice)}</span>
                              <span className="text-xs text-slate-500">Seller: {l.sellerName}</span>
                            </div>
                          </div>

                          <div className="p-2 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">Serial Number:</span>
                              <span className="font-mono font-semibold text-slate-800">{l.serialNumber}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">Serial Verified:</span>
                              <span className={l.serialVerified ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                                {l.serialVerified ? 'Yes (Clean Check)' : 'Unverified / Missing'}
                              </span>
                            </div>
                          </div>

                          {l.reportsCount > 0 && (
                            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
                              <span className="font-bold block flex items-center gap-1">
                                <Flag className="w-3 h-3 text-rose-700" /> {l.reportsCount} User Reports
                              </span>
                              <p className="text-[11px] mt-0.5">{l.reportReasons.join(', ')}</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedListing(l);
                              setListingActionType('approved');
                              setIsListingActionModalOpen(true);
                            }}
                            className="flex-1 text-xs"
                          >
                            Inspect & Moderate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: ORDERS & ESCROW LIFECYCLE */}
              {activeTab === 'orders' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Platform Orders Monitor</h2>
                      <p className="text-xs text-slate-500">
                        Track live transaction lifecycle across Courier and Direct Handover fulfillment workflows.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-3">Order ID & Date</th>
                          <th className="p-3">Product</th>
                          <th className="p-3">Amount & Fees</th>
                          <th className="p-3">Fulfillment Method</th>
                          <th className="p-3">Current Stage</th>
                          <th className="p-3">Inspection Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-3 font-mono">
                              <span className="font-bold text-slate-900 block">{o.id}</span>
                              <span className="text-[10px] text-slate-400">{formatDate(o.timeline?.[0]?.timestamp || '2026-03-04')}</span>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-slate-900 line-clamp-1">{o.productTitle}</div>
                              <div className="text-[11px] text-slate-500">
                                Buyer: {o.buyerName} • Seller: {o.sellerName}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{formatCurrency(o.agreedPrice)}</div>
                              <div className="text-[10px] text-slate-400">Fee: {formatCurrency(o.platformFee ?? Math.round(o.agreedPrice * 0.015))}</div>
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                                {o.deliveryMethod === 'courier' ? (
                                  <>
                                    <Truck className="w-3.5 h-3.5 text-blue-600" /> Courier Delivery
                                  </>
                                ) : (
                                  <>
                                    <QrCode className="w-3.5 h-3.5 text-emerald-600" /> Direct Handover (OTP)
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-semibold uppercase">
                                {o.currentStage.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                                <Clock className="w-3 h-3" /> 48h Window Active
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <Link to={`/order-tracking/${o.id}`}>
                                <Button variant="outline" size="sm" className="text-[11px] py-1 px-2.5 h-auto">
                                  View Journey <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: PAYMENTS & SETTLEMENTS */}
              {(activeTab === 'payments' || activeTab === 'settlements') && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  {/* Transparent Simulation Disclaimer Banner */}
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900 leading-relaxed shadow-xs">
                    <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Simulated Payment & Escrow Payout Monitoring</strong>
                      ONTRA supports Indian payment gateway workflows compatible with Razorpay and Cashfree (UPI, Debit/Credit Cards, Net Banking).
                      In this frontend environment, payment captures and seller disbursements are demo-simulated. No real bank debits or transfers are initiated.
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {activeTab === 'payments' ? 'Payment Transactions Ledger' : 'Seller Payout Settlements'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {activeTab === 'payments'
                          ? 'Audit payment provider hold references, platform commission, and disbursement statuses.'
                          : 'Monitor 48-hour post-inspection payout triggers and scheduled IMPS / NEFT / UPI dispatches.'}
                      </p>
                    </div>
                  </div>

                  {activeTab === 'payments' ? (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <tr>
                            <th className="p-3">Payment Reference</th>
                            <th className="p-3">Order & Product</th>
                            <th className="p-3">Buyer & Seller</th>
                            <th className="p-3">Gross Amount</th>
                            <th className="p-3">Platform Fee (1.5%)</th>
                            <th className="p-3">Payment Status</th>
                            <th className="p-3">Settlement Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payments.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-3">
                                <span className="font-mono font-bold text-slate-900 block">{p.paymentReference}</span>
                                <span className="text-[10px] text-slate-400">{p.timestamp}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-semibold text-slate-900 block line-clamp-1">{p.productTitle}</span>
                                <span className="text-[10px] font-mono text-slate-500">Order: {p.orderId}</span>
                              </td>
                              <td className="p-3">
                                <span className="text-slate-800 block">Buyer: {p.buyerName}</span>
                                <span className="text-slate-500 text-[11px]">Seller: {p.sellerName}</span>
                              </td>
                              <td className="p-3 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                              <td className="p-3 font-semibold text-emerald-700">+{formatCurrency(p.platformFee)}</td>
                              <td className="p-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                    p.paymentStatus === 'held_in_escrow'
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : p.paymentStatus === 'completed'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}
                                >
                                  {p.paymentStatus.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                    p.settlementStatus === 'released'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : p.settlementStatus === 'frozen_in_dispute'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {p.settlementStatus.replace(/_/g, ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <tr>
                            <th className="p-3">Settlement Ref</th>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Seller & Bank Route</th>
                            <th className="p-3">Net Disbursed</th>
                            <th className="p-3">Release Trigger</th>
                            <th className="p-3">Scheduled / Released Date</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {settlements.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-3 font-mono font-bold text-slate-900">{s.settlementReference}</td>
                              <td className="p-3 font-mono text-slate-600">{s.orderId}</td>
                              <td className="p-3">
                                <span className="font-semibold text-slate-900 block">{s.sellerName}</span>
                                <span className="text-[11px] text-slate-500">{s.sellerBank}</span>
                              </td>
                              <td className="p-3 font-bold text-emerald-700">{formatCurrency(s.netPayout)}</td>
                              <td className="p-3">
                                <span className="text-[11px] text-slate-700 block font-medium">
                                  {s.settlementTrigger === 'buyer_satisfaction'
                                    ? 'Buyer Satisfaction Confirmed'
                                    : '48h Inspection Timer Expiration'}
                                </span>
                              </td>
                              <td className="p-3 text-[11px] text-slate-600">{s.scheduledDate}</td>
                              <td className="p-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                    s.status === 'released'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : s.status === 'frozen_by_dispute'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : 'bg-blue-50 text-blue-800 border-blue-200'
                                  }`}
                                >
                                  {s.status.replace(/_/g, ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: DISPUTES & ARBITRATION */}
              {activeTab === 'disputes' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Neutral Dispute Arbitration Desk</h2>
                      <p className="text-xs text-slate-500">
                        Binding adjudication with side-by-side evidence inspection, chat timeline audit, and neutral rationale logging.
                      </p>
                    </div>
                  </div>

                  {disputes.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                      No active disputes. The arbitration docket is clear.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Cases Queue */}
                      <div className="lg:col-span-4 space-y-2">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                          Active Arbitration Cases ({disputes.length})
                        </span>
                        {disputes.map((caseItem) => (
                          <div
                            key={caseItem.id}
                            onClick={() => setSelectedDispute(caseItem)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              selectedDispute?.id === caseItem.id
                                ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-mono text-slate-400 block">{caseItem.id}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                  caseItem.currentStatus === 'under_admin_review'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : caseItem.currentStatus === 'resolved'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {caseItem.currentStatus.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">{caseItem.productTitle}</h4>
                            <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500">
                              <span>Hold: {formatCurrency(caseItem.agreedPrice)}</span>
                              <span>{caseItem.dateRaised}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right: Selected Case 7-Point Dossier */}
                      {selectedDispute && (
                        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
                          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-500">{selectedDispute.id}</span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="font-mono text-xs text-slate-500">Order: {selectedDispute.orderId}</span>
                              </div>
                              <h3 className="font-bold text-base text-slate-900 mt-0.5">{selectedDispute.productTitle}</h3>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-slate-400 block">Frozen In Escrow</span>
                              <span className="text-lg font-extrabold text-rose-700">{formatCurrency(selectedDispute.agreedPrice)}</span>
                            </div>
                          </div>

                          {/* 2-Sided Evidence Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Buyer Column */}
                            <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
                              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" /> Buyer Complaint & Photos
                              </span>
                              <p className="text-xs text-slate-700 font-semibold">{selectedDispute.reason}</p>
                              <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-rose-100">
                                "{selectedDispute.detailedExplanation}"
                              </p>
                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                {selectedDispute.buyerEvidence
                                  .filter((e) => e.type === 'photo')
                                  .map((photo, i) => (
                                    <img
                                      key={i}
                                      src={photo.url}
                                      alt={photo.name || 'Buyer evidence'}
                                      className="w-full h-20 object-cover rounded border border-rose-200"
                                    />
                                  ))}
                              </div>
                            </div>

                            {/* Seller Column */}
                            <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" /> Seller Pre-Shipment Manifest
                              </span>
                              <p className="text-xs text-slate-700 font-semibold">Manifest & Serial Verified</p>
                              <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-blue-100">
                                "{selectedDispute.sellerResponse?.statement || 'Awaiting formal counter-statement...'}"
                              </p>
                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                {selectedDispute.sellerResponse?.evidence
                                  ?.filter((e) => e.type === 'photo')
                                  .map((photo, i) => (
                                    <img
                                      key={i}
                                      src={photo.url}
                                      alt={photo.name || 'Seller counter-evidence'}
                                      className="w-full h-20 object-cover rounded border border-blue-200"
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>

                          {/* Existing Ruling or Decision Action Strip */}
                          {selectedDispute.adminDecision ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                              <div className="flex items-center gap-2 font-bold text-emerald-900">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                Binding Arbitration Decision Executed: {selectedDispute.adminDecision.decision.replace(/_/g, ' ').toUpperCase()}
                              </div>
                              <p className="text-[11px] text-emerald-800">
                                Rationale: "{selectedDispute.adminDecision.reasoning}"
                              </p>
                              <span className="text-[10px] text-emerald-600 font-mono block">
                                Arbitrated by {selectedDispute.adminDecision.arbitratorName} at {selectedDispute.adminDecision.decidedAt}
                              </span>
                            </div>
                          ) : (
                            <div className="pt-3 border-t border-slate-200 space-y-2">
                              <span className="text-xs font-bold text-slate-700 block">Neutral Ruling Actions:</span>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDecisionModal('approve_full_refund')}
                                  className="text-xs border-slate-300 text-rose-700 hover:bg-rose-50"
                                >
                                  Approve Full Refund
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDecisionModal('approve_partial_refund')}
                                  className="text-xs border-slate-300 text-amber-700 hover:bg-amber-50"
                                >
                                  Approve Partial Refund
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDecisionModal('authorize_return_and_refund')}
                                  className="text-xs border-slate-300 text-blue-700 hover:bg-blue-50"
                                >
                                  Authorize Return & Refund
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleOpenDecisionModal('approve_seller_settlement')}
                                  className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                                >
                                  Approve Seller Settlement
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: REFUNDS */}
              {activeTab === 'refunds' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Refunds Audit Ledger</h2>
                      <p className="text-xs text-slate-500">
                        Inspect all payment returns approved through dispute arbitration or authorized returns.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="py-3 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block font-mono">REF-DEMO-2026-9481</span>
                          <span className="text-slate-500 text-[11px]">Fujifilm X-T5 Mirrorless Camera • Order ord-103</span>
                          <p className="text-[11px] text-slate-600 mt-0.5">Reason: Lens mount thread damaged in transit</p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-rose-700 text-sm block">{formatCurrency(16500)}</span>
                          <span className="text-[10px] text-emerald-700 font-semibold uppercase">Credited via UPI (Instant Reversal)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Verified Reviews Moderation</h2>
                      <p className="text-xs text-slate-500">
                        Inspect customer reviews submitted exclusively by verified buyers of completed transactions.
                      </p>
                    </div>
                    <Link to="/reviews">
                      <Button variant="outline" size="sm" className="text-xs" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Public Reviews Page
                      </Button>
                    </Link>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-amber-500">
                            {'★'.repeat(5)}
                          </div>
                          <span className="font-semibold text-slate-900 text-xs">Vikramaditya Singh</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                            Verified Purchase
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          "Accurate description, serial checked out with Apple India warranty portal, packaging was extremely secure with tamper seals."
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">Seller: Rohan Mehta • Order ord-101</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">2 days ago</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: REPORTS */}
              {activeTab === 'reports' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">User Reports & Safety Flags</h2>
                      <p className="text-xs text-slate-500">
                        Triage reports filed regarding suspected scams, off-platform solicitation, or copyright violations.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-3">Report ID</th>
                          <th className="p-3">Reporter</th>
                          <th className="p-3">Target & Type</th>
                          <th className="p-3">Reason & Details</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-900">{r.id}</td>
                            <td className="p-3">
                              <span className="font-semibold text-slate-900 block">{r.reporterName}</span>
                              <span className="text-[10px] text-slate-400 capitalize">{r.reporterRole}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-slate-900 block line-clamp-1">{r.reportedItemTitle}</span>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">{r.reportedItemType}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-rose-700 block">{r.reason}</span>
                              <p className="text-slate-600 text-[11px] line-clamp-2">{r.details}</p>
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                  r.status === 'open'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                {r.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {r.status === 'open' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResolveReport(r.id)}
                                  className="text-[11px] py-1 px-2.5 h-auto text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                >
                                  Resolve Flag
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Category Manifest & Evidence Rules</h2>
                      <p className="text-xs text-slate-500">
                        Configure required evidence prompts per category (serial verification, battery health screens, and driver clips).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((c) => (
                      <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                          <button
                            onClick={() => handleToggleCategoryLock(c.id)}
                            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                              c.isLocked
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {c.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Active Listings: <strong className="text-slate-800">{c.activeListingsCount}</strong>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                            Mandatory Verification Criteria:
                          </span>
                          <ul className="text-xs space-y-1 text-slate-700">
                            {c.minEvidenceRequirements.map((req, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: PLATFORM FEES & POLICIES */}
              {activeTab === 'fees' && editedFeeConfig && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Platform Fees & Escrow Policies</h2>
                      <p className="text-xs text-slate-500">
                        Configure protection fees, inspection windows, and return authorization limits.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveFeeConfig} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Buyer Protection Fee (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editedFeeConfig.buyerProtectionFeePercent}
                          onChange={(e) =>
                            setEditedFeeConfig({
                              ...editedFeeConfig,
                              buyerProtectionFeePercent: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-600"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Standard marketplace rate is 1.5%</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Seller Commission (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editedFeeConfig.sellerCommissionPercent}
                          onChange={(e) =>
                            setEditedFeeConfig({
                              ...editedFeeConfig,
                              sellerCommissionPercent: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-600"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">0% fee to encourage authentic peer selling</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Buyer Hands-On Inspection Window (Hours)
                        </label>
                        <input
                          type="number"
                          value={editedFeeConfig.inspectionWindowHours}
                          onChange={(e) =>
                            setEditedFeeConfig({
                              ...editedFeeConfig,
                              inspectionWindowHours: parseInt(e.target.value) || 48,
                            })
                          }
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-600"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Standard protocol is 48 hours</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Dispute Return Window (Hours)
                        </label>
                        <input
                          type="number"
                          value={editedFeeConfig.returnWindowHours}
                          onChange={(e) =>
                            setEditedFeeConfig({
                              ...editedFeeConfig,
                              returnWindowHours: parseInt(e.target.value) || 72,
                            })
                          }
                          className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <Button type="submit" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs">
                        Save Policy Configuration
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* SECTION: AUDIT LOGS */}
              {activeTab === 'audit' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Platform Governance Audit Ledger</h2>
                      <p className="text-xs text-slate-500">
                        Immutable administrative activity log tracking account restrictions, moderation rulings, and payout triggers.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-3">Log ID & Timestamp</th>
                          <th className="p-3">Admin Operator</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Action & Target</th>
                          <th className="p-3">Audit Details</th>
                          <th className="p-3">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{log.id}</span>
                              <span className="text-[10px] text-slate-400 font-sans">{log.timestamp}</span>
                            </td>
                            <td className="p-3 font-sans">
                              <span className="font-semibold text-slate-900 block">{log.adminName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{log.adminEmail}</span>
                            </td>
                            <td className="p-3 font-sans">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                                {log.category.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-3 font-sans">
                              <span className="font-bold text-slate-900 block">{log.action}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {log.targetType}:{log.targetId}
                              </span>
                            </td>
                            <td className="p-3 font-sans text-slate-600 max-w-xs">{log.details}</td>
                            <td className="p-3 text-slate-400">{log.ipAddress}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: SYSTEM SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">System Configuration</h2>
                      <p className="text-xs text-slate-500">
                        Operational sandbox flags, mock delay latency, and escrow integration parameters.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <strong className="text-slate-900 block font-semibold">Environment Mode</strong>
                        <span className="text-slate-500 text-[11px]">Frontend Interactive Prototype Sandbox</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold uppercase text-[10px]">
                        Demo Sandbox
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <strong className="text-slate-900 block font-semibold">Simulated Gateway Delay</strong>
                        <span className="text-slate-500 text-[11px]">Artificial network latency for realistic feel</span>
                      </div>
                      <span className="font-mono text-slate-700 font-semibold">200 ms</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <strong className="text-slate-900 block font-semibold">Payment Escrow Provider</strong>
                        <span className="text-slate-500 text-[11px]">Target production payment gateway</span>
                      </div>
                      <span className="font-semibold text-slate-800">Razorpay / Cashfree-Compatible Escrow Sandbox</span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <strong className="text-slate-900 block font-semibold">Courier Tracking API Webhook</strong>
                        <span className="text-slate-500 text-[11px]">Logistics updates receiver</span>
                      </div>
                      <span className="font-semibold text-emerald-700">Simulated Shiprocket-Compatible Webhook (Active)</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODAL: USER ACCOUNT RESTRICTION */}
      {isUserActionModalOpen && selectedUser && (
        <Modal
          isOpen={isUserActionModalOpen}
          onClose={() => setIsUserActionModalOpen(false)}
          title={`Manage Account: ${selectedUser.name}`}
        >
          <form onSubmit={handleExecuteUserAction} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Target Account Status</label>
              <select
                value={userActionType}
                onChange={(e) => setUserActionType(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
              >
                <option value="active">Active (Normal Access)</option>
                <option value="restricted">Restricted (Cannot create new listings or offers)</option>
                <option value="suspend">Suspended (Immediate access block)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Audit Rationale (Mandatory)</label>
              <textarea
                rows={3}
                required
                value={userActionReason}
                onChange={(e) => setUserActionReason(e.target.value)}
                placeholder="State the administrative reason for this restriction..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsUserActionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-slate-900 hover:bg-slate-950 text-white font-semibold">
                Apply Account Action
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: LISTING MODERATION */}
      {isListingActionModalOpen && selectedListing && (
        <Modal
          isOpen={isListingActionModalOpen}
          onClose={() => setIsListingActionModalOpen(false)}
          title={`Moderate Listing: ${selectedListing.title}`}
        >
          <form onSubmit={handleExecuteListingModeration} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <img
                  src={selectedListing.photos[0]}
                  alt="Listing preview"
                  className="w-full h-36 object-cover rounded-lg border border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Serial: {selectedListing.serialNumber}</span>
                  <span className="font-bold text-sm text-slate-900 block">{formatCurrency(selectedListing.askingPrice)}</span>
                  <span className="text-slate-600 text-xs">Seller: {selectedListing.sellerName}</span>
                </div>
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {selectedListing.description}
                </p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Moderation Verdict</label>
              <select
                value={listingActionType}
                onChange={(e) => setListingActionType(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 bg-white"
              >
                <option value="approved">Approve Listing (Visible to public)</option>
                <option value="flagged">Flag for Further Verification</option>
                <option value="rejected">Reject & Remove Listing</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Moderation Notes</label>
              <textarea
                rows={2}
                required
                value={listingActionNotes}
                onChange={(e) => setListingActionNotes(e.target.value)}
                placeholder="Document verification check or reason for removal..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsListingActionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Submit Moderation Verdict
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: ADMIN DISPUTE ARBITRATION DECISION */}
      {isDecisionModalOpen && selectedDispute && (
        <Modal
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          title={`Arbitration Ruling: ${decisionType.replace(/_/g, ' ').toUpperCase()}`}
        >
          <form onSubmit={handleExecuteDecision} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-800 block">Case Information</span>
              <p className="text-slate-600">Dispute ID: {selectedDispute.id} • Order: {selectedDispute.orderId}</p>
              <p className="text-slate-600">Escrow Value: {formatCurrency(selectedDispute.agreedPrice)}</p>
            </div>

            {decisionType === 'approve_partial_refund' && (
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Partial Refund Sum: {formatCurrency(partialRefundAmount)} (
                  {Math.round((partialRefundAmount / selectedDispute.agreedPrice) * 100)}%)
                </label>
                <input
                  type="range"
                  min={500}
                  max={selectedDispute.agreedPrice}
                  step={250}
                  value={partialRefundAmount}
                  onChange={(e) => setPartialRefundAmount(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Remaining {formatCurrency(selectedDispute.agreedPrice - partialRefundAmount)} will disburse to seller.
                </span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Objective Reason for Ruling (Mandatory Audit Requirement)
              </label>
              <textarea
                rows={4}
                required
                value={reasoningText}
                onChange={(e) => setReasoningText(e.target.value)}
                placeholder="Detail the physical evidence comparison between seller manifest and buyer proof that led to this decision..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              <strong>Neutrality Covenant:</strong> This ruling is binding, triggers automated escrow adjustment via payment provider, and is permanently recorded in the immutable platform audit ledger.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsDecisionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmittingDecision}
                className="bg-blue-900 hover:bg-blue-950 text-white font-semibold"
              >
                {isSubmittingDecision ? 'Executing Ruling...' : 'Execute Binding Ruling'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
