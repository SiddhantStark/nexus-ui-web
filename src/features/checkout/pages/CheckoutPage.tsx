import { lineTotal } from '@/shared/lib/money';
import { formatCurrency } from '@/shared/lib/format';
import Image from '@/shared/ui/Image';
import { useErrorFocus } from '@/shared/hooks/useErrorFocus';
import { useSession } from '@/features/auth/SessionProvider';
import { useCart } from '@/features/cart/useCart';
import { useCheckout } from '@/features/checkout/useCheckout';
import LinkButton from '@/shared/ui/LinkButton';
import { useNavigate } from 'react-router';
import { useState, useRef, useEffect } from 'react';
import Button from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import Breadcrumbs from '@/shared/ui/Breadcrumbs';
import type { Scenario } from '@/features/checkout/types';

const SHOW_SCENARIOS = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true';

type CheckoutStep = 'form' | 'processing';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { currentUser } = useSession();
  const { cart, cartTotal, cartVersion, cartProblems } = useCart();
  const { checkout } = useCheckout();
  const [step, setStep] = useState<CheckoutStep>('form');
  const [testScenario, setTestScenario] = useState<Scenario>('success');
  const [checkoutError, setCheckoutError] = useState('');
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (pending.current) clearTimeout(pending.current);
    },
    [],
  );

  const [form, setForm] = useState({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useErrorFocus(errors);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email.includes('@')) errs.email = 'Valid email required.';
    if (!form.phone.trim()) errs.phone = 'Phone number is required.';
    if (!form.address.trim()) errs.address = 'Address is required.';
    if (!form.city.trim()) errs.city = 'City is required.';
    if (!form.state.trim()) errs.state = 'State is required.';
    if (!form.postalCode.trim()) errs.postalCode = 'Postal code is required.';
    return errs;
  }

  function handlePlaceOrder() {
    if (pending.current) return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      return;
    }
    if (cartProblems.length) {
      setCheckoutError(cartProblems.join(' '));
      return;
    }
    const version = cartVersion;
    const attempt = crypto.randomUUID();
    setCheckoutError('');
    setStep('processing');
    pending.current = setTimeout(() => {
      pending.current = null;
      const result = checkout(form, version, attempt, SHOW_SCENARIOS ? testScenario : 'success');
      if (result.success) {
        navigate(`/orders/${encodeURIComponent(result.value.id)}/success`, { replace: true });
      } else {
        setCheckoutError(result.error);
        setStep('form');
      }
    }, 800);
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
    error: errors[key],
  });

  if (cart.length === 0 && step === 'form') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500 mb-4">Your cart is empty.</p>
        <LinkButton to={'/products'}>Browse Products</LinkButton>
      </div>
    );
  }

  // Processing state
  if (step === 'processing') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-6"
      >
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Processing your order</h2>
          <p className="text-sm text-slate-500">Checking demo inventory and simulating payment…</p>
        </div>
        <div className="flex flex-col gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            Checking inventory availability
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Simulating payment — no real charge
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-300 rounded-full" />
            Confirming order
          </div>
        </div>
      </div>
    );
  }

  // Main checkout form
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <Breadcrumbs
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]}
      />
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Demo Checkout</h1>
      {checkoutError && (
        <p role="alert" className="text-red-600 mb-4">
          {checkoutError}
        </p>
      )}
      {cartProblems.map((message) => (
        <p role="alert" key={message} className="text-red-600 mb-3">
          {message}
        </p>
      ))}

      <form
        ref={formRef}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handlePlaceOrder();
        }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left: Delivery + Payment */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Delivery info */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 sm:p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                1
              </span>
              Delivery Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name *" required placeholder="Alex Rivera" {...field('name')} />
              <Input
                label="Email Address *"
                required
                type="email"
                placeholder="alex@example.com"
                {...field('email')}
              />
              <Input
                label="Phone Number *"
                required
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...field('phone')}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Street Address *"
                  required
                  placeholder="742 Evergreen Terrace"
                  {...field('address')}
                />
              </div>
              <Input label="City *" required placeholder="Springfield" {...field('city')} />
              <Input label="State *" required placeholder="IL" {...field('state')} />
              <Input label="Postal Code *" required placeholder="62701" {...field('postalCode')} />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-4 sm:p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Simulated Payment</h2>
            <p className="text-sm text-slate-600">
              Demo only. No card details are collected and no real charge is made. All orders reset
              on refresh.
            </p>
          </div>

          {/* Test scenario selector */}
          {SHOW_SCENARIOS && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-2">
                🧪 Demo: Choose checkout outcome
              </p>
              <div className="flex gap-2 flex-wrap">
                {(
                  [
                    { id: 'success', label: '✓ Success' },
                    { id: 'payment-failed', label: '✗ Payment Failed' },
                    { id: 'inventory-error', label: '⚠ Inventory Error' },
                  ] as { id: Scenario; label: string }[]
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={testScenario === s.id}
                    onClick={() => setTestScenario(s.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                      testScenario === s.id
                        ? 'bg-amber-700 text-white border-amber-700'
                        : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white border border-slate-100 rounded-xl p-5 sticky top-24">
            <h2 className="font-bold text-slate-900 text-base mb-4">Order Summary</h2>
            <div className="flex flex-col gap-3 mb-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 shrink-0">
                    <Image
                      src={item.product.imageUrl || undefined}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-slate-500">×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 shrink-0">
                    {formatCurrency(lineTotal(item.product.price, item.quantity))}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 text-sm mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-emerald-700 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-100 pt-2">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </div>
            <Button fullWidth size="lg" disabled={cartProblems.length > 0} type="submit">
              Place Demo Order · {formatCurrency(cartTotal)}
            </Button>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              Simulation only — no real charge
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
