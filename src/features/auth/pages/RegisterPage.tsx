import { useErrorFocus } from '@/shared/hooks/useErrorFocus';
import { useSession } from '@/features/auth/SessionProvider';
import { useNotificationActions } from '@/shared/notifications/NotificationProvider';
import { Link, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { Input } from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { register } = useSession();
  const { addToast } = useNotificationActions();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useErrorFocus(errors);
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (!result.success) {
      setErrors({ email: result.error ?? 'Registration failed.' });
      return;
    }
    addToast('Demo account created! Please sign in.', 'success');
    navigate('/login' + search);
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
    error: errors[key],
  });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link
          to={'/login' + search}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to sign in
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25z" />
              </svg>
            </div>
            <span
              className="font-bold text-slate-900"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              NexusCommerce
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Create your account</h2>
          <p className="text-sm text-slate-500 mb-6">
            Demo only: this account lasts until refresh. Use a demo password, not a real one.
          </p>
          <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Full Name" placeholder="Alex Rivera" {...field('name')} />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              {...field('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              {...field('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              {...field('confirm')}
            />
            <Button type="submit" loading={loading} fullWidth className="mt-1">
              Create Account
            </Button>
          </form>
          <p className="text-sm text-center text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to={'/login' + search} className="text-indigo-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
