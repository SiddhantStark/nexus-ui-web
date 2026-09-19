import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, Link, useLocation, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import CustomerLayout from '../components/layout/CustomerLayout';
import AdminLayout from '../components/layout/AdminLayout';
// Auth
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Customer
import HomePage from '../pages/customer/HomePage';
import ProductListingPage from '../pages/customer/ProductListingPage';
import ProductDetailsPage from '../pages/customer/ProductDetailsPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderSuccessPage from '../pages/customer/OrderSuccessPage';
import MyOrdersPage from '../pages/customer/MyOrdersPage';
import OrderDetailsPage from '../pages/customer/OrderDetailsPage';
import TransactionHistoryPage from '../pages/customer/TransactionHistoryPage';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AddEditProductPage from '../pages/admin/AddEditProductPage';
import InventoryPage from '../pages/admin/InventoryPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminTransactionsPage from '../pages/admin/AdminTransactionsPage';
import AdminRefundsPage from '../pages/admin/AdminRefundsPage';

function RequireSession() {
  const { currentUser } = useApp();
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
  const { currentUser } = useApp();
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
