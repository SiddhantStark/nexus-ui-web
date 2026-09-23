import { Outlet } from 'react-router';
import AdminSidebar from '@/app/layouts/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
