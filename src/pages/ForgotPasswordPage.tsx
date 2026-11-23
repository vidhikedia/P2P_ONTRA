/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/Input.tsx';
import { Button } from '../components/ui/Button.tsx';
import { authService } from '../services/authService.ts';
import { useToast } from '../hooks/useToast.ts';
import { ShieldCheck, ArrowLeft, Mail } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    try {
      await authService.requestPasswordReset(identifier);
      setIsSubmitted(true);
      showToast(
        'Reset Instructions Dispatched',
        `A secure one-time password reset link was sent to ${identifier}.`,
        'success'
      );
    } catch {
      showToast('Error', 'Could not process reset request.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        {!isSubmitted ? (
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
              Enter the verified email address or mobile phone associated with your ONTRA account. We will send you a one-time cryptographic reset token.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email or Mobile Number"
                placeholder="e.g. ananya@ontra.in or +91 98290 45120"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center bg-blue-900 hover:bg-blue-950 font-semibold"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Check Your Inbox / SMS</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              We have dispatched a secure password reset link to <strong className="text-slate-900">{identifier}</strong>. Click the link to define a new password.
            </p>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
