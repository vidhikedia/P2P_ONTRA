/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../hooks/useToast.ts';
import { ShieldCheck, UserCheck, Store, ShieldAlert } from 'lucide-react';
import { UserRole } from '../../types/index.ts';

import { validateLoginForm, validateRegistrationForm } from '../../utils/validators.ts';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, loginAsDemoUser } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'login' | 'signup'>(authModalTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [roleSelection, setRoleSelection] = useState<UserRole>('buyer');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync tab with context when modal opens
  React.useEffect(() => {
    setTab(authModalTab);
    setFormError(null);
  }, [authModalTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (tab === 'login') {
      const val = validateLoginForm({ identifier: email, password });
      if (!val.isValid) {
        setFormError(Object.values(val.errors)[0]);
        return;
      }
    } else {
      const val = validateRegistrationForm({
        fullName,
        email,
        mobile: '+91 98290 00000',
        city: 'Jaipur',
        password,
        confirmPassword: password,
      });
      if (!val.isValid) {
        setFormError(Object.values(val.errors)[0]);
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      loginAsDemoUser(roleSelection === 'admin' ? 'admin' : roleSelection === 'seller' ? 'seller' : 'buyer');
      showToast(
        tab === 'login' ? 'Signed in successfully' : 'Account created and verified',
        `Active session initialized as ${roleSelection.toUpperCase()}.`,
        'success'
      );
    }, 400);
  };

  const handleQuickDemoLogin = (role: 'buyer' | 'seller' | 'admin') => {
    loginAsDemoUser(role);
    showToast(
      `Switched to demo ${role.toUpperCase()}`,
      `Loaded demo profile with simulated trust score & permissions.`,
      'info'
    );
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={tab === 'login' ? 'Sign In to ONTRA' : 'Create Your Verified Account'}
      subtitle="Access escrow-backed peer-to-peer trading in INR with verified evidence manifests."
      maxWidth="md"
    >
      {/* 1-Click Demo Profiles for testing */}
      <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200/90 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-800">1-Click Demo Role Accounts:</span>
          <span className="text-[11px] text-slate-500">For review & testing</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('buyer')}
            className="flex flex-col items-center p-2 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors text-left cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-slate-700 mb-1" />
            <span className="text-xs font-semibold">Buyer</span>
            <span className="text-[10px] text-slate-500">Ananya (98 Trust)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('seller')}
            className="flex flex-col items-center p-2 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors text-left cursor-pointer"
          >
            <Store className="w-4 h-4 text-slate-700 mb-1" />
            <span className="text-xs font-semibold">Seller</span>
            <span className="text-[10px] text-slate-500">Rohan (99 Trust)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin')}
            className="flex flex-col items-center p-2 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors text-left cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-slate-700 mb-1" />
            <span className="text-xs font-semibold">Admin</span>
            <span className="text-[10px] text-slate-500">Priya (Arbitrator)</span>
          </button>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex border-b border-slate-200 mb-4">
        <button
          type="button"
          onClick={() => setTab('login')}
          className={`pb-2 px-4 text-xs font-semibold transition-colors border-b-2 cursor-pointer ${
            tab === 'login'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setTab('signup')}
          className={`pb-2 px-4 text-xs font-semibold transition-colors border-b-2 cursor-pointer ${
            tab === 'signup'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {formError}
          </div>
        )}
        {tab === 'signup' && (
          <div>
            <Input
              label="Full Name"
              placeholder="e.g. Ananya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Trading Intent
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRoleSelection('buyer')}
                  className={`p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                    roleSelection === 'buyer'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-semibold">Buyer Account</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Explore, offer & inspect</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleSelection('seller')}
                  className={`p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                    roleSelection === 'seller'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-semibold">Seller Account</p>
                  <p className="text-[10px] opacity-80 mt-0.5">List verified inventory</p>
                </button>
              </div>
            </div>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="name@domain.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            isLoading={isSubmitting}
          >
            {tab === 'login' ? 'Sign In to Vault' : 'Complete Registration'}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-slate-500">
            Protected by 256-bit encryption & ONTRA Neutral Custody.
          </p>
        </div>
      </form>
    </Modal>
  );
};
