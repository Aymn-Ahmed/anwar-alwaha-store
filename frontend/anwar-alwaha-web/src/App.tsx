import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { BottomNav } from './components/common/BottomNav';
import { CartDrawer } from './components/cart/CartDrawer';
import { ToastContainer } from './components/common/ToastContainer';

// Public Storefront Pages
import { HomePage } from './pages/HomePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ReviewProductPage } from './pages/ReviewProductPage';
import { PaymentCallbackPage } from './pages/PaymentCallbackPage';
import { AccountPage } from './pages/AccountPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages & Layout
import { AdminLayout } from './admin/AdminLayout';
import { ProtectedAdminRoute } from './admin/ProtectedAdminRoute';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminProductsPage } from './admin/pages/AdminProductsPage';
import { AdminCategoriesPage } from './admin/pages/AdminCategoriesPage';
import { AdminComplementsPage } from './admin/pages/AdminComplementsPage';
import { AdminServicesPage } from './admin/pages/AdminServicesPage';
import { AdminOrdersPage } from './admin/pages/AdminOrdersPage';
import { AdminReviewsPage } from './admin/pages/AdminReviewsPage';
import { AdminBundlesPage } from './admin/pages/AdminBundlesPage';
import { AdminCouponsPage } from './admin/pages/AdminCouponsPage';
import { AdminErrorLogsPage } from './admin/pages/AdminErrorLogsPage';

export const App: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col font-cairo">
      {/* Global Notifications */}
      <ToastContainer />

      {/* Public Storefront Header (Only on public routes) */}
      {!isAdminRoute && <Header />}

      {/* Main Routes */}
      <main className="flex-1">
        <Routes>
          {/* Public Store Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryId" element={<CategoriesPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:serviceSlug" element={<ServiceDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/review/:productId" element={<ReviewProductPage />} />
          <Route path="/payment/callback" element={<PaymentCallbackPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/track" element={<Navigate to="/account" replace />} />
          <Route path="/track-order" element={<Navigate to="/account" replace />} />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="complements" element={<AdminComplementsPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="bundles" element={<AdminBundlesPage />} />
              <Route path="error-logs" element={<AdminErrorLogsPage />} />
            </Route>
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Public Drawer & Navs (Only on public routes) */}
      {!isAdminRoute && (
        <>
          <CartDrawer />
          <BottomNav />
          <Footer />
        </>
      )}
    </div>
  );
};
