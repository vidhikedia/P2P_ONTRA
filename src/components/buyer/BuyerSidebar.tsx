/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BuyerDashboardTab } from '../../types/index.ts';
import { 
  LayoutDashboard, 
  Compass, 
  ShoppingBag, 
  Tag, 
  MessageSquare, 
  Heart, 
  CreditCard, 
  Truck, 
  Clock, 
  ShieldAlert, 
  History, 
  Star, 
  Bell, 
  Settings,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BuyerSidebarProps {
  currentTab: BuyerDashboardTab;
  onSelectTab: (tab: BuyerDashboardTab) => void;
  counts: {
    activeOrders: number;
    pendingInspections: number;
    unreadMessages: number;
    wishlistCount: number;
    notificationsCount: number;
  };
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const BuyerSidebar: React.FC<BuyerSidebarProps> = ({
  currentTab,
  onSelectTab,
  counts,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navigate = useNavigate();

  interface NavItem {
    id: BuyerDashboardTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    isExternalLink?: boolean;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const sections: NavSection[] = [
    {
      title: 'Activity',
      items: [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'orders', label: 'My Orders', icon: <ShoppingBag className="w-4 h-4" />, badge: counts.activeOrders },
        { id: 'offers', label: 'My Offers', icon: <Tag className="w-4 h-4" /> },
        { id: 'inspection', label: 'Product Inspection', icon: <Clock className="w-4 h-4 text-emerald-600" />, badge: counts.pendingInspections },
        { id: 'explore', label: 'Explore Catalog', icon: <Compass className="w-4 h-4 text-slate-500" />, isExternalLink: true },
      ],
    },
    {
      title: 'Fulfillment & Escrow',
      items: [
        { id: 'delivery', label: 'Delivery Tracking', icon: <Truck className="w-4 h-4" /> },
        { id: 'payments', label: 'Payments & Escrow', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'disputes', label: 'Disputes & Refunds', icon: <ShieldAlert className="w-4 h-4" /> },
        { id: 'history', label: 'Transaction History', icon: <History className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Communication & Wishlist',
      items: [
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" />, badge: counts.unreadMessages },
        { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" />, badge: counts.wishlistCount },
        { id: 'reviews', label: 'My Reviews', icon: <Star className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: counts.notificationsCount },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { id: 'settings', label: 'Profile & Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const handleItemClick = (item: NavItem) => {
    if (item.isExternalLink && item.id === 'explore') {
      navigate('/explore');
      if (onCloseMobile) onCloseMobile();
      return;
    }
    onSelectTab(item.id);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 py-5 px-3">
      {/* Mobile Drawer Close */}
      {onCloseMobile && (
        <div className="flex items-center justify-between px-3 pb-4 mb-2 border-b border-slate-100 lg:hidden">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Buyer Console</span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Nav List with Semantic Categorization */}
      <nav className="space-y-4 flex-1 overflow-y-auto pr-1">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = currentTab === item.id;
                const isInspection = item.id === 'inspection';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : isInspection && counts.pendingInspections > 0
                        ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
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
                            : item.id === 'inspection'
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : item.id === 'messages'
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

      {/* Trust Assurance Footer */}
      <div className="pt-4 mt-auto border-t border-slate-100 px-3 text-xs text-slate-500">
        <p className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          Buyer Protection Active
        </p>
        <p className="text-[11px] leading-tight text-slate-400">
          Payment remains locked in escrow until you approve the 48-hour inspection.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0">
        <div className="sticky top-20 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
          {content}
        </div>
      </aside>

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
