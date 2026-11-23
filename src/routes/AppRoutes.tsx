/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout.tsx';
import { HomePage } from '../pages/HomePage.tsx';
import { ExplorePage } from '../pages/ExplorePage.tsx';
import { ProductDetailPage } from '../pages/ProductDetailPage.tsx';
import { CategoriesPage } from '../pages/CategoriesPage.tsx';
import { HowItWorksPage } from '../pages/HowItWorksPage.tsx';
import { RegisterPage } from '../pages/RegisterPage.tsx';
import { LoginPage } from '../pages/LoginPage.tsx';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage.tsx';
import { VerificationPage } from '../pages/VerificationPage.tsx';
import { CheckoutPage } from '../pages/CheckoutPage.tsx';
import { PaymentPage } from '../pages/PaymentPage.tsx';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage.tsx';
import { OrderTrackingPage } from '../pages/OrderTrackingPage.tsx';
import { CourierDeliveryPage } from '../pages/CourierDeliveryPage.tsx';
import { DirectHandoverPage } from '../pages/DirectHandoverPage.tsx';
import { BuyerInspectionPage } from '../pages/BuyerInspectionPage.tsx';
import { DisputePage } from '../pages/DisputePage.tsx';
import { RefundPage } from '../pages/RefundPage.tsx';
import { TransactionHistoryPage } from '../pages/TransactionHistoryPage.tsx';
import { ReviewsPage } from '../pages/ReviewsPage.tsx';
import { BuyerDashboard } from '../pages/BuyerDashboard.tsx';
import { SellerDashboard } from '../pages/SellerDashboard.tsx';
import { AdminDashboard } from '../pages/AdminDashboard.tsx';
import { ProfilePage } from '../pages/ProfilePage.tsx';
import { UnauthorizedPage } from '../pages/UnauthorizedPage.tsx';
import { NotFoundPage } from '../pages/NotFoundPage.tsx';
import { ProtectedRoute } from '../components/common/ProtectedRoute.tsx';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public marketplace routes */}
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />

        {/* Checkout, Payment, & Order Tracking Flow */}
        <Route path="checkout/:productId" element={<CheckoutPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="payment/:orderId" element={<PaymentPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="order-tracking/:orderId" element={<OrderTrackingPage />} />
        <Route path="order-tracking" element={<OrderTrackingPage />} />
        <Route path="orders/:orderId" element={<OrderTrackingPage />} />

        {/* Delivery, Handover & Buyer Inspection Interfaces */}
        <Route path="delivery/courier/:orderId" element={<CourierDeliveryPage />} />
        <Route path="delivery/courier" element={<CourierDeliveryPage />} />
        <Route path="delivery/handover/:orderId" element={<DirectHandoverPage />} />
        <Route path="delivery/handover" element={<DirectHandoverPage />} />
        <Route path="inspection/:orderId" element={<BuyerInspectionPage />} />
        <Route path="buyer/inspection/:orderId" element={<BuyerInspectionPage />} />
        <Route path="inspection" element={<BuyerInspectionPage />} />

        {/* Dispute, Refund, Transaction History & Review Flows */}
        <Route path="disputes/new/:orderId" element={<DisputePage />} />
        <Route path="disputes/new" element={<DisputePage />} />
        <Route path="disputes/:disputeId" element={<DisputePage />} />
        <Route path="disputes" element={<DisputePage />} />
        <Route path="refunds/:refundId" element={<RefundPage />} />
        <Route path="refunds" element={<RefundPage />} />
        <Route path="transactions" element={<TransactionHistoryPage />} />
        <Route path="reviews/:sellerId" element={<ReviewsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />

        {/* Auth & Onboarding routes */}
        <Route path="register" element={<RegisterPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="verification" element={<VerificationPage />} />


        {/* Universal Authenticated Profile */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Role Protected Dashboards */}
        <Route
          path="buyer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'admin']}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="seller/dashboard"
          element={
            <ProtectedRoute allowedRoles={['seller', 'admin']}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Convenience alias paths */}
        <Route path="buyer" element={<Navigate to="/buyer/dashboard" replace />} />
        <Route path="seller" element={<Navigate to="/seller/dashboard" replace />} />
        <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Status routes */}
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
