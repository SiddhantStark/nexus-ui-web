import { Link, Outlet } from 'react-router';
import Navbar from '@/app/layouts/Navbar';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-400 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                    <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25z" />
                    <path d="M8.625 18.375a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
                  </svg>
                </div>
                <span
                  className="text-white font-bold text-sm"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  NexusCommerce
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                Modern e-commerce built for speed, clarity, and trust.
              </p>
            </div>
            {[
              {
                title: 'Shop',
                links: ['Electronics', 'Accessories', 'Footwear', 'Home & Kitchen'].map(
                  (label) => ({
                    label,
                    to: `/products?${new URLSearchParams({ category: label })}`,
                  }),
                ),
              },
              {
                title: 'Account',
                links: [
                  { label: 'My Orders', to: '/orders' },
                  { label: 'Transactions', to: '/transactions' },
                ],
              },
              {
                title: 'Browse',
                links: [
                  { label: 'All Products', to: '/products' },
                  { label: 'Shopping Cart', to: '/cart' },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
                  {title}
                </h4>
                <ul className="space-y-2">
                  {links.map(({ label, to }) => (
                    <li key={to}>
                      <Link to={to} className="text-xs hover:text-white hover:underline">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs">© 2024 NexusCommerce, Inc. All rights reserved.</p>
            <p className="text-xs">Secure payments · Fast delivery · Easy returns</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
