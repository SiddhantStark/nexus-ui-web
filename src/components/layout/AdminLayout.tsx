import type { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import ToastContainer from '../ui/Toast';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
