/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../hooks/useToast.ts';
import { authService } from '../services/authService.ts';
import { 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  RotateCcw
} from 'lucide-react';

type ScreenStep = 'email' | 'mobile' | 'success' | 'failure';

export const VerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'email';
  const roleParam = searchParams.get('role') || 'buyer';

  const navigate = useNavigate();
  const { 
    user, 
    pendingOnboardingUser, 
    verifyEmailSuccess, 
    verifyMobileSuccess, 
    switchRole 
  } = useAuth();
  const { showToast } = useToast();

  const activeUser = pendingOnboardingUser || user;

  const [currentStep, setCurrentStep] = useState<ScreenStep>(
    initialType === 'mobile' ? 'mobile' : 'email'
  );
  const [emailCode, setEmailCode] = useState('492815');
  const [mobileOtp, setMobileOtp] = useState('719204');
  const [failureReason, setFailureReason] = useState<string>('');
  const [countdown, setCountdown] = useState(45);
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyEmail = async (simulateFail: boolean = false) => {
    setIsLoading(true);
    try {
      if (simulateFail) {
        throw new Error('Verification code rejected: Code 000000 does not match server signature.');
      }
      await authService.verifyEmail(emailCode);
      verifyEmailSuccess();
      showToast('Email Confirmed', 'Proceeding to mobile OTP verification step.', 'success');
      setCurrentStep('mobile');
      setCountdown(45);
    } catch (err: unknown) {
      setFailureReason(err instanceof Error ? err.message : 'Invalid verification code.');
      setCurrentStep('failure');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMobile = async (simulateFail: boolean = false) => {
    setIsLoading(true);
    try {
      if (simulateFail) {
        throw new Error('Mobile OTP rejected: The 6-digit code has expired or was entered incorrectly.');
      }
      await authService.verifyMobileOTP(mobileOtp);
      verifyMobileSuccess();
      showToast('Mobile OTP Confirmed', 'All security onboarding requirements satisfied.', 'success');
      setCurrentStep('success');
    } catch (err: unknown) {
      setFailureReason(err instanceof Error ? err.message : 'Invalid mobile OTP.');
      setCurrentStep('failure');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    const type = currentStep === 'email' ? 'email' : 'mobile';
    const res = await authService.resendCode(type);
    setCountdown(45);
    if (type === 'email') setEmailCode(res.data.code);
    if (type === 'mobile') setMobileOtp(res.data.code);
    showToast('Code Resent', res.message, 'info');
  };

  const handleEnterDashboard = () => {
    const targetRole = (activeUser?.role || roleParam || 'buyer') as 'buyer' | 'seller' | 'admin';
    switchRole(targetRole);
    if (targetRole === 'seller') {
      navigate('/seller/dashboard');
    } else if (targetRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/buyer/dashboard');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {/* Demo Interaction Identifier Banner */}
      <div className="mb-6 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900 shadow-xs">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-blue-950">
            Interactive Onboarding Simulator (Demo Mode)
          </p>
          <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
            This screen simulates real email and SMS OTP authentication workflows. Use the pre-filled codes or click "Simulate Verification Failure" to inspect both validation states.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Step indicator header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className={`h-1.5 w-12 rounded-full transition-colors ${currentStep === 'email' ? 'bg-slate-900' : 'bg-emerald-500'}`} />
          <span className={`h-1.5 w-12 rounded-full transition-colors ${currentStep === 'mobile' ? 'bg-slate-900' : currentStep === 'success' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          <span className={`h-1.5 w-12 rounded-full transition-colors ${currentStep === 'success' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
        </div>

        {/* SCREEN 1: EMAIL VERIFICATION */}
        {currentStep === 'email' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Verify Your Email Address
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                We sent a 6-digit confirmation code to{' '}
                <strong className="text-slate-800">
                  {activeUser?.email || 'your-email@example.in'}
                </strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit Email Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center font-mono text-2xl tracking-[0.5em] py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                placeholder="492815"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => setEmailCode('492815')}
                className="text-slate-700 hover:text-slate-900 underline font-medium cursor-pointer"
              >
                Auto-fill Demo Code (492815)
              </button>

              <button
                type="button"
                disabled={countdown > 0}
                onClick={handleResend}
                className="text-slate-600 hover:text-slate-900 disabled:opacity-50 cursor-pointer"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center bg-blue-900 hover:bg-blue-950 font-semibold"
                isLoading={isLoading}
                onClick={() => handleVerifyEmail(false)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Confirm Email Code
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs"
                onClick={() => handleVerifyEmail(true)}
              >
                Test Failure State (Simulate Bad Code)
              </Button>
            </div>
          </div>
        )}

        {/* SCREEN 2: MOBILE OTP VERIFICATION */}
        {currentStep === 'mobile' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Verify Mobile Phone (SMS OTP)
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                We sent a cryptographic one-time passcode to{' '}
                <strong className="text-slate-800">
                  {activeUser?.phone || '+91 98290 45120'}
                </strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit SMS OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={mobileOtp}
                onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center font-mono text-2xl tracking-[0.5em] py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                placeholder="719204"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => setMobileOtp('719204')}
                className="text-slate-700 hover:text-slate-900 underline font-medium cursor-pointer"
              >
                Auto-fill Demo OTP (719204)
              </button>

              <button
                type="button"
                disabled={countdown > 0}
                onClick={handleResend}
                className="text-slate-600 hover:text-slate-900 disabled:opacity-50 cursor-pointer"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend SMS'}
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center bg-blue-900 hover:bg-blue-950 font-semibold"
                isLoading={isLoading}
                onClick={() => handleVerifyMobile(false)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Verify Phone & Complete Onboarding
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs"
                onClick={() => handleVerifyMobile(true)}
              >
                Test Failure State (Simulate Bad OTP)
              </Button>
            </div>
          </div>
        )}

        {/* SCREEN 3: VERIFICATION SUCCESS */}
        {currentStep === 'success' && (
          <div className="text-center space-y-6 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                Security Onboarding Complete
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Account Successfully Verified
              </h1>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Both your email address and mobile phone have been cryptographically authenticated. Your baseline trust score is active.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Email Verification:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Mobile SMS OTP:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Assigned Platform Role:</span>
                <span className="text-slate-900 font-bold uppercase">
                  {activeUser?.role || roleParam || 'BUYER'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-semibold text-slate-900">
                <span>ONTRA Escrow Vault Status:</span>
                <span className="text-emerald-700">Escrow Access Enabled</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center bg-blue-900 hover:bg-blue-950 font-semibold"
              onClick={handleEnterDashboard}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Enter Your {(activeUser?.role || roleParam || 'Buyer').toUpperCase()} Dashboard
            </Button>
          </div>
        )}

        {/* SCREEN 4: VERIFICATION FAILURE */}
        {currentStep === 'failure' && (
          <div className="text-center space-y-6 py-2">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block mb-1">
                Verification Authentication Error
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Code Verification Failed
              </h1>
              <p className="text-xs text-rose-600 mt-2 max-w-sm mx-auto leading-relaxed font-medium">
                {failureReason || 'The code entered could not be verified by the ONTRA auth engine.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-600 space-y-1.5">
              <p className="font-semibold text-slate-900">Troubleshooting Steps:</p>
              <p>• Codes expire 10 minutes after generation.</p>
              <p>• In Demo Mode, use <strong>492815</strong> for email or <strong>719204</strong> for mobile OTP.</p>
              <p>• Ensure your phone can receive standard SMS notifications.</p>
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center bg-slate-900 hover:bg-slate-800"
                onClick={() => {
                  setCurrentStep('email');
                  setEmailCode('492815');
                  setMobileOtp('719204');
                }}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Retry with Verified Demo Credentials
              </Button>

              <Link to="/contact">
                <Button variant="ghost" size="sm" className="w-full justify-center text-xs text-slate-600">
                  Contact Compliance & Verification Support
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
