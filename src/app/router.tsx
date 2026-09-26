import { useSession } from '@/features/auth/SessionProvider';
import { useEffect, lazy, Suspense } from 'react';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';
import RecoveryScreen from '@/app/RecoveryScreen';
import RouteLoading from '@/app/RouteLoading';
import { Routes, Route, Navigate, Outlet, Link, useLocation, useParams } from 'react-router';
import CustomerLayout from '@/app/layouts/CustomerLayout';
import AdminLayout from '@/app/layouts/AdminLayout';
// Auth
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';

// Customer
const HomePage = lazy(() => import('@/features/catalog/pages/HomePage'));
const ProductListingPage = lazy(() => import('@/features/catalog/pages/ProductListingPage'));
const ProductDetailsPage = lazy(() => import('@/features/catalog/pages/ProductDetailsPage'));
const CartPage = lazy(() => import('@/features/cart/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/features/checkout/pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('@/features/orders/pages/OrderSuccessPage'));
const MyOrdersPage = lazy(() => import('@/features/orders/pages/MyOrdersPage'));
const OrderDetailsPage = lazy(() => import('@/features/orders/pages/OrderDetailsPage'));
const TransactionHistoryPage = lazy(
  () => import('@/features/payments/pages/TransactionHistoryPage'),
);

// Admin
const AdminDashboard = lazy(() => import('@/features/dashboard/pages/AdminDashboard'));
const AdminProductsPage = lazy(() => import('@/features/catalog/pages/admin/AdminProductsPage'));
const AddEditProductPage = lazy(() => import('@/features/catalog/pages/admin/AddEditProductPage'));
const InventoryPage = lazy(() => import('@/features/inventory/pages/InventoryPage'));
const AdminOrdersPage = lazy(() => import('@/features/orders/pages/admin/AdminOrdersPage'));
const AdminTransactionsPage = lazy(
  () => import('@/features/payments/pages/admin/AdminTransactionsPage'),
);
const AdminRefundsPage = lazy(() => import('@/features/refunds/pages/AdminRefundsPage'));

function RequireSession() {
  const { currentUser } = useSession();
  const location = useLocation();
  return currentUser ? (
    <Outlet />
  ) : (
    <Navigate
      replace
      to={`/login?${new URLSearchParams({ next: location.pathname + location.search + location.hash })}`}
    />
  );
}
function RequireAdmin() {
  const { currentUser } = useSession();
  return currentUser?.role === 'admin' ? <Outlet /> : <Navigate replace to="/forbidden" />;
}
function RouteMessage({ forbidden = false }: { forbidden?: boolean }) {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h1 className="text-2xl font-bold mb-4">{forbidden ? 'Access denied' : 'Page not found'}</h1>
      <p className="mb-6 text-slate-600">
        {forbidden
          ? 'Your account cannot access this page.'
          : 'Check the address or return to the store.'}
      </p>
      <Link to="/" className="text-indigo-600 underline">
        Return to store
      </Link>
    </main>
  );
}
function ProductRoute() {
  const { productId } = useParams();
  return <ProductDetailsPage key={productId} />;
}
function ProductFormRoute() {
  const { productId } = useParams();
  return <AddEditProductPage key={productId ?? 'new'} />;
}
function OrderRoute({ success = false }: { success?: boolean }) {
  const { orderId } = useParams();
  return success ? <OrderSuccessPage key={orderId} /> : <OrderDetailsPage key={orderId} />;
}
export default function AppRoutes() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <ErrorBoundary
      key={pathname}
      fallback={
        <RecoveryScreen
          homeLink={
            <Link className="text-indigo-700 underline" to="/">
              Return to store
            </Link>
          }
        />
      }
    >
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route element={<RequireSession />}>
            <Route element={<CustomerLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductListingPage />} />
              <Route path="products/:productId" element={<ProductRoute />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="orders/:orderId" element={<OrderRoute />} />
              <Route path="orders/:orderId/success" element={<OrderRoute success />} />
              <Route path="transactions" element={<TransactionHistoryPage />} />
            </Route>
            <Route path="admin" element={<RequireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<ProductFormRoute />} />
                <Route path="products/:productId/edit" element={<ProductFormRoute />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="transactions" element={<AdminTransactionsPage />} />
                <Route path="refunds" element={<AdminRefundsPage />} />
                <Route path="*" element={<RouteMessage />} />
              </Route>
            </Route>
            <Route path="forbidden" element={<RouteMessage forbidden />} />
          </Route>
          <Route path="*" element={<RouteMessage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
