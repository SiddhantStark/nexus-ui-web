import { AppProvider, useApp } from './context/AppContext';
import ToastContainer from './components/ui/Toast';
import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/layout/AdminLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer
import HomePage from './pages/customer/HomePage';
import ProductListingPage from './pages/customer/ProductListingPage';
import ProductDetailsPage from './pages/customer/ProductDetailsPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import OrderDetailsPage from './pages/customer/OrderDetailsPage';
import TransactionHistoryPage from './pages/customer/TransactionHistoryPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AddEditProductPage from './pages/admin/AddEditProductPage';
import InventoryPage from './pages/admin/InventoryPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminRefundsPage from './pages/admin/AdminRefundsPage';

function Router() {
  const { navigation, currentUser } = useApp();
  const { page } = navigation;

  // Auth pages (no layout)
  if (page === 'register') return <RegisterPage />;
  if (!currentUser || page === 'login') return <LoginPage />;

  // Admin pages
  if (page.startsWith('admin-')) {
    let content: React.ReactNode = null;
    if (page === 'admin-dashboard') content = <AdminDashboard />;
    else if (page === 'admin-products') content = <AdminProductsPage />;
    else if (page === 'admin-product-form') content = <AddEditProductPage />;
    else if (page === 'admin-inventory') content = <InventoryPage />;
    else if (page === 'admin-orders') content = <AdminOrdersPage />;
    else if (page === 'admin-transactions') content = <AdminTransactionsPage />;
    else if (page === 'admin-refunds') content = <AdminRefundsPage />;
    return <AdminLayout>{content}</AdminLayout>;
  }

  // Customer pages
  let content: React.ReactNode = null;
  if (page === 'home') content = <HomePage />;
  else if (page === 'products') content = <ProductListingPage />;
  else if (page === 'product-detail') content = <ProductDetailsPage />;
  else if (page === 'cart') content = <CartPage />;
  else if (page === 'checkout') content = <CheckoutPage />;
  else if (page === 'order-success') content = <OrderSuccessPage />;
  else if (page === 'my-orders') content = <MyOrdersPage />;
  else if (page === 'order-detail') content = <OrderDetailsPage />;
  else if (page === 'transactions') content = <TransactionHistoryPage />;
  else content = <HomePage />;

  return <CustomerLayout>{content}</CustomerLayout>;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
      <ToastContainer />
    </AppProvider>
  );
}
