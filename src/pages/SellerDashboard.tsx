/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../hooks/useToast.ts';
import { productService } from '../services/productService.ts';
import { 
  Product, 
  SellerDashboardTab, 
  SellerOffer, 
  SellerActivity, 
  SellerOrder 
} from '../types/index.ts';
import { 
  MOCK_SELLER_OFFERS, 
  MOCK_SELLER_ACTIVITIES, 
  MOCK_SELLER_ORDERS 
} from '../data/mockData.ts';
import { SellerSidebar } from '../components/seller/SellerSidebar.tsx';
import { SellerOverviewTab } from '../components/seller/SellerOverviewTab.tsx';
import { SellerMyListingsTab } from '../components/seller/SellerMyListingsTab.tsx';
import { AddProductListingWizard } from '../components/seller/AddProductListingWizard.tsx';
import { SellerOffersTab } from '../components/seller/SellerOffersTab.tsx';
import { SellerOrdersTab } from '../components/seller/SellerOrdersTab.tsx';
import { SellerDeliveryTab } from '../components/seller/SellerDeliveryTab.tsx';
import { SellerPayoutsTab } from '../components/seller/SellerPayoutsTab.tsx';
import { SellerMessagesTab } from '../components/seller/SellerMessagesTab.tsx';
import { SellerReviewsTab } from '../components/seller/SellerReviewsTab.tsx';
import { SellerNotificationsTab } from '../components/seller/SellerNotificationsTab.tsx';
import { SellerDisputesTab } from '../components/seller/SellerDisputesTab.tsx';
import { SellerSettingsTab } from '../components/seller/SellerSettingsTab.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { Button } from '../components/ui/Button.tsx';
import { 
  Menu, 
  ShieldCheck, 
  Star, 
  QrCode, 
  Plus,
  Store
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as SellerDashboardTab) || 'overview';
  const [currentTab, setCurrentTab] = useState<SellerDashboardTab>(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as SellerDashboardTab | null;
    if (tabParam && tabParam !== currentTab) {
      setCurrentTab(tabParam);
      if (tabParam === 'add_product') {
        setEditingProduct(null);
      }
    }
  }, [searchParams]);

  const handleSelectTab = (tab: SellerDashboardTab) => {
    setCurrentTab(tab);
    setSearchParams({ tab });
  };

  // Core state for Seller's listings, offers, orders, and activities
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<SellerOffer[]>(MOCK_SELLER_OFFERS);
  const [orders, setOrders] = useState<SellerOrder[]>(MOCK_SELLER_ORDERS);
  const [activities, setActivities] = useState<SellerActivity[]>(MOCK_SELLER_ACTIVITIES);

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // OTP Verification Modal
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  // Load seller listings from service
  const loadListings = async () => {
    const res = await productService.getProducts();
    // In demo mode, show all Rohan Mehta listings
    const sellerListings = res.data.filter(
      (p) => p.sellerId === 'usr_seller_01' || p.sellerName === 'Rohan Mehta'
    );
    setProducts(sellerListings.length > 0 ? sellerListings : res.data);
  };

  useEffect(() => {
    loadListings();
  }, []);

  // Handle OTP verification
  const handleVerifyOtp = (enteredOtp: string) => {
    if (enteredOtp.length !== 6) {
      showToast('Error', 'OTP code must be exactly 6 digits.', 'error');
      return;
    }

    showToast(
      'Physical Handover Authenticated',
      'OTP matched buyer credentials. Package handover confirmed. Buyer 48h physical inspection countdown has officially begun.',
      'success'
    );
    setIsOtpModalOpen(false);
    setOtpInput('');

    // Update order status to under inspection
    setOrders((prev) =>
      prev.map((o) =>
        o.id === 'ord_102'
          ? { ...o, orderStatus: 'under_inspection', inspectionDeadline: '2026-11-06T15:00:00Z' }
          : o
      )
    );

    // Add activity
    const newAct: SellerActivity = {
      id: `act_${Date.now()}`,
      type: 'inspection_started',
      title: 'Handover Completed via OTP',
      description: 'Physical exchange confirmed with Ananya Sharma in Jaipur, Rajasthan. 48h clock active.',
      timestamp: 'Just now',
      statusTag: 'Handover Verified'
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Handle listing created / draft saved from wizard
  const handleListingWizardSuccess = (newProduct: Product, isDraft: boolean) => {
    if (editingProduct) {
      // Update existing
      productService.updateListing(editingProduct.id, newProduct).then(() => {
        showToast(
          'Listing Updated',
          `${newProduct.title} changes saved successfully.`,
          'success'
        );
        loadListings();
        setEditingProduct(null);
        handleSelectTab('listings');
      });
    } else {
      // Create new
      productService.createListing(newProduct, isDraft ? 'draft' : 'active').then(() => {
        showToast(
          isDraft ? 'Draft Saved' : 'Listing Published & Live',
          isDraft
            ? `${newProduct.title} saved to drafts.`
            : `${newProduct.title} is now active in ONTRA catalog with verified serial protection.`,
          'success'
        );
        loadListings();
        handleSelectTab('listings');
      });
    }
  };

  // Handle status update (pause, resume, publish draft)
  const handleUpdateStatus = async (id: string, newStatus: Product['status']) => {
    try {
      await productService.updateListingStatus(id, newStatus);
      showToast(
        'Listing Status Updated',
        `Status changed to ${newStatus}.`,
        'success'
      );
      loadListings();
    } catch (err: any) {
      showToast('Action Failed', err.message || 'Could not update status', 'error');
    }
  };

  // Handle listing deletion
  const handleDeleteListing = async (id: string) => {
    try {
      await productService.deleteListing(id);
      showToast('Listing Removed', 'The item was deleted from your inventory.', 'info');
      loadListings();
    } catch (err: any) {
      showToast('Delete Prohibited', err.message || 'Cannot delete item under active order', 'error');
    }
  };

  // Handle Offer Actions
  const handleAcceptOffer = (offerId: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'accepted' } : o))
    );
    showToast(
      'Binding Offer Accepted',
      'The buyer has been notified to fund their escrow deposit within 24 hours.',
      'success'
    );
  };

  const handleDeclineOffer = (offerId: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'declined' } : o))
    );
    showToast('Offer Declined', 'Offer declined and buyer notified.', 'info');
  };

  const handleCounterOffer = (offerId: string, counterAmount: number) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? { ...o, status: 'countered', counterAmount }
          : o
      )
    );
  };

  // Dynamic counts for sidebar
  const counts = {
    activeListings: products.filter((p) => p.status === 'active').length,
    pendingOffers: offers.filter((o) => o.status === 'pending').length,
    activeOrders: orders.filter((o) => o.orderStatus !== 'completed').length,
    unreadNotifications: 2,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Seller Header & Status Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
            {user?.name?.charAt(0) || 'R'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-slate-700" />
                Seller Portal
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Tech & Horology Seller
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {user?.name || 'Rohan Mehta'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>{user?.city || 'Bengaluru, Karnataka'}</span>
              <span>·</span>
              <span className="flex items-center gap-1 font-semibold text-slate-900">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.95 ★
              </span>
              <span>·</span>
              <span>42 completed sales</span>
              <span>·</span>
              <span className="font-bold text-blue-900">99% Trust Score</span>
            </div>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* Mobile navigation toggle */}
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
            onClick={() => setIsOtpModalOpen(true)}
            leftIcon={<QrCode className="w-4 h-4 text-slate-700" />}
            className="text-xs font-semibold"
          >
            Verify Handover OTP
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingProduct(null);
              handleSelectTab('add_product');
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-slate-900 hover:bg-slate-800 text-xs font-semibold shadow-xs"
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* 2. Main Layout Split (Sidebar + Content View) */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Sidebar Navigation */}
        <SellerSidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'add_product') {
              setEditingProduct(null);
            }
            handleSelectTab(tab);
          }}
          counts={counts}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Content Pane */}
        <div className="flex-1 w-full min-w-0">
          {currentTab === 'overview' && (
            <SellerOverviewTab
              products={products}
              offers={offers}
              orders={orders}
              activities={activities}
              onNavigateTab={(tab) => handleSelectTab(tab)}
              onOpenOtpModal={() => setIsOtpModalOpen(true)}
            />
          )}

          {currentTab === 'listings' && (
            <SellerMyListingsTab
              products={products}
              onAddNew={() => {
                setEditingProduct(null);
                handleSelectTab('add_product');
              }}
              onUpdateStatus={handleUpdateStatus}
              onDeleteListing={handleDeleteListing}
              onEditListing={(item) => {
                setEditingProduct(item);
                handleSelectTab('add_product');
              }}
            />
          )}

          {currentTab === 'add_product' && (
            <AddProductListingWizard
              initialData={editingProduct || undefined}
              onSuccess={handleListingWizardSuccess}
              onCancel={() => {
                setEditingProduct(null);
                handleSelectTab('listings');
              }}
            />
          )}

          {currentTab === 'offers' && (
            <SellerOffersTab
              offers={offers}
              onAcceptOffer={handleAcceptOffer}
              onDeclineOffer={handleDeclineOffer}
              onCounterOffer={handleCounterOffer}
            />
          )}

          {currentTab === 'orders' && (
            <SellerOrdersTab
              orders={orders}
              onOpenOtpModal={() => setIsOtpModalOpen(true)}
            />
          )}

          {currentTab === 'delivery' && (
            <SellerDeliveryTab
              onVerifyOtp={handleVerifyOtp}
            />
          )}

          {currentTab === 'disputes' && (
            <SellerDisputesTab />
          )}

          {currentTab === 'payouts' && (
            <SellerPayoutsTab />
          )}

          {currentTab === 'history' && (
            <SellerPayoutsTab />
          )}

          {currentTab === 'messages' && (
            <SellerMessagesTab />
          )}

          {currentTab === 'reviews' && (
            <SellerReviewsTab />
          )}

          {currentTab === 'notifications' && (
            <SellerNotificationsTab />
          )}

          {currentTab === 'settings' && (
            <SellerSettingsTab />
          )}
        </div>
      </div>

      {/* Global Handover OTP Modal */}
      {isOtpModalOpen && (
        <Modal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          title="Authenticate Direct Handover with OTP"
          subtitle="Ask buyer Ananya Sharma for her 6-digit one-time passcode to confirm physical handover."
          maxWidth="sm"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyOtp(otpInput);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 text-center">
                Buyer's 6-Digit Passcode
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="839201"
                className="w-full text-center font-mono text-2xl tracking-[0.4em] py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
              <span className="font-semibold text-slate-900">Demo Code:</span> In demo mode, enter any 6 digits (e.g. <code>839201</code>) to confirm exchange.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsOtpModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-slate-900 hover:bg-slate-800 font-semibold text-xs">
                Confirm Handover & Start 48h Inspection
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
