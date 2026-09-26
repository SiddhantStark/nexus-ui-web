import { useErrorFocus } from '@/shared/hooks/useErrorFocus';
import { useSession } from '@/features/auth/SessionProvider';
import { Link, useLocation, useNavigate } from 'react-router';
import { loginDestination } from '@/features/auth/authDestination';
import { useState } from 'react';
import { Input } from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const formRef = useErrorFocus(error);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate(loginDestination(search, result.user), { replace: true });
    else setError(result.error ?? 'Login failed');
  }

  function quickLogin(type: 'customer' | 'admin') {
    if (type === 'customer') {
      setEmail('customer@nexuscommerce.com');
      setPassword('password123');
    } else {
      setEmail('admin@nexuscommerce.com');
      setPassword('admin123');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-indigo-700 p-12 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875H5.25a3.375 3.375 0 016.75 0h2.625a1.875 1.875 0 001.875-1.875V15z" />
            </svg>
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
            NexusCommerce
          </span>
        </div>
        <div>
          <h1
            className="text-4xl font-bold leading-tight mb-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Commerce built
            <br />
            for clarity.
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed mb-8">
            Manage orders, track payments, and handle refunds with confidence. Every flow built to
            be transparent and reliable.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: 'Demo', label: 'Sample catalog' },
              { stat: 'No charge', label: 'Simulated payments' },
              { stat: 'In memory', label: 'Resets on refresh' },
              { stat: 'Two roles', label: 'Customer and admin' },
            ].map(({ stat, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {stat}
                </p>
                <p className="text-xs text-indigo-200 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-300 text-sm">© {new Date().getFullYear()} NexusCommerce, Inc.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25z" />
              </svg>
            </div>
            <span
              className="text-lg font-bold text-slate-900"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              NexusCommerce
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your credentials to continue</p>

          {/* Quick login shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => quickLogin('customer')}
              className="text-xs border border-dashed border-slate-300 rounded-lg p-2.5 text-slate-600 hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-left"
            >
              <p className="font-semibold mb-0.5">Demo: Customer</p>
              <p className="text-slate-500">customer@nexuscommerce.com</p>
            </button>
            <button
              onClick={() => quickLogin('admin')}
              className="text-xs border border-dashed border-slate-300 rounded-lg p-2.5 text-slate-600 hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-left"
            >
              <p className="font-semibold mb-0.5">Demo: Admin</p>
              <p className="text-slate-500">admin@nexuscommerce.com</p>
            </button>
          </div>

          <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              required
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              required
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {error && (
              <div
                id="login-error"
                role="alert"
                className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
            <Button type="submit" loading={loading} fullWidth size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            {"Don't have an account? "}
            <Link to={'/register' + search} className="text-indigo-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
