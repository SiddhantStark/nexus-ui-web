import { useSession } from '@/features/auth/SessionProvider';
import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, Link, useLocation, useParams } from 'react-router';
import CustomerLayout from '@/app/layouts/CustomerLayout';
import AdminLayout from '@/app/layouts/AdminLayout';
// Auth
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';

// Customer
import HomePage from '@/features/catalog/pages/HomePage';
import ProductListingPage from '@/features/catalog/pages/ProductListingPage';
import ProductDetailsPage from '@/features/catalog/pages/ProductDetailsPage';
import CartPage from '@/features/cart/pages/CartPage';
import CheckoutPage from '@/features/checkout/pages/CheckoutPage';
import OrderSuccessPage from '@/features/orders/pages/OrderSuccessPage';
import MyOrdersPage from '@/features/orders/pages/MyOrdersPage';
import OrderDetailsPage from '@/features/orders/pages/OrderDetailsPage';
import TransactionHistoryPage from '@/features/payments/pages/TransactionHistoryPage';

// Admin
import AdminDashboard from '@/features/dashboard/pages/AdminDashboard';
import AdminProductsPage from '@/features/catalog/pages/admin/AdminProductsPage';
import AddEditProductPage from '@/features/catalog/pages/admin/AddEditProductPage';
import InventoryPage from '@/features/inventory/pages/InventoryPage';
import AdminOrdersPage from '@/features/orders/pages/admin/AdminOrdersPage';
import AdminTransactionsPage from '@/features/payments/pages/admin/AdminTransactionsPage';
import AdminRefundsPage from '@/features/refunds/pages/AdminRefundsPage';

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
  );
}
