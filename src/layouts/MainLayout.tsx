/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { RoleSwitcherBar } from '../components/common/RoleSwitcherBar.tsx';
import { Navbar } from '../components/common/Navbar.tsx';
import { Footer } from '../components/common/Footer.tsx';
import { AuthModal } from '../components/common/AuthModal.tsx';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top role simulator banner */}
      <RoleSwitcherBar />

      {/* Main Top Navigation conforming to Top Bar Contract */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Auth Modal for login/signup/role-switch */}
      <AuthModal />
    </div>
  );
};
