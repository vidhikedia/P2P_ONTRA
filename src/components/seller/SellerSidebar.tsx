/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SellerDashboardTab } from '../../types/index.ts';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Tag, 
  MessageSquare, 
  ShoppingBag, 
  Truck, 
  ShieldAlert, 
  Wallet, 
  History, 
  Star, 
  Bell, 
  Settings,
  X
} from 'lucide-react';

interface SellerSidebarProps {
  currentTab: SellerDashboardTab;
  onSelectTab: (tab: SellerDashboardTab) => void;
  counts: {
    activeListings: number;
    pendingOffers: number;
    activeOrders: number;
    unreadNotifications: number;
  };
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SellerSidebar: React.FC<SellerSidebarProps> = ({
  currentTab,
  onSelectTab,
  counts,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  interface NavItem {
    id: SellerDashboardTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    highlight?: boolean;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const sections: NavSection[] = [
    {
      title: 'Inventory & Sales',
      items: [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'listings', label: 'My Listings', icon: <Package className="w-4 h-4" />, badge: counts.activeListings },
        { id: 'add_product', label: 'Add Product Listing', icon: <PlusCircle className="w-4 h-4 text-emerald-600" />, highlight: true },
        { id: 'offers', label: 'Incoming Offers', icon: <Tag className="w-4 h-4" />, badge: counts.pendingOffers },
        { id: 'orders', label: 'Active Orders', icon: <ShoppingBag className="w-4 h-4" />, badge: counts.activeOrders },
      ],
    },
    {
      title: 'Fulfillment & Payouts',
      items: [
        { id: 'delivery', label: 'Delivery & Handover', icon: <Truck className="w-4 h-4" /> },
        { id: 'payouts', label: 'Earnings & Payouts', icon: <Wallet className="w-4 h-4" /> },
        { id: 'disputes', label: 'Disputes & Claims', icon: <ShieldAlert className="w-4 h-4" /> },
        { id: 'history', label: 'Transaction History', icon: <History className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Communications',
      items: [
        { id: 'messages', label: 'Direct Messages', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'reviews', label: 'Customer Reviews', icon: <Star className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: counts.unreadNotifications },
      ],
    },
    {
      title: 'Settings',
      items: [
        { id: 'settings', label: 'Seller Profile & Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const handleItemClick = (id: SellerDashboardTab) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 py-5 px-3">
      {/* Mobile Header Close */}
      {onCloseMobile && (
        <div className="flex items-center justify-between px-3 pb-4 mb-2 border-b border-slate-100 lg:hidden">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Seller Navigation</span>
          <button 
            type="button" 
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation List with Semantic Sections */}
      <nav className="space-y-4 flex-1 overflow-y-auto pr-1">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = currentTab === item.id;
                const isHighlight = item.highlight;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : isHighlight
                        ? 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100/70 font-semibold border border-emerald-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.id === 'offers'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Payout Security Reassurance Footer */}
      <div className="pt-4 mt-auto border-t border-slate-100 px-3 text-xs text-slate-500">
        <p className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          Escrow Custody Active
        </p>
        <p className="text-[11px] leading-tight text-slate-400">
          Payouts release automatically 48h after verified buyer physical inspection.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0">
        <div className="sticky top-20 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
          {content}
        </div>
      </aside>

      {/* Mobile Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile} 
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
