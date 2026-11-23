/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types/index.ts';
import { authService, RegisterPayload, LoginPayload } from '../services/authService.ts';
import { MOCK_USERS } from '../data/mockData.ts';

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  switchRole: (newRole: UserRole) => void;
  loginAsDemoUser: (demoRole: 'buyer' | 'seller' | 'admin') => void;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  verifyEmailSuccess: () => void;
  verifyMobileSuccess: () => void;
  pendingOnboardingUser: User | null;
  setPendingOnboardingUser: (user: User | null) => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with a verified Buyer so the user can immediately experience authenticated features
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS.buyer);
  const [currentRole, setCurrentRole] = useState<UserRole>('buyer');
  const [pendingOnboardingUser, setPendingOnboardingUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'guest') {
      setCurrentUser(null);
    } else {
      setCurrentUser(MOCK_USERS[newRole]);
    }
  };

  const loginAsDemoUser = (demoRole: 'buyer' | 'seller' | 'admin') => {
    setCurrentRole(demoRole);
    setCurrentUser(MOCK_USERS[demoRole]);
    setIsAuthModalOpen(false);
  };

  const login = async (payload: LoginPayload): Promise<User> => {
    const res = await authService.login(payload);
    setCurrentUser(res.data);
    setCurrentRole(res.data.role);
    setIsAuthModalOpen(false);
    return res.data;
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    const res = await authService.register(payload);
    setPendingOnboardingUser(res.data.user);
    return res.data.user;
  };

  const updateUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
  };

  const verifyEmailSuccess = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, emailVerified: true });
    }
    if (pendingOnboardingUser) {
      setPendingOnboardingUser({ ...pendingOnboardingUser, emailVerified: true });
    }
  };

  const verifyMobileSuccess = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, mobileVerified: true });
    }
    if (pendingOnboardingUser) {
      setPendingOnboardingUser({ ...pendingOnboardingUser, mobileVerified: true });
    }
  };

  const logout = () => {
    setCurrentRole('guest');
    setCurrentUser(null);
  };

  const openAuthModal = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        role: currentRole,
        isAuthenticated: currentRole !== 'guest' && currentUser !== null,
        switchRole,
        loginAsDemoUser,
        login,
        register,
        logout,
        updateUser,
        verifyEmailSuccess,
        verifyMobileSuccess,
        pendingOnboardingUser,
        setPendingOnboardingUser,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
