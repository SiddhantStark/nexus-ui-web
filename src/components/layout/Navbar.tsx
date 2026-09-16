import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { navigate, currentUser, logout, cartCount } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875H5.25a3.375 3.375 0 016.75 0h2.625a1.875 1.875 0 001.875-1.875V15z" />
                <path d="M8.625 18.375a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0zM16.875 18.375a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0zM22.5 6.375a3.375 3.375 0 00-3.375-3.375h-1.5a.75.75 0 00-.75.75v11.25c0 .414.336.75.75.75h4.875a.375.375 0 00.375-.375V6.375z" />
              </svg>
            </div>
            <span
              className="text-lg font-bold text-slate-900"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              NexusCommerce
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Home', page: 'home' as const },
              { label: 'Products', page: 'products' as const },
              { label: 'My Orders', page: 'my-orders' as const },
              { label: 'Transactions', page: 'transactions' as const },
            ].map(({ label, page }) => (
              <button
                key={page}
                onClick={() => navigate(page)}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={() => navigate('cart')}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-indigo-700">
                    {currentUser?.name.charAt(0) ?? 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-slate-700">
                  {currentUser?.name.split(' ')[0]}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3.5 h-3.5 text-slate-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500">{currentUser?.email}</p>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('admin-dashboard');
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4 text-slate-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                        />
                      </svg>
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 py-2">
            {(['home', 'products', 'my-orders', 'transactions'] as const).map((page) => (
              <button
                key={page}
                onClick={() => {
                  navigate(page);
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 capitalize"
              >
                {page.replace('-', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>
      {menuOpen && (
        <button
          type="button"
          aria-label="Close account menu"
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
