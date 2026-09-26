import ErrorBoundary from '@/shared/ui/ErrorBoundary';
import RecoveryScreen from '@/app/RecoveryScreen';
import AppProviders from '@/app/providers';
import { BrowserRouter } from 'react-router';
import ToastContainer from '@/shared/ui/Toast';
import AppRoutes from '@/app/router';

export default function App() {
  const baseUrl = import.meta.env.BASE_URL;
  return (
    <ErrorBoundary
      fallback={
        <RecoveryScreen
          homeLink={
            <a className="text-indigo-700 underline" href={baseUrl}>
              Return to store
            </a>
          }
        />
      }
    >
      <BrowserRouter basename={new URL(baseUrl, window.location.origin).pathname}>
        <AppProviders>
          <AppRoutes />
          <ToastContainer />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
