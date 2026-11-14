import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nProvider, useI18n } from '@/i18n'
import { MainLayout } from '@/layouts/MainLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { HomePage } from '@/pages/public/HomePage'
import { ShopPage } from '@/pages/public/ShopPage'
import { ProductPage } from '@/pages/public/ProductPage'
import { CategoriesPage, BrandsPage, SellersPage, NotFoundPage } from '@/pages/public/SimplePages'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterBuyerPage } from '@/pages/auth/RegisterBuyerPage'
import { RegisterSellerPage } from '@/pages/auth/RegisterSellerPage'
import { CartPage } from '@/pages/buyer/CartPage'
import { CheckoutPage } from '@/pages/buyer/CheckoutPage'
import { WishlistPage } from '@/pages/buyer/WishlistPage'
import { AccountOverview } from '@/pages/buyer/AccountPage'
import { OrdersPage } from '@/pages/buyer/OrdersPage'
import {
  SellerOverview,
  SellerProductsPage,
  SellerOrdersPage,
  SellerStorePage,
} from '@/pages/seller/SellerPages'
import { AdminOverviewPage, AdminBoutiquesPage, AdminProductsPage, AdminPlaceholder } from '@/pages/admin/AdminDashboard'
import { PrivacyPage, TermsPage, ShippingPage, ReturnsPage, AboutPage, FaqPage, ContactPage } from '@/pages/legal/LegalPages'

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
})

function BuyerShell() {
  const { t } = useI18n()
  return (
    <DashboardLayout
      title={t.nav.account}
      links={[
        { to: '/account', label: t.buyer.overview },
        { to: '/account/orders', label: t.buyer.orders },
        { to: '/wishlist', label: t.buyer.wishlist },
        { to: '/account/returns', label: t.buyer.returns },
      ]}
    />
  )
}

function SellerShell() {
  const { t } = useI18n()
  return (
    <DashboardLayout
      title="Boutique Portal"
      links={[
        { to: '/seller', label: t.seller.overview },
        { to: '/seller/products', label: t.seller.products },
        { to: '/seller/orders', label: t.seller.orders },
        { to: '/seller/store', label: t.seller.store },
      ]}
    />
  )
}

function AdminShell() {
  const { t } = useI18n()
  return (
    <DashboardLayout
      title={t.nav.admin}
      links={[
        { to: '/admin', label: t.admin.overview },
        { to: '/admin/boutiques', label: t.admin.boutiques },
        { to: '/admin/products', label: t.admin.products },
        { to: '/admin/orders', label: t.admin.orders },
        { to: '/admin/users', label: t.admin.users },
        { to: '/admin/disputes', label: t.admin.disputes },
        { to: '/admin/audit', label: t.admin.audit },
      ]}
    />
  )
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <I18nProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="product/:slug" element={<ProductPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="brands" element={<BrandsPage />} />
              <Route path="sellers" element={<SellersPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterBuyerPage />} />
              <Route path="register/seller" element={<RegisterSellerPage />} />
              <Route path="legal/privacy" element={<PrivacyPage />} />
              <Route path="legal/terms" element={<TermsPage />} />
              <Route path="legal/shipping" element={<ShippingPage />} />
              <Route path="legal/returns" element={<ReturnsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="legal/faq" element={<FaqPage />} />
              <Route path="legal/contact" element={<ContactPage />} />
              <Route path="help" element={<FaqPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="account" element={<BuyerShell />}>
                  <Route index element={<AccountOverview />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="returns" element={<AdminPlaceholder title="Returns" />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['Vendor', 'Admin', 'SuperAdmin']} />}>
                <Route path="seller" element={<SellerShell />}>
                  <Route index element={<SellerOverview />} />
                  <Route path="products" element={<SellerProductsPage />} />
                  <Route path="orders" element={<SellerOrdersPage />} />
                  <Route path="store" element={<SellerStorePage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['Admin', 'SuperAdmin']} />}>
                <Route path="admin" element={<AdminShell />}>
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="boutiques" element={<AdminBoutiquesPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="orders" element={<AdminPlaceholder title="Orders" />} />
                  <Route path="users" element={<AdminPlaceholder title="Users" />} />
                  <Route path="disputes" element={<AdminPlaceholder title="Disputes" />} />
                  <Route path="audit" element={<AdminPlaceholder title="Audit log" />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/home" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </QueryClientProvider>
  )
}
