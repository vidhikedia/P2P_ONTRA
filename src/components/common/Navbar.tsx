/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { Button } from '../ui/Button.tsx';
import { 
  Menu, 
  X, 
  ShieldCheck, 
  Plus, 
  ChevronDown, 
  LogOut,
  Heart,
  Tv,
  Laptop,
  Armchair,
  BookOpen,
  Flame,
  Bike,
  Watch,
  Package
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { MOCK_CATEGORIES } from '../../data/mockData.ts';

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  electronics: <Tv className="w-4 h-4 text-slate-700" />,
  mobiles_laptops: <Laptop className="w-4 h-4 text-slate-700" />,
  furniture: <Armchair className="w-4 h-4 text-slate-700" />,
  books: <BookOpen className="w-4 h-4 text-slate-700" />,
  home_appliances: <Flame className="w-4 h-4 text-slate-700" />,
  sports_fitness: <Bike className="w-4 h-4 text-slate-700" />,
  fashion_accessories: <Watch className="w-4 h-4 text-slate-700" />,
  other_products: <Package className="w-4 h-4 text-slate-700" />,
};

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, openAuthModal, logout, switchRole } = useAuth();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSellClick = () => {
    if (!isAuthenticated) {
      openAuthModal('signup');
    } else {
      if (role !== 'seller') {
        switchRole('seller');
      }
      navigate('/seller/dashboard?tab=add_product');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* 1. Brand Logo & Name */}
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              O
            </div>
            <span>ONTRA</span>
          </Link>

          {/* 2. Navigation Links & Categories Dropdown */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              to="/"
              className={`transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Home
            </Link>

            <Link
              to="/explore"
              className={`transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/explore' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Explore
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  categoriesOpen || location.pathname.startsWith('/categories')
                    ? 'text-slate-900 font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    8 Verified Categories
                  </div>
                  <div className="py-1 max-h-96 overflow-y-auto">
                    {MOCK_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/explore?category=${cat.id}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          {CATEGORY_ICON_MAP[cat.id] || <Package className="w-4 h-4 text-slate-500" />}
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <span className="text-[11px] font-mono tabular-nums text-slate-400">
                          {cat.itemCount}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="px-3 pt-2 border-t border-slate-100">
                    <Link
                      to="/categories"
                      onClick={() => setCategoriesOpen(false)}
                      className="block text-[11px] text-center font-semibold text-slate-900 hover:underline py-1"
                    >
                      View Category Verification Guidelines →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/how-it-works"
              className={`transition-colors whitespace-nowrap shrink-0 ${
                location.pathname === '/how-it-works' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              How It Works
            </Link>
          </nav>

          {/* 3. Action Zone: Login / Sign Up / Prominent "Sell an Item" Button */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Wishlist Link with dynamic badge */}
            <Link
              to="/buyer/dashboard?tab=wishlist"
              className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Saved Wishlist Items"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={role === 'seller' ? '/seller/dashboard' : role === 'admin' ? '/admin/dashboard' : '/buyer/dashboard'}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="text-right hover:opacity-85 transition-opacity flex items-center gap-2 pl-1 border-l border-slate-200"
                  title="View Profile & Verification"
                >
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                      <span>{user.trustScore.score}% Trust</span>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Prominent "Sell an Item" Button */}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleSellClick}
              className="font-semibold shadow-xs"
            >
              Sell an Item
            </Button>
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/buyer/dashboard"
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute 1 -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Home
            </Link>
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Explore Products
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Categories & Standards
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              How It Works & Escrow
            </Link>
            <Link
              to="/buyer/dashboard?tab=wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-slate-500" />
                <span>Saved Wishlist</span>
              </span>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold font-mono">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {isAuthenticated && (
              <Link
                to={role === 'seller' ? '/seller/dashboard' : role === 'admin' ? '/admin/dashboard' : '/buyer/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-blue-900 bg-blue-50/60 rounded-lg"
              >
                Go to {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard →
              </Link>
            )}
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setMobileMenuOpen(false);
                handleSellClick();
              }}
              className="w-full justify-center font-semibold"
            >
              Sell an Item
            </Button>

            {isAuthenticated && user ? (
              <div className="flex items-center justify-between px-2 pt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-500 capitalize">{user.role} · {user.trustScore.score}% Trust</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  onClick={() => {
                    openAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="justify-center"
                  onClick={() => {
                    openAuthModal('signup');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
