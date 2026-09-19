import { BrowserRouter } from 'react-router';
import { AppProvider } from './context/AppContext';
import ToastContainer from './components/ui/Toast';
import AppRoutes from './app/router';

export default function App() {
  return (
    <BrowserRouter basename={new URL(import.meta.env.BASE_URL, window.location.origin).pathname}>
      <AppProvider>
        <AppRoutes />
        <ToastContainer />
      </AppProvider>
    </BrowserRouter>
  );
}
