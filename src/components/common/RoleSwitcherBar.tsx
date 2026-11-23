/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserCheck, Store, ShieldAlert, User, ArrowUpRight } from 'lucide-react';
import { UserRole } from '../../types/index.ts';

export const RoleSwitcherBar: React.FC = () => {
  const { user, role, switchRole } = useAuth();

  const roleConfigs: { id: UserRole; label: string; icon: React.ReactNode; desc: string; persona: string }[] = [
    { id: 'buyer', label: 'Buyer', icon: <UserCheck className="w-3.5 h-3.5" />, desc: 'Ananya Sharma (Jaipur · Buyer Console, Inspection & Offers)', persona: 'Ananya Sharma' },
    { id: 'seller', label: 'Seller', icon: <Store className="w-3.5 h-3.5" />, desc: 'Rohan Mehta (Bengaluru · Seller Portal, Listings & Payouts)', persona: 'Rohan Mehta' },
    { id: 'admin', label: 'Admin', icon: <ShieldAlert className="w-3.5 h-3.5" />, desc: 'Priya Nair (Dispute Desk & Platform Moderation)', persona: 'Priya Nair' },
    { id: 'guest', label: 'Visitor', icon: <User className="w-3.5 h-3.5" />, desc: 'Public Marketplace Catalog', persona: 'Public Visitor' },
  ];

  const getDashboardPath = () => {
    switch (role) {
      case 'seller':
        return '/seller/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'buyer':
        return '/buyer/dashboard';
      default:
        return '/explore';
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-1.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        {/* Left: Persona Status */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] sm:text-xs">
          <span className="text-slate-400 font-medium">Interactive Demo:</span>
          <span className="font-semibold text-white">
            {role === 'guest' ? 'Public Visitor' : user?.name || role.toUpperCase()}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 capitalize font-medium">{role} Persona</span>

          {role !== 'guest' && (
            <Link
              to={getDashboardPath()}
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors group"
            >
              <span>Open Dashboard</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {/* Right: Clean Segmented Role Switcher */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-0.5 sm:pb-0">
          <span className="text-slate-400 text-[11px] hidden md:inline shrink-0">Switch Role:</span>
          <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800 shrink-0">
            {roleConfigs.map((cfg) => {
              const isActive = role === cfg.id;
              return (
                <button
                  key={cfg.id}
                  onClick={() => switchRole(cfg.id)}
                  title={cfg.desc}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {cfg.icon}
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
