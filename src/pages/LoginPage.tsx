/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../components/ui/Input.tsx';
import { Button } from '../components/ui/Button.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../hooks/useToast.ts';
import { 
  Eye, 
  EyeOff, 
  UserCheck, 
  Store, 
  ShieldAlert, 
  Lock, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

import { validateLoginForm } from '../utils/validators.ts';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const { login, loginAsDemoUser } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const routeByRole = (userRole: 'buyer' | 'seller' | 'admin' | string) => {
    if (redirectPath) {
      navigate(redirectPath);
      return;
    }
    switch (userRole) {
      case 'seller':
        navigate('/seller/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'buyer':
      default:
        navigate('/buyer/dashboard');
        break;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = validateLoginForm({ identifier, password });
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError(Object.values(validation.errors)[0]);
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({ identifier, password, rememberMe });
      showToast(
        'Signed In Successfully',
        `Welcome back, ${user.name}. Entering ${user.role.toUpperCase()} workspace.`,
        'success'
      );
      routeByRole(user.role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = (role: 'buyer' | 'seller' | 'admin') => {
    loginAsDemoUser(role);
    showToast(
      `Signed In as Demo ${role.toUpperCase()}`,
      `Loaded simulated credentials & trust profile.`,
      'info'
    );
    routeByRole(role);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center mx-auto mb-3 text-base shadow-xs">
            O
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In to ONTRA
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your escrow vault, active inspections, and verified inventory.
          </p>
        </div>

        {/* 1-Click Demo Profiles for evaluation */}
        <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-800">1-Click Demo Personas:</span>
            <span className="text-[10px] text-slate-500">Instant testing</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('buyer')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors text-left cursor-pointer flex flex-col items-center"
            >
              <UserCheck className="w-4 h-4 text-slate-700 mb-1" />
              <span className="text-xs font-semibold">Buyer</span>
              <span className="text-[10px] text-slate-400">Ananya</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('seller')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors text-left cursor-pointer flex flex-col items-center"
            >
              <Store className="w-4 h-4 text-slate-700 mb-1" />
              <span className="text-xs font-semibold">Seller</span>
              <span className="text-[10px] text-slate-400">Rohan</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('admin')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors text-left cursor-pointer flex flex-col items-center"
            >
              <ShieldAlert className="w-4 h-4 text-slate-700 mb-1" />
              <span className="text-xs font-semibold">Admin</span>
              <span className="text-[10px] text-slate-400">Priya</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email or Mobile Number"
            type="text"
            placeholder="e.g. ananya@ontra.in or +91 98290..."
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span>Remember this device</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center bg-blue-900 hover:bg-blue-950 font-semibold mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Dashboard
          </Button>

          <div className="text-center pt-3">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-slate-900 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
