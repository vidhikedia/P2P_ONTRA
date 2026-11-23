/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Button } from '../components/ui/Button.tsx';
import { ShieldAlert, ArrowLeft, UserCheck, Store } from 'lucide-react';
import { UserRole } from '../types/index.ts';

export const UnauthorizedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requiredRole = searchParams.get('required') || 'seller';
  const currentRole = searchParams.get('current') || 'buyer';
  const { switchRole } = useAuth();

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block mb-1">
            Access Restricted
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Role Permission Required
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            This protected section requires <strong className="text-slate-800 uppercase">{requiredRole}</strong> privileges. You are currently browsing as <strong className="text-slate-800 uppercase">{currentRole}</strong>.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2 text-left">
          <p className="font-semibold text-slate-900">Switch Role to Preview:</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-center"
              onClick={() => switchRole(requiredRole as UserRole)}
            >
              Switch to {requiredRole.toUpperCase()}
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md" className="w-full justify-center bg-slate-900" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to Marketplace Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
