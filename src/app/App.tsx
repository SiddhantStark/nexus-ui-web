import AppProviders from '@/app/providers';
import { BrowserRouter } from 'react-router';
import ToastContainer from '@/shared/ui/Toast';
import AppRoutes from '@/app/router';

export default function App() {
  return (
    <BrowserRouter basename={new URL(import.meta.env.BASE_URL, window.location.origin).pathname}>
      <AppProviders>
        <AppRoutes />
        <ToastContainer />
      </AppProviders>
    </BrowserRouter>
  );
}
