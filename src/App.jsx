import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Critical pages - loaded immediately
import SaaSLandingPage from './pages/SaaSLandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Lazy loaded pages
const CustomerMenuPage = lazy(() => import('./pages/CustomerMenuPage'))
const MerchantRegisterPage = lazy(() => import('./pages/MerchantRegisterPage'))
const MerchantOnboardingPage = lazy(() => import('./pages/MerchantOnboardingPage'))
const SuperAdminDashboardPage = lazy(() => import('./pages/superadmin/SuperAdminDashboardPage'))
const MerchantDashboardPage = lazy(() => import('./pages/merchant/MerchantDashboardPage'))
const MerchantMenuBuilderPage = lazy(() => import('./pages/merchant/MerchantMenuBuilderPage'))
const MerchantTablesPage = lazy(() => import('./pages/merchant/MerchantTablesPage'))
const MerchantOrdersPage = lazy(() => import('./pages/merchant/MerchantOrdersPage'))
const MerchantAnalyticsPage = lazy(() => import('./pages/merchant/MerchantAnalyticsPage'))
const FoodDetailPage = lazy(() => import('./pages/FoodDetailPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPageV2'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const CouponsPage = lazy(() => import('./pages/CouponsPage'))
const LoyaltyPage = lazy(() => import('./pages/LoyaltyPage'))
// Admin Pages - New System
const AdminDashboardNew = lazy(() => import('./pages/admin/AdminDashboardMobile'))
const AdminOrdersPageNew = lazy(() => import('./pages/admin/AdminOrdersPageNew'))
const AdminProductsPageNew = lazy(() => import('./pages/admin/AdminProductsPageNew'))
const AdminUsersPageNew = lazy(() => import('./pages/admin/AdminUsersPageNew'))
const AdminCouponsPageNew = lazy(() => import('./pages/admin/AdminCouponsPageNew'))
const AdminMerchantsPage = lazy(() => import('./pages/admin/AdminMerchantsPage'))
const AdminFinancePage = lazy(() => import('./pages/admin/AdminFinancePage'))
const AdminReportsPageNew = lazy(() => import('./pages/admin/AdminReportsPageNew'))
const AdminSettingsPageNew = lazy(() => import('./pages/admin/AdminSettingsPageNew'))
const AdminCEOPage = lazy(() => import('./pages/admin/AdminCEOPage'))
const AdminGoogleSEOPage = lazy(() => import('./pages/admin/AdminGoogleSEOPage'))
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage'))

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Caricamento...</p>
    </div>
  </div>
)
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { LoyaltyProvider } from './context/LoyaltyContext'
import { CouponsProvider } from './context/CouponsContext'
import { OrdersProvider } from './context/OrdersContext'
import { UserProvider } from './context/UserContext'
import { RBACProvider } from './context/RBACContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { TenantProvider } from './context/TenantContext'
import { MerchantProvider } from './context/MerchantContext'

function App() {
  return (
    <MerchantProvider>
      <UserProvider>
      <OrdersProvider>
        <LoyaltyProvider>
          <CouponsProvider>
            <FavoritesProvider>
              <CartProvider>
                <TenantProvider>
                  <Router>
                    <RBACProvider>
                      <NotificationsProvider>
                    <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Admin Routes - New System */}
                      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
                      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="/admin/dashboard" element={<AdminDashboardNew />} />
                      <Route path="/admin/orders" element={<AdminOrdersPageNew />} />
                      <Route path="/admin/products" element={<AdminProductsPageNew />} />
                      <Route path="/admin/merchants" element={<AdminMerchantsPage />} />
                      <Route path="/admin/users" element={<AdminUsersPageNew />} />
                      <Route path="/admin/coupons" element={<AdminCouponsPageNew />} />
                      <Route path="/admin/finance" element={<AdminFinancePage />} />
                      <Route path="/admin/reports" element={<AdminReportsPageNew />} />
                      <Route path="/admin/settings" element={<AdminSettingsPageNew />} />
                      <Route path="/admin/ceo" element={<AdminCEOPage />} />
                      <Route path="/admin/google-seo" element={<AdminGoogleSEOPage />} />
                      <Route path="/admin/profile" element={<AdminProfilePage />} />

                      {/* SaaS Landing Page */}
                      <Route path="/" element={<SaaSLandingPage />} />

                      {/* Auth Routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/merchant/register" element={<MerchantRegisterPage />} />
                      <Route path="/merchant/onboarding" element={<MerchantOnboardingPage />} />

                      {/* Super Admin Routes */}
                      <Route path="/superadmin" element={<SuperAdminDashboardPage />} />
                      <Route path="/superadmin/dashboard" element={<SuperAdminDashboardPage />} />

                      {/* Merchant Routes */}
                      <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />
                      <Route path="/merchant/menu" element={<MerchantMenuBuilderPage />} />
                      <Route path="/merchant/tables" element={<MerchantTablesPage />} />
                      <Route path="/merchant/orders" element={<MerchantOrdersPage />} />
                      <Route path="/merchant/analytics" element={<MerchantAnalyticsPage />} />
                      <Route path="/merchant/settings" element={<MerchantDashboardPage />} />

                      {/* Customer Menu Routes (Demo - will be multi-tenant later) */}
                      <Route path="/demo" element={<CustomerMenuPage />} />
                      <Route path="/food/:id" element={<FoodDetailPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/coupons" element={<CouponsPage />} />
                      <Route path="/loyalty" element={<LoyaltyPage />} />
                      </Routes>
                    </Suspense>
                      </NotificationsProvider>
                    </RBACProvider>
                  </Router>
                </TenantProvider>
              </CartProvider>
            </FavoritesProvider>
          </CouponsProvider>
        </LoyaltyProvider>
      </OrdersProvider>
    </UserProvider>
    </MerchantProvider>
  )
}

export default App
