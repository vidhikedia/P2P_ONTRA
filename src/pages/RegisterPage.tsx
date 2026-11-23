/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input.tsx';
import { Button } from '../components/ui/Button.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../hooks/useToast.ts';
import { 
  Eye, 
  EyeOff, 
  UserCheck, 
  Store, 
  ShieldCheck, 
  CheckCircle2, 
  Lock,
  ArrowRight
} from 'lucide-react';

import { validateRegistrationForm } from '../utils/validators.ts';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRegistrationForm({
      fullName,
      email,
      mobile,
      city,
      password,
      confirmPassword,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const newUser = await register({
        fullName,
        email,
        mobile,
        password,
        city,
        role,
      });

      showToast(
        'Account Registered',
        'Verification codes dispatched to your email and mobile phone.',
        'success'
      );

      // Navigate to the verification onboarding screen
      navigate(`/verification?type=email&role=${role}`);
    } catch (err: unknown) {
      showToast(
        'Registration Failed',
        err instanceof Error ? err.message : 'An error occurred during registration.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center mx-auto mb-3 text-base shadow-xs">
            O
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Your ONTRA Account
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Join the verified peer-to-peer marketplace with escrow custody and physical inspection protection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection with Clear Explanations */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Primary Trading Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Buyer Card */}
              <div
                onClick={() => setRole('buyer')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  role === 'buyer'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-4 h-4 ${role === 'buyer' ? 'text-white' : 'text-slate-800'}`} />
                    <span className="text-sm font-bold">Buyer Account</span>
                  </div>
                  {role === 'buyer' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <p className={`text-xs leading-relaxed ${role === 'buyer' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Discover verified items, negotiate binding offers, deposit payments into neutral escrow, and inspect in person for 48 hours.
                </p>
              </div>

              {/* Seller Card */}
              <div
                onClick={() => setRole('seller')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  role === 'seller'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Store className={`w-4 h-4 ${role === 'seller' ? 'text-white' : 'text-slate-800'}`} />
                    <span className="text-sm font-bold">Seller Account</span>
                  </div>
                  {role === 'seller' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <p className={`text-xs leading-relaxed ${role === 'seller' ? 'text-slate-300' : 'text-slate-500'}`}>
                  List pre-owned products with timestamped optical evidence manifests, receive insured courier labels, and guaranteed payouts.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Note: You can switch or add trading capabilities later in your account settings.
            </p>
          </div>

          {/* Full Name */}
          <Input
            label="Full Legal Name"
            placeholder="e.g. Aarav Verma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            required
          />

          {/* Email Address & Mobile Number in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="aarav@example.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />

            <Input
              label="Mobile Number (with +91 country code)"
              type="tel"
              placeholder="+91 98290 45120"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              error={errors.mobile}
              helperText="For 2-factor OTP and courier alerts"
              required
            />
          </div>

          {/* City */}
          <Input
            label="City"
            placeholder="e.g. Jaipur, Bengaluru, New Delhi, Mumbai"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={errors.city}
            helperText="Used for localized physical handovers and freight calculation"
            required
          />

          {/* Password & Confirm Password in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
            </div>

            <div>
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="cursor-pointer text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
            </div>
          </div>

          {/* Verification terms notification */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Two-Step Identity & Contact Onboarding</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Upon submitting, you will be prompted to verify your email address and mobile phone via SMS OTP to confirm platform trust standards.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center bg-blue-900 hover:bg-blue-950 font-semibold"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account & Continue to Verification
          </Button>

          {/* Sign in redirect */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Already have a verified account?{' '}
              <Link to="/login" className="font-semibold text-slate-900 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
